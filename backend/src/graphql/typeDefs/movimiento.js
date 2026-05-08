const { gql } = require('graphql-tag');

const movimientoTypeDefs = gql`
  type Movimiento {
    id: ID!
    producto: Producto!
    tipo: TipoMovimiento!
    cantidad: Float!
    precioUnitario: Float!
    stockAntes: Float!
    stockDespues: Float!
    precioPromedioAntes: Float!
    precioPromedioDespues: Float!
    observacion: String
    referencia: String
    usuario: Usuario!
    fecha: String!
    createdAt: String
  }

  enum TipoMovimiento {
    ENTRADA
    SALIDA
    AJUSTE
  }

  type MovimientosPaginados {
    movimientos: [Movimiento!]!
    total: Int!
    pagina: Int!
    totalPaginas: Int!
  }

  type ResumenMovimientos {
    totalEntradas: Float!
    totalSalidas: Float!
    cantidadEntradas: Int!
    cantidadSalidas: Int!
    movimientosPorDia: [MovimientoDia!]!
  }

  type MovimientoDia {
    fecha: String!
    entradas: Float!
    salidas: Float!
  }

  type ReporteInventario {
    totalProductos: Int!
    productosActivos: Int!
    productosStockBajo: Int!
    valorTotalInventario: Float!
    totalMovimientosHoy: Int!
  }

  type TopProducto {
    producto: Producto!
    totalMovimientos: Int!
    totalEntradas: Float!
    totalSalidas: Float!
  }

  input RegistrarMovimientoInput {
    productoId: ID!
    tipo: TipoMovimiento!
    cantidad: Float!
    precioUnitario: Float!
    observacion: String
    referencia: String
  }

  input FiltrosMovimiento {
    productoId: ID
    tipo: TipoMovimiento
    fechaDesde: String
    fechaHasta: String
    usuarioId: ID
  }

  extend type Query {
    movimientos(filtros: FiltrosMovimiento, pagina: Int, limite: Int): MovimientosPaginados!
    movimientosPorProducto(productoId: ID!, pagina: Int, limite: Int): MovimientosPaginados!
    movimiento(id: ID!): Movimiento
    resumenMovimientos(dias: Int): ResumenMovimientos!
    reporteInventario: ReporteInventario!
    topProductosMovidos(limite: Int): [TopProducto!]!
  }

  extend type Mutation {
    registrarMovimiento(input: RegistrarMovimientoInput!): Movimiento!
  }
`;

module.exports = movimientoTypeDefs;
