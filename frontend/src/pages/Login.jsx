import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, Lock, LogIn, Boxes } from 'lucide-react';
import { LOGIN_MUTATION } from '../apollo/queries';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const validationSchema = Yup.object({
  email: Yup.string().email('Email inválido').required('El email es requerido'),
  password: Yup.string().min(6, 'Mínimo 6 caracteres').required('La contraseña es requerida'),
});

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [autenticar, { loading }] = useMutation(LOGIN_MUTATION);

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const { data } = await autenticar({ variables: values });
        const { token, usuario } = data.autenticarUsuario;
        login(token, usuario);
        toast.success(`Bienvenido, ${usuario.nombre}`);
        navigate('/dashboard');
      } catch (error) {
        toast.error(error.message || 'Credenciales incorrectas');
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* Panel izquierdo — decorativo */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0f2547] via-[#1a3a6b] to-[#0f2547]
                      flex-col items-center justify-center p-12 relative overflow-hidden">
        {/* Círculos decorativos */}
        <div className="absolute top-[-80px] right-[-80px] w-80 h-80 rounded-full
                        bg-[#7dc242]/10 blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full
                        bg-blue-400/10 blur-3xl" />

        <div className="relative z-10 text-center max-w-sm">
          <div className="w-20 h-20 rounded-2xl bg-[#7dc242] flex items-center justify-center
                          mx-auto mb-8 shadow-2xl">
            <Boxes size={40} className="text-white" strokeWidth={1.8} />
          </div>
          <h2 className="text-3xl font-bold text-white mb-3 leading-tight">
            Sistema de Inventario<br />y Kardex
          </h2>
          <p className="text-blue-300 text-sm leading-relaxed">
            Control preciso de stock, entradas y salidas con precio promedio ponderado en tiempo real.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: 'Productos', value: '9+' },
              { label: 'Categorías', value: '6' },
              { label: 'Roles', value: '3' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-2xl font-bold text-[#7dc242]">{s.value}</p>
                <p className="text-xs text-blue-300 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-sm">
          {/* Logo móvil */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#1a3a6b] flex items-center justify-center">
              <Boxes size={20} className="text-[#7dc242]" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">AOA · Inventario</p>
              <p className="text-xs text-slate-400">Administración Operativa Automotriz</p>
            </div>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-800">Iniciar sesión</h1>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="usuario@aoa.com"
                  className={`input-field pl-9 ${formik.touched.email && formik.errors.email ? 'input-error' : ''}`}
                  {...formik.getFieldProps('email')}
                />
              </div>
              {formik.touched.email && formik.errors.email && (
                <p className="text-rose-500 text-xs mt-1">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`input-field pl-9 ${formik.touched.password && formik.errors.password ? 'input-error' : ''}`}
                  {...formik.getFieldProps('password')}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-rose-500 text-xs mt-1">{formik.errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 mt-2"
            >
              {loading ? <Spinner size="sm" /> : <LogIn size={16} />}
              {loading ? 'Ingresando...' : 'Ingresar al sistema'}
            </button>
          </form>

          {/* Credenciales de prueba */}
          <div className="mt-6 p-4 bg-white rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Credenciales de prueba
            </p>
            <div className="space-y-2">
              {[
                { rol: 'Admin',    email: 'admin@aoa.com',    pass: 'admin123', color: 'bg-rose-50 text-rose-700 border-rose-100' },
                { rol: 'Operador', email: 'operador@aoa.com', pass: 'oper123',  color: 'bg-blue-50 text-blue-700 border-blue-100' },
              ].map((c) => (
                <button
                  key={c.rol}
                  type="button"
                  onClick={() => {
                    formik.setFieldValue('email', c.email);
                    formik.setFieldValue('password', c.pass);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                    border text-xs transition-colors hover:opacity-80 ${c.color}`}
                >
                  <span className="font-semibold">{c.rol}</span>
                  <span className="font-mono opacity-80">{c.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
