import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createUsuario, updateUsuario, eliminarUsuario } from '../../../api/usuarios.api';
import styles from './UsuarioModal.module.css';

const MODULOS = [
  { key: 'DASHBOARD',   label: 'Dashboard' },
  { key: 'VENTAS',      label: 'Ventas' },
  { key: 'PRODUCTOS',   label: 'Productos' },
  { key: 'INVENTARIO',  label: 'Inventario' },
  { key: 'CLIENTES',    label: 'Clientes' },
  { key: 'MASCOTAS',    label: 'Mascotas' },
  { key: 'PROVEEDORES', label: 'Proveedores' },
  { key: 'REPORTES',    label: 'Reportes' },
];

const baseSchema = {
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Email inválido'),
  rol: z.enum(['ADMIN', 'EMPLEADO']),
};

const createSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

const editSchema = z.object({
  ...baseSchema,
  password: z.string().min(8, 'Mínimo 8 caracteres').optional().or(z.literal('')),
});

const UsuarioFormModal = ({ isOpen, onClose, usuario }) => {
  const queryClient = useQueryClient();
  const isEditing = !!usuario;

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(isEditing ? editSchema : createSchema),
  });

  const rolActual = watch('rol');
  const modulosActuales = watch('modulos') || [];

  useEffect(() => {
    if (usuario) {
      reset({
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        password: '',
        modulos: usuario.modulos || [],
      });
    } else {
      reset({
        nombre: '',
        email: '',
        rol: 'EMPLEADO',
        password: '',
        modulos: [],
      });
    }
  }, [usuario, reset]);

  const toggleModulo = (key) => {
    const actuales = modulosActuales || [];
    if (actuales.includes(key)) {
      setValue('modulos', actuales.filter((m) => m !== key));
    } else {
      setValue('modulos', [...actuales, key]);
    }
  };

const saveMutation = useMutation({
  mutationFn: (data) => {
    const payload = {
      ...data,
      modulos: modulosActuales,
    };
    return isEditing ? updateUsuario(usuario.id, payload) : createUsuario(payload);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    toast.success(isEditing ? 'Usuario actualizado' : 'Usuario creado');
    onClose();
  },
  onError: (error) =>
    toast.error(error.response?.data?.message || 'Error al guardar usuario'),
});

  const eliminarMutation = useMutation({
    mutationFn: () => eliminarUsuario(usuario.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      toast.success('Usuario eliminado');
      onClose();
    },
    onError: () => toast.error('No se pudo eliminar el usuario'),
  });

  const handleEliminar = () => {
    if (window.confirm(`¿Eliminar permanentemente a "${usuario.nombre}"?`)) {
      eliminarMutation.mutate();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
      size="md"
    >
      <form onSubmit={handleSubmit(saveMutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Nombre completo"
            {...register('nombre')}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email</label>
          <input
            type="email"
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="correo@ejemplo.com"
            {...register('email')}
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            Contraseña{' '}
            {isEditing && (
              <span className={styles.hint}>(dejar vacío para no cambiar)</span>
            )}
          </label>
          <input
            type="password"
            className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
            placeholder={isEditing ? '••••••••' : 'Mínimo 8 caracteres'}
            {...register('password')}
          />
          {errors.password && <span className={styles.error}>{errors.password.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Rol</label>
          <select className={styles.input} {...register('rol')}>
            <option value="EMPLEADO">Empleado</option>
            <option value="ADMIN">Administrador</option>
          </select>
        </div>

        {rolActual === 'EMPLEADO' && (
          <div className={styles.field}>
            <label className={styles.label}>
              Módulos habilitados
              <span className={styles.hint}>
                ({modulosActuales.length} de {MODULOS.length} seleccionados)
              </span>
            </label>
            <div className={styles.modulosGrid}>
              {MODULOS.map((m) => (
                <label key={m.key} className={styles.moduloToggle}>
                  <input
                    type="checkbox"
                    checked={modulosActuales.includes(m.key)}
                    onChange={() => toggleModulo(m.key)}
                  />
                  <span className={`${styles.moduloLabel} ${
                    modulosActuales.includes(m.key) ? styles.moduloActivo : ''
                  }`}>
                    {m.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <div className={styles.actions}>
          {isEditing && (
            <Button
              variant="danger"
              type="button"
              size="sm"
              isLoading={eliminarMutation.isPending}
              onClick={handleEliminar}
            >
              Eliminar
            </Button>
          )}
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear usuario'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default UsuarioFormModal;