import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createMascota } from '../../../api/mascotas.api';
import styles from './MascotaModal.module.css';

const mascotaSchema = z.object({
  clienteId: z.string().min(1, 'El cliente es obligatorio'),
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  especie: z.string().optional(),
  raza: z.string().optional(),
  fechaNacimiento: z.string().optional(),
});

const MascotaFormModal = ({ isOpen, onClose, clientes }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(mascotaSchema),
  });

  const clienteId = watch('clienteId');

  const mutation = useMutation({
    mutationFn: createMascota,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mascotas', clienteId] });
      toast.success('Mascota registrada');
      reset();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar mascota'),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nueva mascota" size="sm">
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Cliente</label>
          <select
            className={`${styles.input} ${errors.clienteId ? styles.inputError : ''}`}
            {...register('clienteId')}
          >
            <option value="">Seleccionar cliente...</option>
            {clientes.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
          {errors.clienteId && <span className={styles.error}>{errors.clienteId.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre de la mascota</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Ej: Firulais"
            {...register('nombre')}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Especie</label>
            <input className={styles.input} placeholder="Perro, Gato..." {...register('especie')} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Raza</label>
            <input className={styles.input} placeholder="Opcional" {...register('raza')} />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Fecha de nacimiento (opcional)</label>
          <input type="date" className={styles.input} {...register('fechaNacimiento')} />
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending}>Registrar mascota</Button>
        </div>
      </form>
    </Modal>
  );
};

export default MascotaFormModal;