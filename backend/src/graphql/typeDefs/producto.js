const { gql } = require('graphql-tag');

const productoTypeDefs = gql`
  type Producto {
    id: ID!
    codigo: String!
    nombre: String!
    descripcion: String
    categoria: Categoria!
    unidadMedida: String!
    stockActual: Float!
    stockMinimo: Float!
    precioCompra: Float!
    precioVenta: Float!
    precioPromedio: Float!
    imagen: String
    activo: Boolean!
    eliminado: Boolean!
    stockBajo: Boolean!
    createdAt: String
    updatedAt: String
  }

  type ProductosPaginados {
    productos: [Producto!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  input CrearProductoInput {
    codigo: String!
    nombre: String!
    descripcion: String
    categoriaId: ID!
    unidadMedida: String
    stockMinimo: Float
    precioCompra: Float!
    precioVenta: Float!
    imagen: String
  }

  input ActualizarProductoInput {
    nombre: String
    descripcion: String
    categoriaId: ID
    unidadMedida: String
    stockMinimo: Float
    precioCompra: Float
    precioVenta: Float
    imagen: String
    activo: Boolean
  }

  input FiltrosProducto {
    busqueda: String
    categoriaId: ID
    soloStockBajo: Boolean
    activo: Boolean
  }

  extend type Query {
    productos(filtros: FiltrosProducto, pagina: Int, limite: Int): ProductosPaginados!
    producto(id: ID!): Producto
    productosStockBajo: [Producto!]!
    buscarProductos(termino: String!): [Producto!]!
  }

  extend type Mutation {
    crearProducto(input: CrearProductoInput!): Producto!
    actualizarProducto(id: ID!, input: ActualizarProductoInput!): Producto!
    eliminarProducto(id: ID!): Boolean!
    restaurarProducto(id: ID!): Producto!
  }
`;

module.exports = productoTypeDefs;
