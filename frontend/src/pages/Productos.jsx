import { useState, useCallback } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, BookOpen, Pencil, Trash2, Filter, X } from 'lucide-react';
import {
  GET_PRODUCTOS, CREAR_PRODUCTO, ACTUALIZAR_PRODUCTO, ELIMINAR_PRODUCTO
} from '../apollo/queries';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Pagination from '../components/ui/Pagination';
import StockBadge from '../components/ui/StockBadge';
import FormularioProducto from '../components/productos/FormularioProducto';
import Spinner from '../components/ui/Spinner';
import useDebounce from '../hooks/useDebounce';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/format';

const Productos = () => {
  const { esOperador, esAdmin } = useAuth();
  const { theme, isDark } = useTheme();
  const [pagina, setPagina] = useState(1);
  const [busquedaInput, setBusquedaInput] = useState('');
  const busqueda = useDebounce(busquedaInput, 400);
  const [soloStockBajo, setSoloStockBajo] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [modalEditar, setModalEditar] = useState(false);
  const [productoEditar, setProductoEditar] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const { data, loading, refetch } = useQuery(GET_PRODUCTOS, {
    variables: {
      filtros: { busqueda: busqueda || undefined, soloStockBajo: soloStockBajo || undefined },
      pagina,
      limite: 10,
    },
    fetchPolicy: 'cache-and-network',
  });

  const [crearProducto, { loading: creando }] = useMutation(CREAR_PRODUCTO);
  const [actualizarProducto, { loading: actualizando }] = useMutation(ACTUALIZAR_PRODUCTO);
  const [eliminarProducto] = useMutation(ELIMINAR_PRODUCTO);

  const handleBusqueda = useCallback((val) => {
    setBusquedaInput(val);
    setPagina(1);
  }, []);

  const handleCrear = async (values) => {
    try {
      await crearProducto({
        variables: {
          input: {
            ...values,
            precioCompra: parseFloat(values.precioCompra),
            precioVenta: parseFloat(values.precioVenta),
            stockMinimo: parseFloat(values.stockMinimo),
          }
        },
      });
      toast.success('Producto creado exitosamente');
      setModalCrear(false);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const handleEditar = async (values) => {
    try {
      const { codigo, ...input } = values;
      await actualizarProducto({
        variables: {
          id: productoEditar.id,
          input: {
            ...input,
            precioCompra: parseFloat(input.precioCompra),
            precioVenta: parseFloat(input.precioVenta),
            stockMinimo: parseFloat(input.stockMinimo),
          },
        },
      });
      toast.success('Producto actualizado');
      setModalEditar(false);
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const handleEliminar = async () => {
    try {
      await eliminarProducto({ variables: { id: confirmEliminar.id } });
      toast.success('Producto eliminado');
      refetch();
    } catch (e) { toast.error(e.message); }
  };

  const productos = data?.productos?.productos || [];
  const { total, totalPaginas } = data?.productos || {};

  return (
    <div className="space-y-4">

      {/* Toolbar */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            {/* Búsqueda */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por código o nombre..."
                value={busquedaInput}
                onChange={(e) => handleBusqueda(e.target.value)}
                className="input-field pl-9 w-72"
              />
              {busquedaInput && (
                <button
                  onClick={() => handleBusqueda('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Filtro stock bajo */}
            <button
              onClick={() => { setSoloStockBajo(!soloStockBajo); setPagina(1); }}
              className={`btn text-sm gap-2 ${soloStockBajo
                ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                : 'btn-secondary'}`}
            >
              <Filter size={14} />
              Stock bajo
              {soloStockBajo && <X size={12} />}
            </button>
          </div>

          {esOperador() && (
            <button onClick={() => setModalCrear(true)} className="btn-primary">
              <Plus size={16} />
              Nuevo Producto
            </button>
          )}
        </div>

        {total !== undefined && (
          <p className="text-xs text-slate-400 mt-3">
            {total} producto{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
          </p>
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
                  <th className="table-header">Código</th>
                  <th className="table-header">Producto</th>
                  <th className="table-header">Categoría</th>
                  <th className="table-header text-right">Stock</th>
                  <th className="table-header text-right">Precio Venta</th>
                  <th className="table-header text-center">Estado</th>
                  <th className="table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-slate-400 text-sm">
                      No se encontraron productos
                    </td>
                  </tr>
                ) : (
                  productos.map((p) => (
                    <tr key={p.id} className="table-row">
                      <td className="table-cell">
                        <span className={`font-mono text-xs font-semibold px-2 py-0.5 rounded
                          ${isDark ? 'text-blue-400 bg-blue-900/30' : 'text-blue-700 bg-blue-50'}`}>
                          {p.codigo}
                        </span>
                      </td>
                      <td className="table-cell">
                        <p className={`font-medium text-sm ${theme.text}`}>{p.nombre}</p>
                        {p.descripcion && (
                          <p className={`text-xs ${theme.textSecondary} truncate max-w-xs mt-0.5`}>{p.descripcion}</p>
                        )}
                      </td>
                      <td className="table-cell">
                        <span className="badge badge-neutral">{p.categoria?.nombre}</span>
                      </td>
                      <td className="table-cell text-right">
                        <StockBadge stockActual={p.stockActual} stockMinimo={p.stockMinimo} />
                      </td>
                      <td className={`table-cell text-right font-semibold ${theme.text}`}>
                        {formatCurrency(p.precioVenta)}
                      </td>
                      <td className="table-cell text-center">
                        <span className={p.activo ? 'badge badge-success' : 'badge badge-danger'}>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            to={`/kardex?productoId=${p.id}`}
                            className="btn-ghost btn-icon text-slate-400 hover:text-[#1a3a6b]"
                            title="Ver kardex"
                          >
                            <BookOpen size={15} />
                          </Link>
                          {esOperador() && (
                            <button
                              onClick={() => { setProductoEditar(p); setModalEditar(true); }}
                              className="btn-ghost btn-icon text-slate-400 hover:text-slate-700"
                              title="Editar"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          {esAdmin() && (
                            <button
                              onClick={() => setConfirmEliminar(p)}
                              className="btn-ghost btn-icon text-slate-400 hover:text-rose-600"
                              title="Eliminar"
                            >
                              <Trash2 size={15} />
                            </button>
                          )}
                        </div>
                      </td>
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

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Producto" size="lg">
        <FormularioProducto onSubmit={handleCrear} loading={creando} />
      </Modal>

      <Modal isOpen={modalEditar} onClose={() => setModalEditar(false)} title="Editar Producto" size="lg">
        <FormularioProducto producto={productoEditar} onSubmit={handleEditar} loading={actualizando} />
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmEliminar}
        onClose={() => setConfirmEliminar(null)}
        onConfirm={handleEliminar}
        title="Eliminar Producto"
        message={`¿Eliminar "${confirmEliminar?.nombre}"? El producto puede restaurarse desde la base de datos.`}
        confirmText="Eliminar"
        danger
      />
    </div>
  );
};

export default Productos;
