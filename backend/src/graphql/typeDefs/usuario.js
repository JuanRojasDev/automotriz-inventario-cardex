const { gql } = require('graphql-tag');

const usuarioTypeDefs = gql`
  type Usuario {
    id: ID!
    nombre: String!
    email: String!
    rol: RolUsuario!
    activo: Boolean!
    createdAt: String
    updatedAt: String
  }

  enum RolUsuario {
    admin
    operador
    viewer
  }

  type AuthPayload {
    token: String!
    usuario: Usuario!
  }

  input CrearUsuarioInput {
    nombre: String!
    email: String!
    password: String!
    rol: RolUsuario
  }

  input ActualizarUsuarioInput {
    nombre: String
    email: String
    rol: RolUsuario
    activo: Boolean
  }

  extend type Query {
    usuarios: [Usuario!]!
    usuario(id: ID!): Usuario
    yo: Usuario
  }

  extend type Mutation {
    autenticarUsuario(email: String!, password: String!): AuthPayload!
    crearUsuario(input: CrearUsuarioInput!): Usuario!
    actualizarUsuario(id: ID!, input: ActualizarUsuarioInput!): Usuario!
    cambiarPassword(passwordActual: String!, passwordNuevo: String!): Boolean!
  }
`;

module.exports = usuarioTypeDefs;
