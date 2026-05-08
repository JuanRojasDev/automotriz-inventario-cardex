const Joi = require('joi');
const Producto = require('../../models/Producto');
const Categoria = require('../../models/Categoria');
const { requireAuth, requireAdmin, requireOperador } = require('../../middlewares/auth');
const logger = require('../../utils/logger');

const schemaProducto = Joi.object({
  codigo: Joi.string().min(1).max(50).required(),
  nombre: Joi.string().min(2).max(200).required(),
  descripcion: Joi.string().max(500).allow('', null),
  categoriaId: Joi.string().required(),
  unidadMedida: Joi.string().default('unidad'),
  stockMinimo: Joi.number().min(0).default(5),
  precioCompra: Joi.number().min(0).required(),
  precioVenta: Joi.number().min(0).required(),
  imagen: Joi.string().allow('', null),
});

const productoResolver = {
  Producto: {
    categoria: async (producto) => {
      return await Categoria.findById(producto.categoria);
    },
    stockBajo: (producto) => {
      return producto.stockActual <= producto.stockMinimo;
    },
  },

  Query: {
    productos: async (_, { filtros = {}, pagina = 1, limite = 10 }, context) => {
      requireAuth(context);

      const query = { eliminado: false };

      if (filtros.busqueda) {
        query.$or = [
          { nombre: { $regex: filtros.busqueda, $options: 'i' } },
          { codigo: { $regex: filtros.busqueda, $options: 'i' } },
          { descripcion: { $regex: filtros.busqueda, $options: 'i' } },
        ];
      }

      if (filtros.categoriaId) query.categoria = filtros.categoriaId;
      if (filtros.soloStockBajo) query.$expr = { $lte: ['$stockActual', '$stockMinimo'] };
      if (filtros.activo !== undefined) query.activo = filtros.activo;
      else query.activo = true;

      const skip = (pagina - 1) * limite;
      const [productos, total] = await Promise.all([
        Producto.find(query).sort({ nombre: 1 }).skip(skip).limit(limite),
        Producto.countDocuments(query),
      ]);

      return {
        productos,
        total,
        pagina,
        totalPaginas: Math.ceil(total / limite),
      };
    },

    producto: async (_, { id }, context) => {
      requireAuth(context);
      const producto = await Producto.findOne({ _id: id, eliminado: false });
      if (!producto) throw new Error('Producto no encontrado');
      return producto;
    },

    productosStockBajo: async (_, __, context) => {
      requireAuth(context);
      return await Producto.find({
        eliminado: false,
        activo: true,
        $expr: { $lte: ['$stockActual', '$stockMinimo'] },
      }).sort({ stockActual: 1 });
    },

    buscarProductos: async (_, { termino }, context) => {
      requireAuth(context);
      return await Producto.find({
        eliminado: false,
        activo: true,
        $or: [
          { nombre: { $regex: termino, $options: 'i' } },
          { codigo: { $regex: termino, $options: 'i' } },
        ],
      }).limit(20);
    },
  },

  Mutation: {
    crearProducto: async (_, { input }, context) => {
      requireOperador(context);

      const { error } = schemaProducto.validate(input);
      if (error) throw new Error(error.details[0].message);

      const existente = await Producto.findOne({ codigo: input.codigo.toUpperCase() });
      if (existente) throw new Error(`Ya existe un producto con el código ${input.codigo}`);

      const categoria = await Categoria.findById(input.categoriaId);
      if (!categoria) throw new Error('Categoría no encontrada');

      const { categoriaId, ...resto } = input;
      const producto = await Producto.create({
        ...resto,
        codigo: input.codigo.toUpperCase(),
        categoria: categoriaId,
        precioPromedio: input.precioCompra,
      });

      logger.operation(context.usuario.email, 'CREAR_PRODUCTO', `${producto.codigo} - ${producto.nombre}`);
      return await Producto.findById(producto._id);
    },

    actualizarProducto: async (_, { id, input }, context) => {
      requireOperador(context);

      const { categoriaId, ...resto } = input;
      const updateData = { ...resto };
      if (categoriaId) updateData.categoria = categoriaId;

      const producto = await Producto.findOneAndUpdate(
        { _id: id, eliminado: false },
        updateData,
        { returnDocument: 'after', runValidators: true }
      );

      if (!producto) throw new Error('Producto no encontrado');

      logger.operation(context.usuario.email, 'ACTUALIZAR_PRODUCTO', `${producto.codigo}`);
      return producto;
    },

    eliminarProducto: async (_, { id }, context) => {
      requireAdmin(context);

      const producto = await Producto.findOneAndUpdate(
        { _id: id, eliminado: false },
        { eliminado: true, activo: false, fechaEliminado: new Date() },
        { returnDocument: 'after' }
      );

      if (!producto) throw new Error('Producto no encontrado');

      logger.operation(context.usuario.email, 'ELIMINAR_PRODUCTO', `${producto.codigo}`);
      return true;
    },

    restaurarProducto: async (_, { id }, context) => {
      requireAdmin(context);

      const producto = await Producto.findOneAndUpdate(
        { _id: id, eliminado: true },
        { eliminado: false, activo: true, fechaEliminado: null },
        { returnDocument: 'after' }
      );

      if (!producto) throw new Error('Producto no encontrado o no está eliminado');

      logger.operation(context.usuario.email, 'RESTAURAR_PRODUCTO', `${producto.codigo}`);
      return producto;
    },
  },
};

module.exports = productoResolver;
