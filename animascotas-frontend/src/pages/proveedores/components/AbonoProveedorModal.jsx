import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { registrarAbonoProveedor } from '../../../api/proveedores.api';
import styles from './ProveedorModal.module.css';

const abonoSchema = z.object({
  monto: z.coerce.number().positive('Debe ser mayor a 0'),
});

const AbonoProveedorModal = ({ isOpen, onClose, factura }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(abonoSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => registrarAbonoProveedor(factura.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-vencimiento'] });
      toast.success('Abono registrado');
      reset();
      onClose();
    },
    onError: (error) => toast.error(error.response?.data?.message || 'Error al registrar abono'),
  });

  if (!factura) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar abono" size="sm">
      <div className={styles.facturaInfo}>
        <div className={styles.facturaRow}>
          <span>Proveedor</span>
          <strong>{factura.proveedorNombre}</strong>
        </div>
        <div className={styles.facturaRow}>
          <span>Factura</span>
          <strong>{factura.numeroFactura}</strong>
        </div>
        <div className={styles.facturaRow}>
          <span>Saldo pendiente</span>
          <strong className={styles.saldo}>
            ${factura.saldoPendiente.toLocaleString('es-CO')}
          </strong>
        </div>
      </div>

      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Monto del abono</label>
          <input
            type="number"
            className={`${styles.input} ${errors.monto ? styles.inputError : ''}`}
            placeholder="0"
            {...register('monto')}
          />
          {errors.monto && <span className={styles.error}>{errors.monto.message}</span>}
        </div>

        <div className={styles.actions}>
          <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
          <Button type="submit" isLoading={mutation.isPending}>Confirmar abono</Button>
        </div>
      </form>
    </Modal>
  );
};

export default AbonoProveedorModal;