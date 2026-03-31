import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { registrarVacuna } from '../../../api/mascotas.api';
import styles from './MascotaModal.module.css';

const vacunaSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  informacion: z.string().optional(),
  fechaAplicacion: z.string().min(1, 'La fecha de aplicación es obligatoria'),
  fechaProximaDosis: z.string().min(1, 'La fecha de próxima dosis es obligatoria'),
});

const VacunaFormModal = ({ isOpen, onClose, mascota }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(vacunaSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => registrarVacuna(mascota.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      toast.success('Vacuna registrada');
      reset();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar vacuna'),
  });

  if (!mascota) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Vacuna — ${mascota.nombre}`} size="sm">
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Nombre de la vacuna</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Ej: Antirrábica"
            {...register('nombre')}
          />
          {errors.nombre && <span className={styles.error}>{errors.nombre.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Información adicional (opcional)</label>
          <textarea
            className={styles.textarea}
            placeholder="Dosis, laboratorio, observaciones..."
            rows={2}
            {...register('informacion')}
          />
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Fecha aplicación</label>
            <input type="date" className={styles.input} {...register('fechaAplicacion')} />
            {errors.fechaAplicacion && <span className={styles.error}>{errors.fechaAplicacion.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Próxima dosis</label>
            <input type="date" className={styles.input} {...register('fechaProximaDosis')} />
            {errors.fechaProximaDosis && <span className={styles.error}>{errors.fechaProximaDosis.message}</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending}>Registrar vacuna</Button>
        </div>
      </form>
    </Modal>
  );
};

export default VacunaFormModal;