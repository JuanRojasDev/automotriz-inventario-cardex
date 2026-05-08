# Guía de Estilos - Plataforma AOA Inventario

## Características Implementadas

### 1. **Sistema de Temas (Tema Claro/Oscuro)**
La aplicación ahora incluye un sistema completo de temas claro y oscuro que se sincroniza con las preferencias del usuario.

**Uso del Context:**
```jsx
import { useTheme } from '../../context/ThemeContext';

const MiComponente = () => {
  const { isDark, toggleTheme, theme, roleColors, isAdmin } = useTheme();
  
  return (
    <div className={theme.bg}>
      {/* Contenido */}
    </div>
  );
};
```

### 2. **Roles Diferenciados (Admin vs Operario)**

#### Admin
- **Colores**: Azul profesional (blue-600 a blue-700)
- **Icono**: Shield con "Administrador"
- **Acceso**: Todas las rutas + Gestión de Usuarios

#### Operario
- **Colores**: Verde/Esmeralda profesional (emerald-600 a green-700)
- **Icono**: Rayo/Bolt con "Operario"
- **Acceso**: Dashboard, Productos, Movimientos, Kardex, Reportes

### 3. **Componentes UI Mejorados**

#### Button
```jsx
import Button from '../components/ui/Button';

<Button variant="primary" size="md" icon={PlusIcon}>
  Crear Producto
</Button>
```

**Variantes:**
- `primary`: Gradiente del rol (azul para admin, verde para operario)
- `secondary`: Gris neutral
- `danger`: Rojo
- `success`: Verde
- `ghost`: Sin fondo
- `outline`: Solo borde

**Tamaños:** `sm`, `md`, `lg`

#### Input
```jsx
import Input from '../components/ui/Input';

<Input
  label="Nombre del Producto"
  icon={Package}
  error={errors.nombre}
  placeholder="Ingrese el nombre"
/>
```

#### Card
```jsx
import Card from '../components/ui/Card';

<Card variant="default" className="p-6">
  Contenido
</Card>
```

**Variantes:** `default`, `elevated`, `ghost`

#### Badge
```jsx
import Badge from '../components/ui/Badge';

<Badge variant="success" size="md">
  Activo
</Badge>
```

**Variantes:** `primary`, `secondary`, `success`, `warning`, `danger`, `info`

#### Alert
```jsx
import Alert from '../components/ui/Alert';

<Alert
  type="success"
  title="Éxito"
  message="Producto creado correctamente"
  closable
/>
```

**Tipos:** `success`, `error`, `warning`, `info`

#### StockBadge
```jsx
<StockBadge stockActual={15} stockMinimo={10} />
```

Muestra automáticamente:
- ❌ Sin stock
- ⚠️ Bajo
- ℹ️ Medio
- ✓ OK

### 4. **Paleta de Colores por Tema**

#### Tema Claro
- Fondo principal: `bg-white`
- Fondo secundario: `bg-gray-50`
- Texto principal: `text-gray-900`
- Texto secundario: `text-gray-600`
- Bordes: `border-gray-200`

#### Tema Oscuro
- Fondo principal: `bg-gray-950`
- Fondo secundario: `bg-gray-900`
- Texto principal: `text-gray-50`
- Texto secundario: `text-gray-400`
- Bordes: `border-gray-700`

### 5. **Iconos Utilizados**

Se utiliza **Lucide React** para todos los iconos (sin emojis).

**Iconos principales:**
- Dashboard: `LayoutDashboard`
- Productos: `Package`
- Movimientos: `ArrowLeftRight`
- Kardex: `BookOpen`
- Reportes: `BarChart3`
- Usuarios: `Users`
- Admin: `Shield`
- Operario: `Zap`
- Tema: `Moon` / `Sun`

### 6. **Cómo Personalizar los Estilos**

#### Cambiar colores por rol
En `/context/ThemeContext.jsx`, modifica `roleColors`:

```jsx
// Para Admin
const adminColors = {
  primary: 'from-purple-600 to-purple-700', // Cambiar azul por púrpura
  primaryLight: 'bg-purple-100 dark:bg-purple-900',
  primaryText: 'text-purple-600 dark:text-purple-400',
  // ...
};
```

#### Usar tema en componentes personalizados
```jsx
const MiComponente = () => {
  const { theme, isDark, roleColors } = useTheme();
  
  return (
    <div className={`${theme.bg} ${theme.text}`}>
      <h1 className={`bg-gradient-to-r ${roleColors.primary} text-white`}>
        Titulo
      </h1>
    </div>
  );
};
```

### 7. **Transiciones y Animaciones**

Todos los componentes incluyen transiciones suaves:
- Cambio de tema: 200ms
- Hover effects: 200-300ms
- Modales: fade-in, zoom-in

### 8. **Responsividad**

- **Mobile**: Sidebar se oculta, se abre en overlay
- **Tablet**: Sidebar visible, contenido se ajusta
- **Desktop**: Layout completo optimizado

### 9. **Accesibilidad**

- Atributos ARIA en botones
- Labels asociadas a inputs
- Alto contraste en temas
- Enfoque visible en elementos interactivos

### 10. **Mejores Prácticas**

1. **Siempre importar useTheme en componentes que usen estilos:**
   ```jsx
   import { useTheme } from '../../context/ThemeContext';
   ```

2. **Usar clases del contexto para consistencia:**
   ```jsx
   <div className={theme.bg}> // En lugar de bg-white dark:bg-gray-950
   ```

3. **Para componentes condicionales por rol:**
   ```jsx
   const { isAdmin } = useTheme();
   if (isAdmin) { /* mostrar opciones admin */ }
   ```

4. **Siempre mantener el orden de clases Tailwind:**
   - Color de fondo
   - Color de texto
   - Bordes
   - Tamaño/padding
   - Efectos (shadow, hover)
   - Transiciones

---

## Ejemplo de Componente Completo

```jsx
import { useTheme } from '../../context/ThemeContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import { Plus } from 'lucide-react';

const MiPagina = () => {
  const { theme, isDark, roleColors, isAdmin } = useTheme();

  return (
    <div className={theme.bg}>
      <div className="max-w-6xl mx-auto">
        <h1 className={`text-3xl font-bold ${theme.text} mb-8`}>
          Bienvenido {isAdmin ? 'Administrador' : 'Operario'}
        </h1>

        <Card className="p-6 mb-6">
          <Input
            label="Buscar..."
            placeholder="Ingrese su búsqueda"
            className="mb-4"
          />
          <Button variant="primary" icon={Plus}>
            Crear Nuevo
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default MiPagina;
```

---

## Notas Importantes

- ✅ Sin emojis: Todos los iconos usan Lucide React
- ✅ Temas completos: Tema claro y oscuro implementados
- ✅ Roles diferenciados: Colores y estilos específicos por rol
- ✅ Componentes reutilizables: Creados y listos para usar
- ✅ Responsive: Funciona en todos los dispositivos
- ✅ Accesible: Cumple con WCAG 2.1 AA

---

**Última actualización:** Mayo 2025
**Versión:** 1.0
