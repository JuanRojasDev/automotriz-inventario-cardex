import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import toast from 'react-hot-toast';
import { ArrowUpCircle, ArrowDownCircle, SlidersHorizontal, X } from 'lucide-react';
import { GET_MOVIMIENTOS, REGISTRAR_MOVIMIENTO } from '../apollo/queries';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import FormularioMovimiento from '../components/movimientos/FormularioMovimiento';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency, formatDate } from '../utils/format';

const TipoBadge = ({ tipo }) => {
  if (tipo === 'ENTRADA') return <span className="badge badge-success">Entrada</span>;
  if (tipo === 'SALIDA')  return <span className="badge badge-danger">Salida</span>;
  return <span className="badge badge-info">Ajuste</span>;
};

const Movimientos = () => {
  const { esOperador } = useAuth();
  const { theme, isDark } = useTheme();
  const [pagina, setPagina] = useState(1);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [modalTipo, setModalTipo] = useState(null);
  const [pendingMovimiento, setPendingMovimiento] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const filtros = {
    tipo: filtroTipo || undefined,
    fechaDesde: fechaDesde || undefined,
    fechaHasta: fechaHasta || undefined,
  };

  const { data, loading, refetch } = useQuery(GET_MOVIMIENTOS, {
    variables: { filtros, pagina, limite: 15 },
    fetchPolicy: 'cache-and-network',
  });

  const [registrarMovimiento, { loading: registrando }] = useMutation(REGISTRAR_MOVIMIENTO);

  const handleFormSubmit = (values) => {
    setPendingMovimiento(values);
    setConfirmOpen(true);
  };

  const handleConfirmar = async () => {
    try {
      await registrarMovimiento({ variables: { input: pendingMovimiento } });
      toast.success(`${pendingMovimiento.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'} registrada`);
      setModalTipo(null);
      setPendingMovimiento(null);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const limpiarFiltros = () => {
    setFiltroTipo(''); setFechaDesde(''); setFechaHasta(''); setPagina(1);
  };
  const hayFiltros = filtroTipo || fechaDesde || fechaHasta;

  const movimientos = data?.movimientos?.movimientos || [];
  const { total, totalPaginas } = data?.movimientos || {};

  return (
    <div className="space-y-4">

      {/* Acciones rápidas */}
      {esOperador() && (
        <div className="flex gap-3">
          <button onClick={() => setModalTipo('ENTRADA')} className="btn-success">
            <ArrowUpCircle size={16} />
            Registrar Entrada
          </button>
          <button onClick={() => setModalTipo('SALIDA')} className="btn-danger">
            <ArrowDownCircle size={16} />
            Registrar Salida
          </button>
        </div>
      )}

      {/* Filtros */}
      <div className="card py-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipo</label>
            <select
              value={filtroTipo}
              onChange={(e) => { setFiltroTipo(e.target.value); setPagina(1); }}
              className="input-field w-36"
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SALIDA">Salidas</option>
              <option value="AJUSTE">Ajustes</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Desde</label>
            <input type="date" value={fechaDesde}
              onChange={(e) => { setFechaDesde(e.target.value); setPagina(1); }}
              className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Hasta</label>
            <input type="date" value={fechaHasta}
              onChange={(e) => { setFechaHasta(e.target.value); setPagina(1); }}
              className="input-field" />
          </div>
          {hayFiltros && (
            <button onClick={limpiarFiltros} className="btn-secondary gap-1.5">
              <X size={14} /> Limpiar
            </button>
          )}
        </div>
        {total !== undefined && (
          <p className="text-xs text-slate-400 mt-3">{total} movimiento{total !== 1 ? 's' : ''}</p>
        )}
      </div>

      {/* Tabla */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Producto</th>
                  <th className="table-header text-right">Cantidad</th>
                  <th className="table-header text-right">Precio Unit.</th>
                  <th className="table-header text-right">Stock Antes</th>
                  <th className="table-header text-right">Stock Después</th>
                  <th className="table-header">Usuario</th>
                  <th className="table-header">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-16 text-slate-400 text-sm">
                      No se encontraron movimientos
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id} className={`table-row border-l-2
                      ${m.tipo === 'ENTRADA' ? 'border-l-emerald-400'
                        : m.tipo === 'SALIDA' ? 'border-l-rose-400'
                        : 'border-l-blue-400'}`}>
                      <td className="table-cell text-xs whitespace-nowrap">
                        {formatDate(m.fecha)}
                      </td>
                      <td className="table-cell"><TipoBadge tipo={m.tipo} /></td>
                      <td className="table-cell">
                        <p className={`font-medium text-sm ${theme.text}`}>{m.producto?.nombre}</p>
                        <p className={`text-xs ${theme.textSecondary} font-mono`}>{m.producto?.codigo}</p>
                      </td>
                      <td className={`table-cell text-right font-bold
                        ${m.tipo === 'ENTRADA' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {m.tipo === 'ENTRADA' ? '+' : '-'}{m.cantidad}
                      </td>
                      <td className={`table-cell text-right ${theme.textSecondary} text-xs`}>
                        {formatCurrency(m.precioUnitario)}
                      </td>
                      <td className={`table-cell text-right ${theme.textSecondary}`}>{m.stockAntes}</td>
                      <td className={`table-cell text-right font-semibold ${theme.text}`}>{m.stockDespues}</td>
                      <td className={`table-cell text-xs ${theme.textSecondary}`}>{m.usuario?.nombre}</td>
                      <td className={`table-cell text-xs ${theme.textSecondary}`}>{m.referencia || '—'}</td>
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

      <Modal isOpen={modalTipo === 'ENTRADA'} onClose={() => setModalTipo(null)} title="Registrar Entrada" size="lg">
        <FormularioMovimiento tipo="ENTRADA" onSubmit={handleFormSubmit} loading={registrando} />
      </Modal>
      <Modal isOpen={modalTipo === 'SALIDA'} onClose={() => setModalTipo(null)} title="Registrar Salida" size="lg">
        <FormularioMovimiento tipo="SALIDA" onSubmit={handleFormSubmit} loading={registrando} />
      </Modal>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setPendingMovimiento(null); }}
        onConfirm={handleConfirmar}
        title={`Confirmar ${pendingMovimiento?.tipo === 'ENTRADA' ? 'Entrada' : 'Salida'}`}
        message={`¿Confirmas registrar ${pendingMovimiento?.tipo === 'ENTRADA' ? 'una entrada' : 'una salida'} de ${pendingMovimiento?.cantidad} unidades?`}
        confirmText="Sí, registrar"
        danger={pendingMovimiento?.tipo === 'SALIDA'}
      />
    </div>
  );
};

export default Movimientos;
