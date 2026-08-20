import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { PawPrint, Bone, Cat, Dog, Fish, Bird, Heart } from 'lucide-react';
import { loginApi } from '../../api/auth.api';
import useAuthStore from '../../store/authStore';
import styles from './LoginPage.module.css';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es obligatoria'),
});

const pawPositions = [
  { top: '6%', left: '8%', size: 30, rotate: -20 },
  { top: '15%', left: '88%', size: 24, rotate: 15 },
  { top: '38%', left: '3%', size: 22, rotate: 35 },
  { top: '60%', left: '95%', size: 28, rotate: -10 },
  { top: '85%', left: '12%', size: 26, rotate: 25 },
  { top: '72%', left: '48%', size: 20, rotate: -30 },
  { top: '10%', left: '40%', size: 18, rotate: 10 },
  { top: '48%', left: '78%', size: 24, rotate: -15 },
  { top: '28%', left: '58%', size: 20, rotate: 40 },
  { top: '90%', left: '65%', size: 22, rotate: -25 },
  { top: '4%', left: '65%', size: 18, rotate: 5 },
  { top: '55%', left: '20%', size: 24, rotate: -18 },
];

const decorIcons = [
  { Icon: Bone, size: 52, top: '20%', left: '18%', rotate: -25 },
  { Icon: Cat, size: 58, top: '66%', left: '82%', rotate: 10 },
  { Icon: Dog, size: 54, top: '80%', left: '28%', rotate: -8 },
  { Icon: Fish, size: 44, top: '12%', left: '72%', rotate: 20 },
  { Icon: Bird, size: 40, top: '35%', left: '92%', rotate: -15 },
  { Icon: Heart, size: 32, top: '58%', left: '6%', rotate: 15 },
  { Icon: PawPrint, size: 46, top: '90%', left: '88%', rotate: 30 },
  { Icon: Bone, size: 34, top: '5%', left: '25%', rotate: 40 },
  { Icon: Cat, size: 36, top: '45%', left: '42%', rotate: -20 },
];

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
      <div className={styles.pawsLayer}>
        {pawPositions.map((p, idx) => (
          <PawPrint
            key={idx}
            className={styles.paw}
            size={p.size}
            style={{ top: p.top, left: p.left, transform: `rotate(${p.rotate}deg)` }}
          />
        ))}
      </div>

      {decorIcons.map(({ Icon, size, top, left, rotate }, idx) => (
        <Icon
          key={idx}
          className={styles.decorIcon}
          size={size}
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        />
      ))}

      <div className={styles.card}>
        <div className={styles.brand}>
          <div className={styles.brandIconWrap}>
            <PawPrint size={36} color="var(--color-primary)" />
          </div>
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