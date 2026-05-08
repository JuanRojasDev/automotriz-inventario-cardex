import { gql } from '@apollo/client';

// ==================== AUTH ====================
export const LOGIN_MUTATION = gql`
  mutation AutenticarUsuario($email: String!, $password: String!) {
    autenticarUsuario(email: $email, password: $password) {
      token
      usuario {
        id
        nombre
        email
        rol
      }
    }
  }
`;

export const GET_YO = gql`
  query Yo {
    yo {
      id
      nombre
      email
      rol
    }
  }
`;

// ==================== USUARIOS ====================
export const GET_USUARIOS = gql`
  query Usuarios {
    usuarios {
      id
      nombre
      email
      rol
      activo
      createdAt
    }
  }
`;

export const CREAR_USUARIO = gql`
  mutation CrearUsuario($input: CrearUsuarioInput!) {
    crearUsuario(input: $input) {
      id
      nombre
      email
      rol
    }
  }
`;

// ==================== CATEGORIAS ====================
export const GET_CATEGORIAS = gql`
  query Categorias {
    categorias {
      id
      nombre
      descripcion
    }
  }
`;

export const CREAR_CATEGORIA = gql`
  mutation CrearCategoria($input: CrearCategoriaInput!) {
    crearCategoria(input: $input) {
      id
      nombre
    }
  }
`;

// ==================== PRODUCTOS ====================
export const GET_PRODUCTOS = gql`
  query Productos($filtros: FiltrosProducto, $pagina: Int, $limite: Int) {
    productos(filtros: $filtros, pagina: $pagina, limite: $limite) {
      productos {
        id
        codigo
        nombre
        descripcion
        categoria {
          id
          nombre
        }
        unidadMedida
        stockActual
        stockMinimo
        precioCompra
        precioVenta
        precioPromedio
        activo
        eliminado
        stockBajo
      }
      total
      pagina
      totalPaginas
    }
  }
`;

export const GET_PRODUCTO = gql`
  query Producto($id: ID!) {
    producto(id: $id) {
      id
      codigo
      nombre
      descripcion
      categoria {
        id
        nombre
      }
      unidadMedida
      stockActual
      stockMinimo
      precioCompra
      precioVenta
      precioPromedio
      activo
      stockBajo
    }
  }
`;

export const GET_PRODUCTOS_STOCK_BAJO = gql`
  query ProductosStockBajo {
    productosStockBajo {
      id
      codigo
      nombre
      stockActual
      stockMinimo
      precioCompra
      precioVenta
      precioPromedio
      categoria {
        nombre
      }
    }
  }
`;

export const BUSCAR_PRODUCTOS = gql`
  query BuscarProductos($termino: String!) {
    buscarProductos(termino: $termino) {
      id
      codigo
      nombre
      stockActual
      unidadMedida
      precioVenta
      precioPromedio
    }
  }
`;

export const CREAR_PRODUCTO = gql`
  mutation CrearProducto($input: CrearProductoInput!) {
    crearProducto(input: $input) {
      id
      codigo
      nombre
      stockActual
    }
  }
`;

export const ACTUALIZAR_PRODUCTO = gql`
  mutation ActualizarProducto($id: ID!, $input: ActualizarProductoInput!) {
    actualizarProducto(id: $id, input: $input) {
      id
      codigo
      nombre
      stockActual
      precioVenta
    }
  }
`;

export const ELIMINAR_PRODUCTO = gql`
  mutation EliminarProducto($id: ID!) {
    eliminarProducto(id: $id)
  }
`;

export const RESTAURAR_PRODUCTO = gql`
  mutation RestaurarProducto($id: ID!) {
    restaurarProducto(id: $id) {
      id
      nombre
    }
  }
`;

// ==================== MOVIMIENTOS ====================
export const GET_MOVIMIENTOS = gql`
  query Movimientos($filtros: FiltrosMovimiento, $pagina: Int, $limite: Int) {
    movimientos(filtros: $filtros, pagina: $pagina, limite: $limite) {
      movimientos {
        id
        producto {
          id
          codigo
          nombre
        }
        tipo
        cantidad
        precioUnitario
        stockAntes
        stockDespues
        precioPromedioAntes
        precioPromedioDespues
        observacion
        referencia
        usuario {
          nombre
        }
        fecha
      }
      total
      pagina
      totalPaginas
    }
  }
`;

export const GET_MOVIMIENTOS_PRODUCTO = gql`
  query MovimientosPorProducto($productoId: ID!, $pagina: Int, $limite: Int) {
    movimientosPorProducto(productoId: $productoId, pagina: $pagina, limite: $limite) {
      movimientos {
        id
        tipo
        cantidad
        precioUnitario
        stockAntes
        stockDespues
        precioPromedioAntes
        precioPromedioDespues
        observacion
        referencia
        usuario {
          nombre
        }
        fecha
      }
      total
      pagina
      totalPaginas
    }
  }
`;

export const REGISTRAR_MOVIMIENTO = gql`
  mutation RegistrarMovimiento($input: RegistrarMovimientoInput!) {
    registrarMovimiento(input: $input) {
      id
      tipo
      cantidad
      stockAntes
      stockDespues
      fecha
    }
  }
`;

// ==================== DASHBOARD ====================
export const GET_REPORTE_INVENTARIO = gql`
  query ReporteInventario {
    reporteInventario {
      totalProductos
      productosActivos
      productosStockBajo
      valorTotalInventario
      totalMovimientosHoy
    }
  }
`;

export const GET_RESUMEN_MOVIMIENTOS = gql`
  query ResumenMovimientos($dias: Int) {
    resumenMovimientos(dias: $dias) {
      totalEntradas
      totalSalidas
      cantidadEntradas
      cantidadSalidas
      movimientosPorDia {
        fecha
        entradas
        salidas
      }
    }
  }
`;

export const GET_TOP_PRODUCTOS = gql`
  query TopProductosMovidos($limite: Int) {
    topProductosMovidos(limite: $limite) {
      producto {
        id
        nombre
        codigo
      }
      totalMovimientos
      totalEntradas
      totalSalidas
    }
  }
`;
