const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Usuario = require('../../models/Usuario');
const { requireAuth, requireAdmin } = require('../../middlewares/auth');
const logger = require('../../utils/logger');

const schemaCrearUsuario = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  rol: Joi.string().valid('admin', 'operador', 'viewer').default('operador'),
});

const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const usuarioResolver = {
  Query: {
    usuarios: async (_, __, context) => {
      requireAdmin(context);
      return await Usuario.find({ activo: true }).sort({ createdAt: -1 });
    },

    usuario: async (_, { id }, context) => {
      requireAdmin(context);
      const usuario = await Usuario.findById(id);
      if (!usuario) throw new Error('Usuario no encontrado');
      return usuario;
    },

    yo: async (_, __, context) => {
      const usuario = requireAuth(context);
      return usuario;
    },
  },

  Mutation: {
    autenticarUsuario: async (_, { email, password }) => {
      const usuario = await Usuario.findOne({ email: email.toLowerCase() });

      if (!usuario || !usuario.activo) {
        throw new Error('Credenciales inválidas');
      }

      const passwordValido = await usuario.compararPassword(password);
      if (!passwordValido) {
        throw new Error('Credenciales inválidas');
      }

      const token = generarToken(usuario._id);
      logger.operation(usuario.email, 'LOGIN', 'Inicio de sesión exitoso');

      return { token, usuario };
    },

    crearUsuario: async (_, { input }, context) => {
      requireAdmin(context);

      const { error } = schemaCrearUsuario.validate(input);
      if (error) throw new Error(error.details[0].message);

      const existente = await Usuario.findOne({ email: input.email.toLowerCase() });
      if (existente) throw new Error('Ya existe un usuario con ese email');

      const usuario = await Usuario.create(input);
      logger.operation(context.usuario.email, 'CREAR_USUARIO', `Nuevo usuario: ${usuario.email}`);

      return usuario;
    },

    actualizarUsuario: async (_, { id, input }, context) => {
      requireAdmin(context);

      const usuario = await Usuario.findByIdAndUpdate(id, input, { returnDocument: 'after', runValidators: true });
      if (!usuario) throw new Error('Usuario no encontrado');

      logger.operation(context.usuario.email, 'ACTUALIZAR_USUARIO', `Usuario actualizado: ${id}`);
      return usuario;
    },

    cambiarPassword: async (_, { passwordActual, passwordNuevo }, context) => {
      const usuarioCtx = requireAuth(context);

      const usuario = await Usuario.findById(usuarioCtx._id);
      const valido = await usuario.compararPassword(passwordActual);
      if (!valido) throw new Error('Contraseña actual incorrecta');

      if (passwordNuevo.length < 6) throw new Error('La nueva contraseña debe tener al menos 6 caracteres');

      usuario.password = passwordNuevo;
      await usuario.save();

      logger.operation(usuario.email, 'CAMBIAR_PASSWORD', 'Contraseña actualizada');
      return true;
    },
  },
};

module.exports = usuarioResolver;
