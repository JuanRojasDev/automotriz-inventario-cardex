const usuarioResolver = require('./usuarioResolver');
const categoriaResolver = require('./categoriaResolver');
const productoResolver = require('./productoResolver');
const movimientoResolver = require('./movimientoResolver');

// Merge resolvers manualmente
const resolvers = {
  Query: {
    ...usuarioResolver.Query,
    ...categoriaResolver.Query,
    ...productoResolver.Query,
    ...movimientoResolver.Query,
  },
  Mutation: {
    ...usuarioResolver.Mutation,
    ...categoriaResolver.Mutation,
    ...productoResolver.Mutation,
    ...movimientoResolver.Mutation,
  },
  Producto: productoResolver.Producto,
  Movimiento: movimientoResolver.Movimiento,
};

module.exports = resolvers;
