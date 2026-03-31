import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { registrarFactura } from '../../../api/proveedores.api';
import styles from './ProveedorModal.module.css';

const facturaSchema = z.object({
  numeroFactura: z.string().min(1, 'El número de factura es obligatorio'),
  total: z.coerce.number().positive('Debe ser mayor a 0'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  fechaVencimiento: z.string().min(1, 'La fecha de vencimiento es obligatoria'),
});

const FacturaModal = ({ isOpen, onClose, proveedor }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(facturaSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => registrarFactura(proveedor.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas-pendientes'] });
      toast.success('Factura registrada');
      reset();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar factura'),
  });

  if (!proveedor) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Nueva factura — ${proveedor.nombre}`} size="sm">
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Número de factura</label>
          <input
            className={`${styles.input} ${errors.numeroFactura ? styles.inputError : ''}`}
            placeholder="Ej: FAC-001"
            {...register('numeroFactura')}
          />
          {errors.numeroFactura && <span className={styles.error}>{errors.numeroFactura.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Total</label>
          <input
            type="number"
            className={`${styles.input} ${errors.total ? styles.inputError : ''}`}
            placeholder="0"
            {...register('total')}
          />
          {errors.total && <span className={styles.error}>{errors.total.message}</span>}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Fecha</label>
            <input type="date" className={styles.input} {...register('fecha')} />
            {errors.fecha && <span className={styles.error}>{errors.fecha.message}</span>}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Vencimiento</label>
            <input type="date" className={styles.input} {...register('fechaVencimiento')} />
            {errors.fechaVencimiento && <span className={styles.error}>{errors.fechaVencimiento.message}</span>}
          </div>
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending}>Registrar factura</Button>
        </div>
      </form>
    </Modal>
  );
};

export default FacturaModal;