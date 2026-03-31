import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { PawPrint } from 'lucide-react';
import { loginApi } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

const onSubmit = async (data) => {
  setIsLoading(true);
  try {
    const response = await loginApi(data);
    login(response.token, {
      nombre: response.nombre,
      rol: response.rol,
      modulos: response.modulos,
    });
    toast.success(`Bienvenido, ${response.nombre}`);
    navigate('/');
  } catch {
    toast.error('Credenciales incorrectas');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.brand}>
          <PawPrint size={40} color="var(--color-primary)" />
          <h1>Animascotas</h1>
          <p>Sistema de Gestión</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Correo electrónico</label>
            <input
              type="email"
              placeholder="admin@animascotas.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              {...register('email')}
            />
            {errors.email && (
              <span className={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              {...register('password')}
            />
            {errors.password && (
              <span className={styles.error}>{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;