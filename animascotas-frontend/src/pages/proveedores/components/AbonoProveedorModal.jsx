import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { registrarAbonoProveedor, getAbonosPorFactura } from '../../../api/proveedores.api';
import styles from './ProveedorModal.module.css';

const abonoSchema = z.object({
  monto: z.coerce.number().positive('Debe ser mayor a 0'),
});

const formatPesos = (valor) =>
  `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const AbonoProveedorModal = ({ isOpen, onClose, factura }) => {
  const queryClient = useQueryClient();

  const { data: abonos = [], isLoading: loadingAbonos } = useQuery({
    queryKey: ['abonos-factura', factura?.id],
    queryFn: () => getAbonosPorFactura(factura.id),
    enabled: !!factura?.id && isOpen,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(abonoSchema),
  });

  const mutation = useMutation({
    mutationFn: (data) => registrarAbonoProveedor(factura.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-vencimiento'] });
      queryClient.invalidateQueries({ queryKey: ['abonos-factura', factura.id] });
      toast.success('Abono registrado');
      reset();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Error al registrar abono'),
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
            {formatPesos(factura.saldoPendiente)}
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

      <div className={styles.historialSection}>
        <h4 className={styles.historialTitle}>Historial de abonos</h4>
        {loadingAbonos ? (
          <LoadingSpinner />
        ) : abonos.length === 0 ? (
          <p className={styles.sinAbonos}>Sin abonos registrados</p>
        ) : (
          <div className={styles.abonosList}>
            {abonos.slice().reverse().map((a) => (
              <div key={a.id} className={styles.abonoItem}>
                <span className={styles.abonoFecha}>
                  {new Date(a.fecha).toLocaleDateString('es-CO')}
                </span>
                <span className={styles.abonoMonto}>
                  +{formatPesos(a.monto)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AbonoProveedorModal;