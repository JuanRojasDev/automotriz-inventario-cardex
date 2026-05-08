import { useState, useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useLazyQuery } from '@apollo/client';
import { BUSCAR_PRODUCTOS } from '../../apollo/queries';
import Spinner from '../ui/Spinner';
import useDebounce from '../../hooks/useDebounce';
import { formatCurrency } from '../../utils/format';

const validationSchema = () =>
  Yup.object({
    productoId: Yup.string().required('Selecciona un producto'),
    cantidad: Yup.number()
      .min(1, 'La cantidad debe ser mayor a 0')
      .required('La cantidad es requerida'),
    precioUnitario: Yup.number()
      .min(0, 'El precio no puede ser negativo')
      .required('El precio es requerido'),
    observacion: Yup.string().max(500),
    referencia: Yup.string().max(100),
  });

// Formatea número como $ 1.234.567 COP
const formatCOP = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseFloat(String(value).replace(/[^0-9]/g, ''));
  if (isNaN(num)) return '';
  return '$ ' + num.toLocaleString('es-CO') + ' COP';
};

const FormularioMovimiento = ({ tipo, onSubmit, loading }) => {
  const [busqueda, setBusqueda] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  // Estado para el campo de precio con formato COP
  const [precioDisplay, setPrecioDisplay] = useState('');
  const [precioFocused, setPrecioFocused] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [buscarProductos, { data: resultados, loading: buscando }] = useLazyQuery(BUSCAR_PRODUCTOS);
  const busquedaDebounced = useDebounce(busqueda, 300);

  useEffect(() => {
    if (busquedaDebounced.length >= 2) {
      buscarProductos({ variables: { termino: busquedaDebounced } });
      setMostrarResultados(true);
    } else {
      setMostrarResultados(false);
    }
  }, [busquedaDebounced, buscarProductos]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setMostrarResultados(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formik = useFormik({
    initialValues: {
      productoId: '',
      cantidad: '',
      precioUnitario: '',
      observacion: '',
      referencia: '',
    },
    validationSchema: validationSchema(),
    onSubmit: (values) => {
      onSubmit({
        ...values,
        tipo,
        cantidad: parseFloat(values.cantidad),
        precioUnitario: parseFloat(values.precioUnitario),
      });
    },
  });

  const seleccionarProducto = (p) => {
    setProductoSeleccionado(p);
    setBusqueda(`${p.codigo} - ${p.nombre}`);
    setMostrarResultados(false);
    formik.setFieldValue('productoId', p.id);

    // Sugerir precio y actualizar display
    const precio = tipo === 'ENTRADA' ? (p.precioPromedio || 0) : (p.precioVenta || 0);
    formik.setFieldValue('precioUnitario', precio);
    setPrecioDisplay(precio ? formatCOP(precio) : '');
  };

  // Handlers del campo precio
  const handlePrecioFocus = () => {
    setPrecioFocused(true);
    const raw = formik.values.precioUnitario;
    setPrecioDisplay(raw !== '' && raw !== undefined ? String(raw) : '');
  };

  const handlePrecioChange = (e) => {
    const digits = e.target.value.replace(/[^0-9]/g, '');
    setPrecioDisplay(digits);
    formik.setFieldValue('precioUnitario', digits === '' ? '' : Number(digits));
  };

  const handlePrecioBlur = () => {
    setPrecioFocused(false);
    formik.setFieldTouched('precioUnitario', true);
    const val = formik.values.precioUnitario;
    setPrecioDisplay(val !== '' && val !== undefined && val !== 0 ? formatCOP(val) : '');
  };

  const esEntrada = tipo === 'ENTRADA';

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      {/* Tipo badge */}
      <div className={`flex items-center gap-2 p-3 rounded-lg ${esEntrada ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
        <span className="text-xl">{esEntrada ? '📥' : '📤'}</span>
        <span className="font-medium">{esEntrada ? 'Entrada de Mercancía' : 'Salida de Mercancía'}</span>
      </div>

      {/* Buscador de producto */}
      <div className="relative">
        <label className="block text-sm font-medium text-gray-700 mb-1">Producto *</label>
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar por código o nombre..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              if (!e.target.value) {
                setMostrarResultados(false);
                setProductoSeleccionado(null);
                formik.setFieldValue('productoId', '');
              }
            }}
            onFocus={() => {
              if (busqueda.length >= 2 && resultados?.buscarProductos?.length > 0) {
                setMostrarResultados(true);
              }
            }}
            // NO usar onBlur aquí — el cierre lo maneja el click fuera (useEffect)
            className={`input-field pr-8 ${formik.touched.productoId && formik.errors.productoId ? 'input-error' : ''}`}
          />
          {buscando && <Spinner size="sm" className="absolute right-3 top-2.5" />}
        </div>
        {formik.touched.productoId && formik.errors.productoId && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.productoId}</p>
        )}

        {/* Dropdown de resultados */}
        {mostrarResultados && resultados?.buscarProductos?.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto"
          >
            {resultados.buscarProductos.map((p) => (
              <button
                key={p.id}
                type="button"
                // onMouseDown en lugar de onClick para que se ejecute ANTES del onBlur del input
                onMouseDown={(e) => {
                  e.preventDefault(); // evita que el input pierda el foco antes del click
                  seleccionarProducto(p);
                }}
                className="w-full text-left px-4 py-2.5 hover:bg-blue-50 border-b last:border-0 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-mono text-xs text-blue-600 font-medium">{p.codigo}</span>
                    <span className="ml-2 text-sm text-gray-800">{p.nombre}</span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    p.stockActual <= 0
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-100 text-green-600'
                  }`}>
                    {p.stockActual} {p.unidadMedida}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Sin resultados */}
        {mostrarResultados && resultados?.buscarProductos?.length === 0 && !buscando && (
          <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-4 py-3 text-sm text-gray-400">
            No se encontraron productos
          </div>
        )}
      </div>

      {/* Info del producto seleccionado */}
      {productoSeleccionado && (
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm">
          <p className="text-xs font-medium text-blue-700 mb-2">
            {productoSeleccionado.codigo} — {productoSeleccionado.nombre}
          </p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white rounded p-2">
              <p className="text-xs text-gray-500">Stock Actual</p>
              <p className={`font-bold ${productoSeleccionado.stockActual <= 0 ? 'text-red-600' : 'text-gray-800'}`}>
                {productoSeleccionado.stockActual} {productoSeleccionado.unidadMedida}
              </p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-xs text-gray-500">Precio Promedio</p>
              <p className="font-bold text-gray-800">{formatCurrency(productoSeleccionado.precioPromedio)}</p>
            </div>
            <div className="bg-white rounded p-2">
              <p className="text-xs text-gray-500">Precio Venta</p>
              <p className="font-bold text-gray-800">{formatCurrency(productoSeleccionado.precioVenta)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad *</label>
          <input
            type="number"
            name="cantidad"
            min="1"
            step="1"
            placeholder="0"
            className={`input-field ${formik.touched.cantidad && formik.errors.cantidad ? 'input-error' : ''}`}
            {...formik.getFieldProps('cantidad')}
          />
          {formik.touched.cantidad && formik.errors.cantidad && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.cantidad}</p>
          )}
          {!esEntrada && productoSeleccionado && formik.values.cantidad > productoSeleccionado.stockActual && (
            <p className="text-red-500 text-xs mt-1">
              ⚠️ Stock insuficiente (disponible: {productoSeleccionado.stockActual})
            </p>
          )}
        </div>

        {/* Precio con formato COP */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {esEntrada ? 'Precio Unitario *' : 'Precio Venta *'}
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={precioFocused ? precioDisplay : (precioDisplay || '')}
            placeholder="$ 0 COP"
            onFocus={handlePrecioFocus}
            onChange={handlePrecioChange}
            onBlur={handlePrecioBlur}
            className={`input-field font-mono ${formik.touched.precioUnitario && formik.errors.precioUnitario ? 'input-error' : ''}`}
          />
          {formik.touched.precioUnitario && formik.errors.precioUnitario && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.precioUnitario}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Referencia / Documento</label>
        <input
          type="text"
          name="referencia"
          placeholder="Ej: Factura #001, Orden #123"
          className="input-field"
          {...formik.getFieldProps('referencia')}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Observación</label>
        <textarea
          name="observacion"
          rows={2}
          placeholder="Observaciones adicionales..."
          className="input-field resize-none"
          {...formik.getFieldProps('observacion')}
        />
      </div>

      {/* Resumen del movimiento */}
      {formik.values.cantidad > 0 && formik.values.precioUnitario > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total movimiento:</span>
            <span className="font-bold text-gray-900 text-base">
              {formatCurrency(formik.values.cantidad * formik.values.precioUnitario)}
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-3 justify-end pt-2">
        <button
          type="submit"
          disabled={
            loading ||
            (!esEntrada && productoSeleccionado && formik.values.cantidad > productoSeleccionado.stockActual)
          }
          className={`flex items-center gap-2 font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            esEntrada ? 'btn-success' : 'btn-danger'
          }`}
        >
          {loading && <Spinner size="sm" />}
          {esEntrada ? '📥 Registrar Entrada' : '📤 Registrar Salida'}
        </button>
      </div>
    </form>
  );
};

export default FormularioMovimiento;
