const { gql } = require('graphql-tag');

const categoriaTypeDefs = gql`
  type Categoria {
    id: ID!
    nombre: String!
    descripcion: String
    activo: Boolean!
    createdAt: String
  }

  input CrearCategoriaInput {
    nombre: String!
    descripcion: String
  }

  input ActualizarCategoriaInput {
    nombre: String
    descripcion: String
    activo: Boolean
  }

  extend type Query {
    categorias: [Categoria!]!
    categoria(id: ID!): Categoria
  }

  extend type Mutation {
    crearCategoria(input: CrearCategoriaInput!): Categoria!
    actualizarCategoria(id: ID!, input: ActualizarCategoriaInput!): Categoria!
    eliminarCategoria(id: ID!): Boolean!
  }
`;

module.exports = categoriaTypeDefs;
