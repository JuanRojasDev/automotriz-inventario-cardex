import { useQuery } from '@apollo/client';
import { Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, ResponsiveContainer
} from 'recharts';
import {
  Package, TrendingUp, AlertTriangle, DollarSign,
  ArrowUpRight, ArrowDownRight, Clock, ChevronRight
} from 'lucide-react';
import {
  GET_REPORTE_INVENTARIO, GET_RESUMEN_MOVIMIENTOS,
  GET_PRODUCTOS_STOCK_BAJO, GET_MOVIMIENTOS, GET_TOP_PRODUCTOS
} from '../apollo/queries';
import MetricCard from '../components/dashboard/MetricCard';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, formatChartDate, formatDate } from '../utils/format';

const Dashboard = () => {
  const { isDark, theme } = useTheme();
  const { data: reporte, loading: l1 } = useQuery(GET_REPORTE_INVENTARIO, { fetchPolicy: 'network-only' });
  const { data: resumen, loading: l2 } = useQuery(GET_RESUMEN_MOVIMIENTOS, { variables: { dias: 14 } });
  const { data: stockBajo, loading: l3 } = useQuery(GET_PRODUCTOS_STOCK_BAJO);
  const { data: movRecientes, loading: l4 } = useQuery(GET_MOVIMIENTOS, { variables: { limite: 8 } });
  const { data: topProductos, loading: l5 } = useQuery(GET_TOP_PRODUCTOS, { variables: { limite: 5 } });

  if (l1 || l2 || l3 || l4 || l5) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const r = reporte?.reporteInventario;
  const chartData = resumen?.resumenMovimientos?.movimientosPorDia?.map(d => ({
    ...d,
    fecha: formatChartDate(d.fecha),
  })) || [];

  const topData = topProductos?.topProductosMovidos?.map(t => ({
    nombre: t.producto?.nombre?.length > 18
      ? t.producto.nombre.substring(0, 18) + '…'
      : t.producto?.nombre,
    movimientos: t.totalMovimientos,
    entradas: t.totalEntradas,
    salidas: t.totalSalidas,
  })) || [];

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Productos"
          value={r?.totalProductos ?? '—'}
          subtitle="Registrados en sistema"
          icon={Package}
          color="blue"
        />
        <MetricCard
          title="Productos Activos"
          value={r?.productosActivos ?? '—'}
          subtitle="En inventario activo"
          icon={TrendingUp}
          color="green"
        />
        <MetricCard
          title="Stock Bajo"
          value={r?.productosStockBajo ?? '—'}
          subtitle="Requieren reposición"
          icon={AlertTriangle}
          color="yellow"
          alert={(r?.productosStockBajo ?? 0) > 0}
        />
        <MetricCard
          title="Valor Inventario"
          value={formatCurrency(r?.valorTotalInventario ?? 0)}
          subtitle="Precio promedio ponderado"
          icon={DollarSign}
          color="purple"
        />
      </div>

      {/* Gráfico + Stock bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Área chart */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="section-title mb-0">Movimientos recientes</h2>
              <p className={`text-xs ${theme.textSecondary} mt-0.5`}>Últimos 14 días</p>
            </div>
            <div className={`flex items-center gap-4 text-xs ${theme.textSecondary}`}>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
                Entradas
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
                Salidas
              </span>
            </div>
          </div>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gEnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#34d399" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gSal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#fb7185" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f1f5f9'} />
                <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0.5rem', color: isDark ? '#f1f5f9' : '#0f172a' }} />
                <Area type="monotone" dataKey="entradas" stroke="#34d399" strokeWidth={2}
                      fill="url(#gEnt)" name="Entradas" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="salidas"  stroke="#fb7185" strokeWidth={2}
                      fill="url(#gSal)" name="Salidas"  dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className={`h-48 flex items-center justify-center ${theme.textSecondary} text-sm`}>
              Sin movimientos en los últimos 14 días
            </div>
          )}
        </div>

        {/* Stock bajo */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Stock bajo</h2>
            <Link
              to="/productos?stockBajo=true"
              className={`text-xs font-medium flex items-center gap-0.5 hover:underline ${theme.textSecondary}`}
            >
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          {!stockBajo?.productosStockBajo?.length ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
                <TrendingUp size={18} className="text-emerald-500" />
              </div>
              <p className={`text-sm ${theme.textSecondary}`}>Todo el stock está bien</p>
            </div>
          ) : (
            <div className="space-y-2 overflow-y-auto max-h-56">
              {stockBajo.productosStockBajo.map((p) => (
                <div key={p.id}
                  className={`flex items-center justify-between p-2.5 rounded-lg border ${
                    isDark
                      ? 'bg-amber-900/20 border-amber-800/40'
                      : 'bg-amber-50 border-amber-100'
                  }`}>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold ${theme.text} truncate`}>{p.nombre}</p>
                    <p className={`text-xs ${theme.textSecondary} font-mono`}>{p.codigo}</p>
                  </div>
                  <div className="text-right ml-2 flex-shrink-0">
                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{p.stockActual}</p>
                    <p className={`text-xs ${theme.textSecondary}`}>mín {p.stockMinimo}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Top productos + Últimos movimientos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Bar chart top */}
        <div className="card">
          <div className="mb-5">
            <h2 className="section-title mb-0">Top productos movidos</h2>
            <p className={`text-xs ${theme.textSecondary} mt-0.5`}>Por cantidad de movimientos</p>
          </div>
          {topData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topData} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f1f5f9'} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="nombre" type="category" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }}
                       width={110} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: isDark ? '#1e293b' : '#fff', border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`, borderRadius: '0.5rem', color: isDark ? '#f1f5f9' : '#0f172a' }} />
                <Bar dataKey="movimientos" fill={isDark ? '#3b82f6' : '#1a3a6b'} name="Movimientos"
                     radius={[0, 4, 4, 0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className={`text-sm ${theme.textSecondary} text-center py-8`}>Sin datos de movimientos</p>
          )}
        </div>

        {/* Últimos movimientos */}
        <div className="card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title mb-0">Últimos movimientos</h2>
            <Link
              to="/movimientos"
              className={`text-xs font-medium flex items-center gap-0.5 hover:underline ${theme.textSecondary}`}
            >
              Ver todos <ChevronRight size={13} />
            </Link>
          </div>
          <div className="space-y-1 overflow-y-auto max-h-56">
            {!movRecientes?.movimientos?.movimientos?.length ? (
              <p className={`text-sm ${theme.textSecondary} text-center py-8`}>Sin movimientos registrados</p>
            ) : (
              movRecientes.movimientos.movimientos.map((m) => (
                <div key={m.id}
                  className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${theme.hover} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      m.tipo === 'ENTRADA'
                        ? isDark ? 'bg-emerald-900/30' : 'bg-emerald-100'
                        : isDark ? 'bg-rose-900/30' : 'bg-rose-100'
                    }`}>
                      {m.tipo === 'ENTRADA'
                        ? <ArrowUpRight size={14} className="text-emerald-600 dark:text-emerald-400" />
                        : <ArrowDownRight size={14} className="text-rose-600 dark:text-rose-400" />
                      }
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xs font-medium ${theme.text} truncate max-w-[140px]`}>
                        {m.producto?.nombre}
                      </p>
                      <p className={`text-xs ${theme.textSecondary}`}>{m.usuario?.nombre}</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-bold ${
                      m.tipo === 'ENTRADA'
                        ? isDark ? 'text-emerald-400' : 'text-emerald-600'
                        : isDark ? 'text-rose-400' : 'text-rose-600'
                    }`}>
                      {m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                    </p>
                    <p className={`text-xs ${theme.textSecondary}`}>{formatDate(m.fecha)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
