import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { GET_USUARIOS, CREAR_USUARIO } from '../apollo/queries';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { useTheme } from '../context/ThemeContext';

const validationSchema = Yup.object({
  nombre: Yup.string().required('El nombre es requerido').min(2),
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
  rol: Yup.string().required('El rol es requerido'),
});

const rolColors = {
  admin: 'badge badge-warning',
  operador: 'badge badge-info',
  viewer: 'badge badge-success',
};

const Usuarios = () => {
  const [modalCrear, setModalCrear] = useState(false);
  const { theme, isDark } = useTheme();
  const { data, loading, refetch } = useQuery(GET_USUARIOS);
  const [crearUsuario, { loading: creando }] = useMutation(CREAR_USUARIO);

  const formik = useFormik({
    initialValues: { nombre: '', email: '', password: '', rol: 'operador' },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await crearUsuario({ variables: { input: values } });
        toast.success('Usuario creado exitosamente');
        setModalCrear(false);
        resetForm();
        refetch();
      } catch (e) {
        toast.error(e.message);
      }
    },
  });

  const usuarios = data?.usuarios || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className={`text-sm ${theme.textSecondary}`}>{usuarios.length} usuario(s) registrado(s)</p>
        <button onClick={() => setModalCrear(true)} className="btn-primary">+ Nuevo Usuario</button>
      </div>

      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header">Nombre</th>
                <th className="table-header">Email</th>
                <th className="table-header text-center">Rol</th>
                <th className="table-header text-center">Estado</th>
                <th className="table-header">Creado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="table-row">
                  <td className={`table-cell font-medium ${theme.text}`}>{u.nombre}</td>
                  <td className={`table-cell ${theme.textSecondary}`}>{u.email}</td>
                  <td className="table-cell text-center">
                    <span className={rolColors[u.rol] || 'badge-info'}>{u.rol}</span>
                  </td>
                  <td className="table-cell text-center">
                    <span className={u.activo ? 'badge-success' : 'badge-danger'}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className={`table-cell text-xs ${theme.textSecondary}`}>
                    {new Date(parseInt(u.createdAt)).toLocaleDateString('es-CO')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalCrear} onClose={() => setModalCrear(false)} title="Nuevo Usuario" size="md">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {[
            { name: 'nombre', label: 'Nombre', type: 'text', placeholder: '<nombre>' },
            { name: 'email', label: 'Email', type: 'email', placeholder: 'usuario@aoa.com' },
            { name: 'password', label: 'Contraseña', type: 'password', placeholder: '••••••••' },
          ].map(({ name, label, type, placeholder }) => (
            <div key={name}>
              <label className={`block text-sm font-medium ${theme.text} mb-1`}>{label}</label>
              <input
                type={type}
                name={name}
                placeholder={placeholder}
                className={`input-field ${formik.touched[name] && formik.errors[name] ? 'input-error' : ''}`}
                {...formik.getFieldProps(name)}
              />
              {formik.touched[name] && formik.errors[name] && (
                <p className="text-red-500 text-xs mt-1">{formik.errors[name]}</p>
              )}
            </div>
          ))}

          <div>
            <label className={`block text-sm font-medium ${theme.text} mb-1`}>Rol</label>
            <select name="rol" className="input-field" {...formik.getFieldProps('rol')}>
              <option value="operador">Operador</option>
              <option value="admin">Administrador</option>
              <option value="viewer">Viewer (solo lectura)</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalCrear(false)} className="btn-secondary">Cancelar</button>
            <button type="submit" disabled={creando} className="btn-primary flex items-center gap-2">
              {creando && <Spinner size="sm" />}
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
