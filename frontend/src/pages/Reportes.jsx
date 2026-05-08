import { useQuery } from '@apollo/client';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import {
  Package, CheckCircle, AlertTriangle, DollarSign,
  TrendingUp, TrendingDown, Download, AlertCircle
} from 'lucide-react';
import {
  GET_REPORTE_INVENTARIO, GET_RESUMEN_MOVIMIENTOS, GET_PRODUCTOS_STOCK_BAJO, GET_TOP_PRODUCTOS
} from '../apollo/queries';
import { useTheme } from '../context/ThemeContext';
import Spinner from '../components/ui/Spinner';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import { formatCurrency } from '../utils/format';

const Reportes = () => {
  const { theme, isDark, roleColors } = useTheme();
  const { data: reporte, loading: l1 } = useQuery(GET_REPORTE_INVENTARIO, { fetchPolicy: 'network-only' });
  const { data: resumen, loading: l2 } = useQuery(GET_RESUMEN_MOVIMIENTOS, { variables: { dias: 30 } });
  const { data: stockBajo } = useQuery(GET_PRODUCTOS_STOCK_BAJO);
  const { data: topData } = useQuery(GET_TOP_PRODUCTOS, { variables: { limite: 10 } });

  if (l1 || l2) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>;

  const r = reporte?.reporteInventario;
  const res = resumen?.resumenMovimientos;

  const pieData = [
    { name: 'Stock Normal', value: (r?.productosActivos || 0) - (r?.productosStockBajo || 0) },
    { name: 'Stock Bajo', value: r?.productosStockBajo || 0 },
  ];

  const cardColor = isDark ? '#1F2937' : '#FFFFFF';
  const textColor = isDark ? '#F3F4F6' : '#111827';
  const gridColor = isDark ? '#374151' : '#E5E7EB';

  const exportarInventario = () => {
    const productos = stockBajo?.productosStockBajo || [];
    if (productos.length === 0) { toast.error('Sin productos con stock bajo'); return; }

    const rows = productos.map((p) => ({
      Código: p.codigo,
      Nombre: p.nombre,
      Categoría: p.categoria?.nombre,
      'Stock Actual': p.stockActual,
      'Stock Mínimo': p.stockMinimo,
      'Déficit': Math.max(0, p.stockMinimo - p.stockActual),
      'Precio Compra': p.precioCompra,
      'Precio Venta': p.precioVenta,
      'Precio Promedio': p.precioPromedio,
      'Valor en Inventario': p.stockActual * p.precioPromedio,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock Bajo');
    XLSX.writeFile(wb, `stock_bajo_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success(`${rows.length} producto(s) exportados`);
  };

  const metricas = [
    { 
      label: 'Total Productos', 
      value: r?.totalProductos, 
      icon: Package,
      color: 'blue'
    },
    { 
      label: 'Productos Activos', 
      value: r?.productosActivos, 
      icon: CheckCircle,
      color: 'success'
    },
    { 
      label: 'Stock Bajo', 
      value: r?.productosStockBajo, 
      icon: AlertTriangle,
      color: 'warning'
    },
    { 
      label: 'Valor Inventario', 
      value: formatCurrency(r?.valorTotalInventario || 0), 
      icon: DollarSign,
      color: 'info'
    },
  ];

  return (
    <div className={`${theme.bg} transition-colors duration-200 rounded-lg`}>
      <div className="space-y-6">
        {/* Resumen ejecutivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricas.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="text-center" variant="elevated">
                <div className="flex flex-col items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${
                    item.color === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                    item.color === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30' :
                    item.color === 'info' ? 'bg-blue-100 dark:bg-blue-900/30' :
                    'bg-slate-100 dark:bg-slate-800'
                  }`}>
                    <Icon size={24} className={
                      item.color === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                      item.color === 'warning' ? 'text-amber-600 dark:text-amber-400' :
                      item.color === 'info' ? 'text-blue-600 dark:text-blue-400' :
                      'text-slate-600 dark:text-slate-400'
                    } />
                  </div>
                  <p className={`text-3xl font-bold ${theme.text}`}>{item.value}</p>
                  <p className={`text-xs ${theme.textSecondary} mt-1 font-semibold`}>{item.label}</p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Movimientos 30 días */}
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <h2 className={`font-bold text-lg ${theme.text}`}>Movimientos últimos 30 días</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Card className="p-3 text-center" variant="ghost">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{res?.cantidadEntradas || 0}</p>
                <p className={`text-xs ${theme.textSecondary} mt-1 font-semibold`}>Entradas ({res?.totalEntradas || 0} uds)</p>
              </Card>
              <Card className="p-3 text-center" variant="ghost">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingDown size={18} className="text-red-600 dark:text-red-400" />
                </div>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{res?.cantidadSalidas || 0}</p>
                <p className={`text-xs ${theme.textSecondary} mt-1 font-semibold`}>Salidas ({res?.totalSalidas || 0} uds)</p>
              </Card>
            </div>
            {res?.movimientosPorDia?.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={res.movimientosPorDia.slice(-14).map(d => ({
                  ...d,
                  fecha: new Date(d.fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' })
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                  <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0.5rem', color: isDark ? '#f1f5f9' : '#0f172a' }} />
                  <Legend wrapperStyle={{ color: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }} />
                  <Bar dataKey="entradas" fill="#10B981" name="Entradas" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="salidas" fill="#EF4444" name="Salidas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className={`text-center ${theme.textSecondary} text-sm py-8`}>Sin movimientos en el período</p>
            )}
          </Card>

          {/* Estado del inventario */}
          <Card variant="elevated">
            <h2 className={`font-bold text-lg ${theme.text} mb-4`}>Estado del Inventario</h2>
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%" cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#10B981' : '#F59E0B'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: isDark ? '#1e293b' : '#fff',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                      borderRadius: '0.5rem',
                      color: isDark ? '#f1f5f9' : '#0f172a',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className={`w-full flex justify-center gap-6 pt-2 border-t ${theme.border}`}>
                {pieData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ background: i === 0 ? '#10B981' : '#F59E0B' }} />
                    <span className={`text-sm ${theme.textSecondary}`}>{entry.name}:</span>
                    <span className={`text-sm font-bold ${i === 0 ? 'text-emerald-500' : 'text-amber-500'}`}>{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Top productos */}
        {topData?.topProductosMovidos?.length > 0 && (
          <Card variant="elevated">
            <h2 className={`font-bold text-lg ${theme.text} mb-4`}>Top 10 Productos más Movidos</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                    <th className={`text-left px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>#</th>
                    <th className={`text-left px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Producto</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Movimientos</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Entradas</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Salidas</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {topData.topProductosMovidos.map((t, i) => (
                    <tr key={t.producto?.id} className={`${theme.hover} transition-colors`}>
                      <td className={`px-4 py-3 font-bold ${theme.textSecondary}`}>#{i + 1}</td>
                      <td className={`px-4 py-3 ${theme.text}`}>
                        <p className="font-semibold">{t.producto?.nombre}</p>
                        <p className={`text-xs ${theme.textSecondary} font-mono`}>{t.producto?.codigo}</p>
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${theme.text}`}>{t.totalMovimientos}</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{t.totalEntradas}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{t.totalSalidas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Productos stock bajo */}
        {stockBajo?.productosStockBajo?.length > 0 && (
          <Card variant="elevated">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                <h2 className={`font-bold text-lg ${theme.text}`}>Productos con Stock Bajo</h2>
              </div>
              <Button variant="primary" size="sm" icon={Download} onClick={exportarInventario}>
                Exportar
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <th className={`text-left px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Código</th>
                    <th className={`text-left px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Nombre</th>
                    <th className={`text-left px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Categoría</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Stock Actual</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Stock Mínimo</th>
                    <th className={`text-right px-4 py-3 font-bold ${theme.textSecondary} uppercase text-xs tracking-wider`}>Déficit</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme.border}`}>
                  {stockBajo.productosStockBajo.map((p) => (
                    <tr key={p.id} className={`${theme.hover} transition-colors`}>
                      <td className={`px-4 py-3 font-mono text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{p.codigo}</td>
                      <td className={`px-4 py-3 font-semibold ${theme.text}`}>{p.nombre}</td>
                      <td className={`px-4 py-3 ${theme.textSecondary}`}>{p.categoria?.nombre}</td>
                      <td className="px-4 py-3 text-right font-bold text-red-600 dark:text-red-400">{p.stockActual}</td>
                      <td className={`px-4 py-3 text-right ${theme.textSecondary}`}>{p.stockMinimo}</td>
                      <td className="px-4 py-3 text-right font-bold text-orange-600 dark:text-orange-400">
                        {Math.max(0, p.stockMinimo - p.stockActual)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Reportes;
