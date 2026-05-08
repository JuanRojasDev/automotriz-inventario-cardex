const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

/**
 * Extrae y verifica el token JWT del header Authorization.
 * Retorna el usuario si el token es válido, null si no hay token.
 * Lanza error si el token es inválido o el usuario no existe.
 */
const getUsuarioDesdeToken = async (req) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');

    if (!usuario || !usuario.activo) {
      throw new Error('Usuario no encontrado o inactivo');
    }

    return usuario;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw error;
  }
};

/**
 * Middleware para requerir autenticación en resolvers GraphQL.
 * Lanza error si no hay usuario en el contexto.
 */
const requireAuth = (context) => {
  if (!context.usuario) {
    throw new Error('No autenticado. Por favor inicia sesión.');
  }
  return context.usuario;
};

/**
 * Middleware para requerir rol de admin.
 */
const requireAdmin = (context) => {
  const usuario = requireAuth(context);
  if (usuario.rol !== 'admin') {
    throw new Error('Acceso denegado. Se requiere rol de administrador.');
  }
  return usuario;
};

/**
 * Middleware para requerir rol de admin u operador.
 */
const requireOperador = (context) => {
  const usuario = requireAuth(context);
  if (!['admin', 'operador'].includes(usuario.rol)) {
    throw new Error('Acceso denegado. Se requiere rol de operador o administrador.');
  }
  return usuario;
};

module.exports = { getUsuarioDesdeToken, requireAuth, requireAdmin, requireOperador };
