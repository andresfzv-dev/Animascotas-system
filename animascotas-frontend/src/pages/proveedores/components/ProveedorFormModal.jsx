import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createProveedor } from '../../../api/proveedores.api';
import styles from './ProveedorModal.module.css';

const proveedorSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  telefono: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

const ProveedorFormModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(proveedorSchema),
  });

  const mutation = useMutation({
    mutationFn: createProveedor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proveedores'] });
      toast.success('Proveedor creado');
      reset();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al crear proveedor'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nuevo proveedor" size="sm">
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Nombre del proveedor"
            {...register('nombre')}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Teléfono (opcional)</label>
          <input className={styles.input} placeholder="3001234567" {...register('telefono')} />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Email (opcional)</label>
          <input
            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
            placeholder="proveedor@email.com"
            {...register('email')}
          />
          {errors.email && <span className={styles.error}>{errors.email.message}</span>}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending}>Crear proveedor</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProveedorFormModal;