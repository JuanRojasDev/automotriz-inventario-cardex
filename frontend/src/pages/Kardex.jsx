import { useState, useEffect, useRef } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { Search, X, FileSpreadsheet } from 'lucide-react';
import { GET_MOVIMIENTOS, BUSCAR_PRODUCTOS } from '../apollo/queries';
import Pagination from '../components/ui/Pagination';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../context/ThemeContext';
import useDebounce from '../hooks/useDebounce';
import { formatCurrency, formatDate } from '../utils/format';

const Kardex = () => {
  const { theme, isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const [productoId, setProductoId] = useState(searchParams.get('productoId') || '');
  const [busqueda, setBusqueda] = useState('');
  const [sinSeleccion, setSinSeleccion] = useState(false); // texto escrito pero no seleccionado
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const wrapperRef = useRef(null);

  const [buscarProductos, { data: resultadosBusqueda, loading: buscando }] = useLazyQuery(BUSCAR_PRODUCTOS);
  const busquedaDebounced = useDebounce(busqueda, 300);

  // Cerrar dropdown al click fuera
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setDropdownAbierto(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (busquedaDebounced.trim().length >= 2) {
      buscarProductos({ variables: { termino: busquedaDebounced.trim() } });
      setDropdownAbierto(true);
    } else {
      setDropdownAbierto(false);
    }
  }, [busquedaDebounced, buscarProductos]);

  const resultados = resultadosBusqueda?.buscarProductos || [];
  const mostrarDropdown = dropdownAbierto && busqueda.trim().length >= 2;

  const filtros = {
    // Si hay texto escrito sin selección, usar un ID imposible para que no retorne nada
    productoId: sinSeleccion ? 'none' : (productoId || undefined),
    tipo: filtroTipo || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  };

  const { data, loading } = useQuery(GET_MOVIMIENTOS, {
    variables: { filtros, pagina, limite: 20 },
    fetchPolicy: 'cache-and-network',
  });

  const handleBusqueda = (val) => {
    setBusqueda(val);
    setProductoId('');
    setSinSeleccion(val.trim().length > 0);
    setPagina(1);
    if (!val.trim()) setDropdownAbierto(false);
  };

  const seleccionarProducto = (p) => {
    setProductoId(p.id);
    setSinSeleccion(false);
    setBusqueda(`${p.codigo} - ${p.nombre}`);
    setDropdownAbierto(false);
    setPagina(1);
  };

  const limpiarBusqueda = () => {
    setBusqueda('');
    setProductoId('');
    setSinSeleccion(false);
    setDropdownAbierto(false);
    setPagina(1);
  };

  const exportarExcel = () => {
    const movimientos = data?.movimientos?.movimientos || [];
    if (movimientos.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const rows = movimientos.map((m) => ({
      Fecha: formatDate(m.fecha),
      Tipo: m.tipo,
      Producto: m.producto?.nombre,
      Código: m.producto?.codigo,
      Cantidad: m.cantidad,
      'Precio Unitario': m.precioUnitario,
      'Stock Antes': m.stockAntes,
      'Stock Después': m.stockDespues,
      'Precio Prom. Antes': m.precioPromedioAntes,
      'Precio Prom. Después': m.precioPromedioDespues,
      Observación: m.observacion || '',
      Referencia: m.referencia || '',
      Usuario: m.usuario?.nombre,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Kardex');
    XLSX.writeFile(wb, `kardex_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Exportado a Excel');
  };

  const movimientos = data?.movimientos?.movimientos || [];
  const { total, totalPaginas } = data?.movimientos || {};

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="card">
        <div className="flex flex-wrap gap-3 items-end">
          {/* Buscador de producto */}
          <div className="relative flex-1 min-w-48" ref={wrapperRef}>
            <label className={`block text-xs mb-1 ${theme.textSecondary}`}>Producto</label>
            <div className="relative">
              <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSecondary}`} />
              <input
                type="text"
                placeholder="Buscar por nombre o código..."
                value={busqueda}
                onChange={(e) => handleBusqueda(e.target.value)}
                onFocus={() => busqueda.trim().length >= 2 && setDropdownAbierto(true)}
                className="input-field pl-8 pr-8"
              />
              {busqueda && (
                <button onClick={limpiarBusqueda} className={`absolute right-2.5 top-1/2 -translate-y-1/2 ${theme.textSecondary} hover:text-red-400`}>
                  <X size={14} />
                </button>
              )}
            </div>
            {mostrarDropdown && (
              <div className={`absolute z-20 w-full border rounded-lg shadow-xl mt-1 max-h-48 overflow-y-auto
                ${isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-200'}`}>
                {buscando ? (
                  <div className={`px-3 py-3 text-xs ${theme.textSecondary}`}>Buscando...</div>
                ) : resultados.length === 0 ? (
                  <div className={`px-3 py-3 text-xs ${theme.textSecondary}`}>Sin resultados para "{busqueda}"</div>
                ) : (
                  resultados.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); seleccionarProducto(p); }}
                      className={`w-full text-left px-3 py-2.5 text-sm border-b last:border-0 transition-colors
                        ${isDark ? 'hover:bg-slate-700 border-slate-700 text-slate-200' : 'hover:bg-blue-50 border-gray-100 text-slate-800'}`}
                    >
                      <span className={`font-mono text-xs font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{p.codigo}</span>
                      <span className={`ml-2 ${theme.text}`}>{p.nombre}</span>
                      <span className={`ml-auto float-right text-xs ${theme.textSecondary}`}>Stock: {p.stockActual}</span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Tipo</label>
            <select value={filtroTipo} onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }} className="input-field w-32">
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="AJUSTE">Ajustes</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Desde</label>
            <input type="date" value={fechaDesde} onChange={(e) => { setFechaDesde(e.target.value); setPagina(1); }} className="input-field" />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">Hasta</label>
            <input type="date" value={fechaHasta} onChange={(e) => { setFechaHasta(e.target.value); setPagina(1); }} className="input-field" />
          </div>

          <button
            onClick={() => { limpiarBusqueda(); setFiltroTipo(''); setFechaDesde(''); setFechaHasta(''); }}
            className="btn-secondary text-sm"
          >
            Limpiar
          </button>

          <button onClick={exportarExcel} className="btn-primary text-sm">
            <FileSpreadsheet size={15} />
            Exportar Excel
          </button>
        </div>
        {total !== undefined && <p className={`text-xs ${theme.textSecondary} mt-2`}>{total} movimiento(s)</p>}
      </div>

      {/* Tabla Kardex */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Producto</th>
                  <th className="table-header text-right">Cantidad</th>
                  <th className="table-header text-right">Precio Unit.</th>
                  <th className="table-header text-right">Stock Antes</th>
                  <th className="table-header text-right">Stock Después</th>
                  <th className="table-header text-right">P.Prom Antes</th>
                  <th className="table-header text-right">P.Prom Después</th>
                  <th className="table-header">Observación</th>
                  <th className="table-header">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={11} className={`text-center py-12 ${theme.textSecondary}`}>
                      No se encontraron movimientos
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className={`table-row border-l-2
                      ${m.tipo === 'ENTRADA' ? 'border-l-green-400' : m.tipo === 'SALIDA' ? 'border-l-red-400' : 'border-l-blue-400'}`}>
                      <td className={`table-cell text-xs whitespace-nowrap ${theme.textSecondary}`}>{formatDate(m.fecha)}</td>
                      <td className="table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          m.tipo === 'ENTRADA'
                            ? isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-700'
                            : m.tipo === 'SALIDA'
                            ? isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-700'
                            : isDark ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {m.tipo}
                        </span>
                      </td>
                      <td className="table-cell">
                        <p className={`font-medium text-xs ${theme.text}`}>{m.producto?.nombre}</p>
                        <p className={`text-xs ${theme.textSecondary} font-mono`}>{m.producto?.codigo}</p>
                      </td>
                      <td className={`table-cell text-right font-bold ${
                        m.tipo === 'ENTRADA'
                          ? isDark ? 'text-green-400' : 'text-green-600'
                          : isDark ? 'text-red-400' : 'text-red-600'
                      }`}>
                        {m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                      </td>
                      <td className={`table-cell text-right text-xs ${theme.textSecondary}`}>{formatCurrency(m.precioUnitario)}</td>
                      <td className={`table-cell text-right ${theme.textSecondary}`}>{m.stockAntes}</td>
                      <td className={`table-cell text-right font-medium ${theme.text}`}>{m.stockDespues}</td>
                      <td className={`table-cell text-right text-xs ${theme.textSecondary}`}>{formatCurrency(m.precioPromedioAntes)}</td>
                      <td className={`table-cell text-right text-xs font-medium ${theme.text}`}>{formatCurrency(m.precioPromedioDespues)}</td>
                      <td className={`table-cell text-xs ${theme.textSecondary} max-w-xs truncate`}>{m.observacion || '-'}</td>
                      <td className={`table-cell text-xs ${theme.textSecondary}`}>{m.usuario?.nombre}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 pb-4">
          <Pagination pagina={pagina} totalPaginas={totalPaginas || 1} onCambiar={setPagina} />
        </div>
      </div>
    </div>
  );
};

export default Kardex;
