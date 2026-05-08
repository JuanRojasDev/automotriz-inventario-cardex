const { gql } = require('graphql-tag');
const usuarioTypeDefs = require('./usuario');
const categoriaTypeDefs = require('./categoria');
const productoTypeDefs = require('./producto');
const movimientoTypeDefs = require('./movimiento');

const baseTypeDefs = gql`
  type Query {
    _empty: String
  }
  type Mutation {
    _empty: String
  }
`;

module.exports = [baseTypeDefs, usuarioTypeDefs, categoriaTypeDefs, productoTypeDefs, movimientoTypeDefs];
