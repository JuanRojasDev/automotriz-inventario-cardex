import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useQuery } from '@apollo/client';
import { GET_CATEGORIAS } from '../../apollo/queries';
import Spinner from '../ui/Spinner';

const validationSchema = Yup.object({
  codigo: Yup.string().required('El código es requerido').max(50),
  nombre: Yup.string().required('El nombre es requerido').min(2).max(200),
  descripcion: Yup.string().max(500),
  categoriaId: Yup.string().required('La categoría es requerida'),
  unidadMedida: Yup.string().required('La unidad de medida es requerida'),
  stockMinimo: Yup.number().min(0, 'Debe ser mayor o igual a 0').required(),
  precioCompra: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('El precio de compra es requerido'),
  precioVenta: Yup.number().min(0, 'Debe ser mayor o igual a 0').required('El precio de venta es requerido'),
});

// Formatea número como $ 1.234.567 COP (sin decimales)
const formatCOP = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  const num = parseFloat(String(value).replace(/[^0-9]/g, ''));
  if (isNaN(num)) return '';
  return '$ ' + num.toLocaleString('es-CO') + ' COP';
};

// Extrae solo los dígitos de un string formateado
const parseRaw = (str) => {
  const digits = String(str).replace(/[^0-9]/g, '');
  return digits === '' ? '' : Number(digits);
};

// Campo de texto normal — definido fuera para evitar re-montaje en cada render
const Field = ({ name, label, type = 'text', placeholder, formik, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      className={`input-field ${formik.touched[name] && formik.errors[name] ? 'input-error' : ''}`}
      {...formik.getFieldProps(name)}
      {...props}
    />
    {formik.touched[name] && formik.errors[name] && (
      <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>
    )}
  </div>
);

// Campo de precio con formato COP — definido fuera para evitar re-montaje
const CurrencyField = ({ name, label, formik }) => {
  const [focused, setFocused] = useState(false);
  const [display, setDisplay] = useState('');

  // Sincronizar display cuando el valor de formik cambia externamente (ej: enableReinitialize)
  useEffect(() => {
    if (!focused) {
      const val = formik.values[name];
      setDisplay(val !== '' && val !== undefined ? formatCOP(val) : '');
    }
  }, [formik.values[name], focused]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFocus = () => {
    setFocused(true);
    // Al enfocar mostrar solo los dígitos para editar cómodamente
    const raw = formik.values[name];
    setDisplay(raw !== '' && raw !== undefined ? String(raw) : '');
  };

  const handleChange = (e) => {
    const raw = e.target.value;
    // Solo permitir dígitos mientras se escribe
    const digits = raw.replace(/[^0-9]/g, '');
    setDisplay(digits);
    formik.setFieldValue(name, digits === '' ? '' : Number(digits));
  };

  const handleBlur = () => {
    setFocused(false);
    formik.setFieldTouched(name, true);
    // Al perder foco, mostrar formato completo
    const val = formik.values[name];
    setDisplay(val !== '' && val !== undefined && val !== 0 ? formatCOP(val) : '');
  };

  const hasError = formik.touched[name] && formik.errors[name];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type="text"
        inputMode="numeric"
        value={display}
        placeholder="$ 0 COP"
        onFocus={handleFocus}
        onChange={handleChange}
        onBlur={handleBlur}
        className={`input-field font-mono ${hasError ? 'input-error' : ''}`}
      />
      {hasError && (
        <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>
      )}
    </div>
  );
};

const FormularioProducto = ({ producto, onSubmit, loading }) => {
  const { data: catData } = useQuery(GET_CATEGORIAS);

  const formik = useFormik({
    initialValues: {
      codigo: producto?.codigo || '',
      nombre: producto?.nombre || '',
      descripcion: producto?.descripcion || '',
      categoriaId: producto?.categoria?.id || '',
      unidadMedida: producto?.unidadMedida || 'unidad',
      stockMinimo: producto?.stockMinimo ?? 5,
      precioCompra: producto?.precioCompra || '',
      precioVenta: producto?.precioVenta || '',
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit,
  });

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field name="codigo" label="Código *" placeholder="MOT-001" formik={formik} disabled={!!producto} />
        <Field name="nombre" label="Nombre *" placeholder="Nombre del producto" formik={formik} />
      </div>

      <Field name="descripcion" label="Descripción" placeholder="Descripción opcional" formik={formik} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
          <select
            name="categoriaId"
            className={`input-field ${formik.touched.categoriaId && formik.errors.categoriaId ? 'input-error' : ''}`}
            {...formik.getFieldProps('categoriaId')}
          >
            <option value="">Seleccionar categoría</option>
            {catData?.categorias?.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {formik.touched.categoriaId && formik.errors.categoriaId && (
            <p className="text-red-500 text-xs mt-1">{formik.errors.categoriaId}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Unidad de Medida *</label>
          <select
            name="unidadMedida"
            className="input-field"
            {...formik.getFieldProps('unidadMedida')}
          >
            <option value="unidad">Unidad</option>
            <option value="litro">Litro</option>
            <option value="kg">Kilogramo</option>
            <option value="metro">Metro</option>
            <option value="juego">Juego</option>
            <option value="par">Par</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field name="stockMinimo" label="Stock Mínimo *" type="number" placeholder="5" formik={formik} />
        <CurrencyField name="precioCompra" label="Precio Compra *" formik={formik} />
        <CurrencyField name="precioVenta" label="Precio Venta *" formik={formik} />
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
          {loading && <Spinner size="sm" />}
          {producto ? 'Actualizar Producto' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};

export default FormularioProducto;
