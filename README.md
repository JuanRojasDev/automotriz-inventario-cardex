# AOA - Sistema de Inventario y Kardex

Sistema de gestión de inventario con control de kardex para **Administración Operativa Automotriz (AOA)**. Permite llevar un control preciso del stock con entradas, salidas y precio promedio ponderado.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Backend | Node.js + Express + Apollo Server (GraphQL) |
| Frontend | React 19 + Vite + Tailwind CSS |
| Base de Datos | MongoDB + Mongoose |
| Autenticación | JWT |
| Gráficos | Recharts |
| Formularios | Formik + Yup |
| Exportación | xlsx (Excel) |

---

## Requisitos Previos

- Node.js >= 18
- MongoDB >= 6 (local o Atlas)
- npm >= 9

---

## Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd automotriz-inventario-cardex
```

### 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear el archivo `.env` (ya incluido en el proyecto):

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/inventario_kardex
JWT_SECRET=inventario_kardex_secret_2024_aoa_automotriz
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Iniciar MongoDB

Si tienes MongoDB instalado localmente:

```bash
# Windows (PowerShell como administrador)
& "C:\Program Files\MongoDB\Server\8.2\bin\mongod.exe" --dbpath "C:\data\db"

# O si está configurado como servicio:
Start-Service MongoDB
```

### 4. Poblar la base de datos (seed)

```bash
cd backend
npm run seed
```

Esto crea usuarios, categorías y productos de prueba.

### 5. Iniciar el Backend

```bash
cd backend
npm run dev    # Desarrollo con nodemon
# o
npm start      # Producción
```

El servidor queda en: `http://localhost:4000`
GraphQL Playground: `http://localhost:4000/graphql`

### 6. Configurar el Frontend

```bash
cd frontend
npm install
```

Crear el archivo `.env` (ya incluido):

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```

### 7. Iniciar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación queda en: `http://localhost:5173`

---

## Credenciales de Prueba

| Rol | Email | Contraseña | Permisos |
|---|---|---|---|
| Admin | admin@aoa.com | admin123 | Todo: CRUD productos, usuarios, movimientos |
| Operador | operador@aoa.com | oper123 | Crear/editar productos, registrar movimientos |
| Viewer | viewer@aoa.com | viewer123 | Solo lectura |

---

## Estructura del Proyecto

```
automotriz-inventario-cardex/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Conexión MongoDB
│   │   ├── graphql/
│   │   │   ├── resolvers/
│   │   │   │   ├── categoriaResolver.js
│   │   │   │   ├── movimientoResolver.js  # Lógica kardex
│   │   │   │   ├── productoResolver.js
│   │   │   │   └── usuarioResolver.js
│   │   │   └── typeDefs/
│   │   │       ├── categoria.js
│   │   │       ├── movimiento.js
│   │   │       ├── producto.js
│   │   │       └── usuario.js
│   │   ├── middlewares/
│   │   │   └── auth.js              # JWT middleware
│   │   ├── models/
│   │   │   ├── Categoria.js
│   │   │   ├── Movimiento.js        # Modelo kardex
│   │   │   ├── Producto.js
│   │   │   └── Usuario.js
│   │   ├── utils/
│   │   │   ├── kardexHelper.js      # Precio promedio ponderado
│   │   │   ├── logger.js            # Auditoría
│   │   │   └── seed.js              # Datos de prueba
│   │   └── index.js                 # Entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── apollo/
    │   │   ├── client.js            # Apollo Client + auth link
    │   │   └── queries.js           # Todas las queries/mutations GQL
    │   ├── components/
    │   │   ├── dashboard/MetricCard.jsx
    │   │   ├── layout/              # Layout, Sidebar, Header, ProtectedRoute
    │   │   ├── movimientos/FormularioMovimiento.jsx
    │   │   ├── productos/FormularioProducto.jsx
    │   │   └── ui/                  # Modal, ConfirmDialog, Pagination, Spinner, StockBadge
    │   ├── context/
    │   │   └── AuthContext.jsx      # Estado global de autenticación
    │   ├── hooks/
    │   │   └── useDebounce.js       # Hook de debounce reutilizable
    │   ├── pages/
    │   │   ├── Dashboard.jsx        # KPIs + gráficos
    │   │   ├── Kardex.jsx           # Historial completo + exportar Excel
    │   │   ├── Login.jsx
    │   │   ├── Movimientos.jsx      # Entradas y salidas
    │   │   ├── Productos.jsx        # CRUD productos
    │   │   ├── Reportes.jsx         # Reportes + gráficos + exportar
    │   │   └── Usuarios.jsx         # Gestión de usuarios (admin)
    │   └── utils/
    │       └── format.js            # formatCurrency, formatDate, etc.
    └── package.json
```

---

## Diagrama de Base de Datos

```
Usuario
├── nombre: String
├── email: String (unique)
├── password: String (bcrypt)
├── rol: enum[admin, operador, viewer]
└── activo: Boolean

Categoria
├── nombre: String (unique)
├── descripcion: String
└── activo: Boolean

Producto
├── codigo: String (unique, uppercase)
├── nombre: String
├── descripcion: String
├── categoria: ref → Categoria
├── unidadMedida: String
├── stockActual: Number
├── stockMinimo: Number
├── precioCompra: Number
├── precioVenta: Number
├── precioPromedio: Number  ← precio promedio ponderado
├── activo: Boolean
├── eliminado: Boolean      ← soft delete
└── [virtual] stockBajo: Boolean

Movimiento (Kardex)
├── producto: ref → Producto
├── tipo: enum[ENTRADA, SALIDA, AJUSTE]
├── cantidad: Number
├── precioUnitario: Number
├── stockAntes: Number      ← snapshot antes del movimiento
├── stockDespues: Number    ← snapshot después del movimiento
├── precioPromedioAntes: Number
├── precioPromedioDespues: Number
├── observacion: String
├── referencia: String
├── usuario: ref → Usuario  ← auditoría
└── fecha: Date
```

---

## Queries GraphQL de Ejemplo

### Login

```graphql
mutation {
  autenticarUsuario(email: "admin@aoa.com", password: "admin123") {
    token
    usuario {
      id
      nombre
      rol
    }
  }
}
```

### Listar Productos con Filtros

```graphql
query {
  productos(
    filtros: { soloStockBajo: true }
    pagina: 1
    limite: 10
  ) {
    productos {
      id
      codigo
      nombre
      stockActual
      stockMinimo
      stockBajo
      precioVenta
    }
    total
    totalPaginas
  }
}
```

### Registrar Entrada (Kardex)

```graphql
mutation {
  registrarMovimiento(input: {
    productoId: "<id>"
    tipo: ENTRADA
    cantidad: 20
    precioUnitario: 8500
    observacion: "Compra proveedor X"
    referencia: "FAC-001"
  }) {
    id
    tipo
    cantidad
    stockAntes
    stockDespues
    precioPromedioAntes
    precioPromedioDespues
  }
}
```

### Registrar Salida

```graphql
mutation {
  registrarMovimiento(input: {
    productoId: "<id>"
    tipo: SALIDA
    cantidad: 5
    precioUnitario: 12000
    observacion: "Venta cliente"
  }) {
    id
    stockAntes
    stockDespues
  }
}
```

### Historial Kardex por Producto

```graphql
query {
  movimientos(
    filtros: { productoId: "<id>", tipo: ENTRADA }
    pagina: 1
    limite: 20
  ) {
    movimientos {
      fecha
      tipo
      cantidad
      precioUnitario
      stockAntes
      stockDespues
      precioPromedioAntes
      precioPromedioDespues
      usuario { nombre }
    }
    total
  }
}
```

### Reporte del Inventario

```graphql
query {
  reporteInventario {
    totalProductos
    productosActivos
    productosStockBajo
    valorTotalInventario
    totalMovimientosHoy
  }
}
```

### Resumen de Movimientos (para gráficos)

```graphql
query {
  resumenMovimientos(dias: 30) {
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
```

---

## Lógica de Negocio

### Precio Promedio Ponderado

Al registrar una **entrada**, el precio promedio se recalcula:

```
nuevoPrecioPromedio = (stockActual × precioPromedio + cantidad × precioUnitario) / (stockActual + cantidad)
```

### Validaciones

- **Salidas**: No se permite registrar una salida si `cantidad > stockActual`
- **Cantidades**: Deben ser positivas (> 0)
- **Precios**: No pueden ser negativos
- **Stock mínimo**: Se genera alerta en logs cuando `stockDespues <= stockMinimo`

### Roles y Permisos

| Operación | Admin | Operador | Viewer |
|---|---|---|---|
| Ver productos/movimientos | ✅ | ✅ | ✅ |
| Crear/editar productos | ✅ | ✅ | ❌ |
| Registrar movimientos | ✅ | ✅ | ❌ |
| Eliminar/restaurar productos | ✅ | ❌ | ❌ |
| Gestionar usuarios | ✅ | ❌ | ❌ |
| Gestionar categorías | ✅ | ❌ | ❌ |

---

## Decisiones Técnicas

1. **Apollo Server Express v3**: Se eligió la versión 3 por compatibilidad con el patrón `applyMiddleware` de Express y soporte del playground integrado en desarrollo.

2. **Transacciones MongoDB**: El resolver de movimientos intenta usar transacciones si el servidor está en modo replica set. En modo standalone (desarrollo local), opera sin transacciones manteniendo la consistencia mediante operaciones secuenciales.

3. **Soft Delete**: Los productos se marcan como `eliminado: true` en lugar de borrarse físicamente, preservando el historial de movimientos.

4. **Precio Promedio Ponderado**: Se recalcula en cada entrada usando la fórmula estándar de inventario. Las salidas usan el precio de venta configurado.

5. **Context API**: Se usa React Context para el estado de autenticación en lugar de Redux, dado el alcance del proyecto.

6. **useDebounce Hook**: Las búsquedas en tiempo real usan un hook personalizado en lugar de `setTimeout` global para evitar memory leaks.

7. **Lazy Loading**: Todas las páginas se cargan con `React.lazy()` para optimizar el bundle inicial.
