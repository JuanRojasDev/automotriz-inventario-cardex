const Joi = require('joi');
const mongoose = require('mongoose');
const Movimiento = require('../../models/Movimiento');
const Producto = require('../../models/Producto');
const Usuario = require('../../models/Usuario');
const { requireAuth, requireOperador } = require('../../middlewares/auth');
const { calcularPrecioPromedio, calcularNuevoStock, validarStockSuficiente } = require('../../utils/kardexHelper');
const logger = require('../../utils/logger');

const schemaMovimiento = Joi.object({
  productoId: Joi.string().required(),
  tipo: Joi.string().valid('ENTRADA', 'SALIDA', 'AJUSTE').required(),
  cantidad: Joi.number().min(1).required(),
  precioUnitario: Joi.number().min(0).required(),
  observacion: Joi.string().max(500).allow('', null),
  referencia: Joi.string().max(100).allow('', null),
});

const movimientoResolver = {
  Movimiento: {
    producto: async (mov) => await Producto.findById(mov.producto),
    usuario: async (mov) => await Usuario.findById(mov.usuario),
    fecha: (mov) => mov.fecha ? new Date(mov.fecha).toISOString() : null,
    createdAt: (mov) => mov.createdAt ? new Date(mov.createdAt).toISOString() : null,
  },

  Query: {
    movimientos: async (_, { filtros = {}, pagina = 1, limite = 20 }, context) => {
      requireAuth(context);

      const query = {};
      if (filtros.productoId) query.producto = filtros.productoId;
      if (filtros.tipo) query.tipo = filtros.tipo;
      if (filtros.usuarioId) query.usuario = filtros.usuarioId;

      if (filtros.fechaDesde || filtros.fechaHasta) {
        query.fecha = {};
        if (filtros.fechaDesde) query.fecha.$gte = new Date(filtros.fechaDesde);
        if (filtros.fechaHasta) {
          const hasta = new Date(filtros.fechaHasta);
          hasta.setHours(23, 59, 59, 999);
          query.fecha.$lte = hasta;
        }
      }

      const skip = (pagina - 1) * limite;
      const [movimientos, total] = await Promise.all([
        Movimiento.find(query).sort({ fecha: -1 }).skip(skip).limit(limite),
        Movimiento.countDocuments(query),
      ]);

      return { movimientos, total, pagina, totalPaginas: Math.ceil(total / limite) };
    },

    movimientosPorProducto: async (_, { productoId, pagina = 1, limite = 20 }, context) => {
      requireAuth(context);

      const skip = (pagina - 1) * limite;
      const query = { producto: productoId };

      const [movimientos, total] = await Promise.all([
        Movimiento.find(query).sort({ fecha: -1 }).skip(skip).limit(limite),
        Movimiento.countDocuments(query),
      ]);

      return { movimientos, total, pagina, totalPaginas: Math.ceil(total / limite) };
    },

    movimiento: async (_, { id }, context) => {
      requireAuth(context);
      const mov = await Movimiento.findById(id);
      if (!mov) throw new Error('Movimiento no encontrado');
      return mov;
    },

    resumenMovimientos: async (_, { dias = 30 }, context) => {
      requireAuth(context);

      const fechaDesde = new Date();
      fechaDesde.setDate(fechaDesde.getDate() - dias);

      const movimientos = await Movimiento.find({
        fecha: { $gte: fechaDesde },
        tipo: { $in: ['ENTRADA', 'SALIDA'] },
      }).sort({ fecha: 1 });

      let totalEntradas = 0;
      let totalSalidas = 0;
      let cantidadEntradas = 0;
      let cantidadSalidas = 0;
      const porDia = {};

      movimientos.forEach((m) => {
        const dia = new Date(m.fecha).toISOString().split('T')[0];
        if (!porDia[dia]) porDia[dia] = { fecha: dia, entradas: 0, salidas: 0 };

        if (m.tipo === 'ENTRADA') {
          totalEntradas += m.cantidad;
          cantidadEntradas++;
          porDia[dia].entradas += m.cantidad;
        } else {
          totalSalidas += m.cantidad;
          cantidadSalidas++;
          porDia[dia].salidas += m.cantidad;
        }
      });

      return {
        totalEntradas,
        totalSalidas,
        cantidadEntradas,
        cantidadSalidas,
        movimientosPorDia: Object.values(porDia),
      };
    },

    reporteInventario: async (_, __, context) => {
      requireAuth(context);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const [totalProductos, productosActivos, productosStockBajo, valorInventario, movimientosHoy] =
        await Promise.all([
          Producto.countDocuments({ eliminado: false }),
          Producto.countDocuments({ eliminado: false, activo: true }),
          Producto.countDocuments({
            eliminado: false,
            activo: true,
            $expr: { $lte: ['$stockActual', '$stockMinimo'] },
          }),
          Producto.aggregate([
            { $match: { eliminado: false, activo: true } },
            { $group: { _id: null, total: { $sum: { $multiply: ['$stockActual', '$precioPromedio'] } } } },
          ]),
          Movimiento.countDocuments({ fecha: { $gte: hoy } }),
        ]);

      return {
        totalProductos,
        productosActivos,
        productosStockBajo,
        valorTotalInventario: valorInventario[0]?.total || 0,
        totalMovimientosHoy: movimientosHoy,
      };
    },

    topProductosMovidos: async (_, { limite = 5 }, context) => {
      requireAuth(context);

      const top = await Movimiento.aggregate([
        {
          $group: {
            _id: '$producto',
            totalMovimientos: { $sum: 1 },
            totalEntradas: {
              $sum: { $cond: [{ $eq: ['$tipo', 'ENTRADA'] }, '$cantidad', 0] },
            },
            totalSalidas: {
              $sum: { $cond: [{ $eq: ['$tipo', 'SALIDA'] }, '$cantidad', 0] },
            },
          },
        },
        { $sort: { totalMovimientos: -1 } },
        { $limit: limite },
      ]);

      const result = await Promise.all(
        top.map(async (item) => ({
          producto: await Producto.findById(item._id),
          totalMovimientos: item.totalMovimientos,
          totalEntradas: item.totalEntradas,
          totalSalidas: item.totalSalidas,
        }))
      );

      return result.filter((r) => r.producto !== null);
    },
  },

  Mutation: {
    registrarMovimiento: async (_, { input }, context) => {
      requireOperador(context);

      const { error } = schemaMovimiento.validate(input);
      if (error) throw new Error(error.details[0].message);

      // Intentar usar sesión de MongoDB para transacción (requiere replica set)
      let session = null;
      let useTransaction = false;

      try {
        session = await mongoose.startSession();
        // Verificar si el servidor soporta transacciones
        const serverInfo = await mongoose.connection.db.admin().serverStatus();
        useTransaction = serverInfo.repl !== undefined;
        if (useTransaction) {
          session.startTransaction();
        }
      } catch {
        // Si no se puede obtener info del servidor, continuar sin transacción
        session = null;
        useTransaction = false;
      }

      try {
        const queryOptions = session ? { session } : {};

        const producto = await Producto.findOne({
          _id: input.productoId,
          eliminado: false,
          activo: true,
        }, null, queryOptions);

        if (!producto) throw new Error('Producto no encontrado o inactivo');

        // Validar stock suficiente en salidas
        if (input.tipo === 'SALIDA') {
          validarStockSuficiente(producto.stockActual, input.cantidad);
        }

        const stockAntes = producto.stockActual;
        const precioPromedioAntes = producto.precioPromedio;

        // Calcular nuevo stock
        const stockDespues = calcularNuevoStock(stockAntes, input.tipo, input.cantidad);

        // Calcular nuevo precio promedio (solo en entradas)
        let precioPromedioDespues = precioPromedioAntes;
        if (input.tipo === 'ENTRADA') {
          precioPromedioDespues = calcularPrecioPromedio(
            stockAntes,
            precioPromedioAntes,
            input.cantidad,
            input.precioUnitario
          );
        }

        // Crear el movimiento (kardex)
        let movimiento;
        if (session) {
          const [mov] = await Movimiento.create(
            [
              {
                producto: input.productoId,
                tipo: input.tipo,
                cantidad: input.cantidad,
                precioUnitario: input.precioUnitario,
                stockAntes,
                stockDespues,
                precioPromedioAntes,
                precioPromedioDespues,
                observacion: input.observacion,
                referencia: input.referencia,
                usuario: context.usuario._id,
                fecha: new Date(),
              },
            ],
            { session }
          );
          movimiento = mov;
        } else {
          movimiento = await Movimiento.create({
            producto: input.productoId,
            tipo: input.tipo,
            cantidad: input.cantidad,
            precioUnitario: input.precioUnitario,
            stockAntes,
            stockDespues,
            precioPromedioAntes,
            precioPromedioDespues,
            observacion: input.observacion,
            referencia: input.referencia,
            usuario: context.usuario._id,
            fecha: new Date(),
          });
        }

        // Actualizar el producto
        await Producto.findByIdAndUpdate(
          input.productoId,
          {
            stockActual: stockDespues,
            precioPromedio: precioPromedioDespues,
          },
          session ? { session, returnDocument: 'after' } : { returnDocument: 'after' }
        );

        if (useTransaction && session) {
          await session.commitTransaction();
        }
        if (session) session.endSession();

        // Alerta de stock bajo
        if (stockDespues <= producto.stockMinimo) {
          logger.warn(
            `STOCK BAJO`,
            `Producto: ${producto.nombre} (${producto.codigo}) - Stock: ${stockDespues}/${producto.stockMinimo}`
          );
        }

        logger.operation(
          context.usuario.email,
          `MOVIMIENTO_${input.tipo}`,
          `Producto: ${producto.codigo} | Cant: ${input.cantidad} | Stock: ${stockAntes} → ${stockDespues}`
        );

        return movimiento;
      } catch (err) {
        if (useTransaction && session) {
          await session.abortTransaction();
        }
        if (session) session.endSession();
        throw err;
      }
    },
  },
};

module.exports = movimientoResolver;
