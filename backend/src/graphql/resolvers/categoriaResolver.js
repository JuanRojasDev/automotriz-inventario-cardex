const Categoria = require('../../models/Categoria');
const { requireAuth, requireAdmin } = require('../../middlewares/auth');
const logger = require('../../utils/logger');

const categoriaResolver = {
  Query: {
    categorias: async (_, __, context) => {
      requireAuth(context);
      return await Categoria.find({ activo: true }).sort({ nombre: 1 });
    },

    categoria: async (_, { id }, context) => {
      requireAuth(context);
      const cat = await Categoria.findById(id);
      if (!cat) throw new Error('Categoría no encontrada');
      return cat;
    },
  },

  Mutation: {
    crearCategoria: async (_, { input }, context) => {
      requireAdmin(context);

      const existente = await Categoria.findOne({ nombre: input.nombre });
      if (existente) throw new Error('Ya existe una categoría con ese nombre');

      const categoria = await Categoria.create(input);
      logger.operation(context.usuario.email, 'CREAR_CATEGORIA', categoria.nombre);
      return categoria;
    },

    actualizarCategoria: async (_, { id, input }, context) => {
      requireAdmin(context);

      const categoria = await Categoria.findByIdAndUpdate(id, input, { returnDocument: 'after', runValidators: true });
      if (!categoria) throw new Error('Categoría no encontrada');

      logger.operation(context.usuario.email, 'ACTUALIZAR_CATEGORIA', id);
      return categoria;
    },

    eliminarCategoria: async (_, { id }, context) => {
      requireAdmin(context);

      const categoria = await Categoria.findByIdAndUpdate(id, { activo: false }, { returnDocument: 'after' });
      if (!categoria) throw new Error('Categoría no encontrada');

      logger.operation(context.usuario.email, 'ELIMINAR_CATEGORIA', id);
      return true;
    },
  },
};

module.exports = categoriaResolver;
