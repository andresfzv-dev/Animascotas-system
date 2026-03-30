import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { registrarMovimiento } from '../../../api/inventario.api';
import styles from './AjusteStockModal.module.css';

const ajusteSchema = z.object({
  tipo: z.enum(['ENTRADA', 'SALIDA']),
  cantidad: z.coerce.number().int().positive('Debe ser mayor a 0'),
  motivo: z.string().min(1, 'El motivo es obligatorio'),
});

const AjusteStockModal = ({ isOpen, onClose, presentacion }) => {
  const queryClient = useQueryClient();

  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    resolver: zodResolver(ajusteSchema),
    defaultValues: { tipo: 'ENTRADA', cantidad: '', motivo: '' },
  });

  const tipo = watch('tipo');
  const cantidad = watch('cantidad') || 0;
  const stockActual = presentacion?.stock || 0;
  const stockResultante = tipo === 'ENTRADA'
    ? stockActual + Number(cantidad)
    : stockActual - Number(cantidad);

  const mutation = useMutation({
    mutationFn: (data) => registrarMovimiento(presentacion.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Stock actualizado correctamente');
      reset();
      onClose();
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Error al ajustar el stock';
      toast.error(message);
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!presentacion) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Ajustar stock" size="sm">
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>

        <div className={styles.stockInfo}>
          <div className={styles.stockItem}>
            <span className={styles.stockLabel}>Presentación</span>
            <span className={styles.stockValue}>{presentacion.variante}</span>
          </div>
          <div className={styles.stockItem}>
            <span className={styles.stockLabel}>Stock actual</span>
            <span className={styles.stockValue}>{stockActual} unidades</span>
          </div>
        </div>

        <div className={styles.tipoSelector}>
          <label
            className={`${styles.tipoOption} ${tipo === 'ENTRADA' ? styles.entrada : ''}`}
          >
            <input type="radio" value="ENTRADA" {...register('tipo')} hidden />
            <ArrowUp size={18} />
            Entrada
          </label>
          <label
            className={`${styles.tipoOption} ${tipo === 'SALIDA' ? styles.salida : ''}`}
          >
            <input type="radio" value="SALIDA" {...register('tipo')} hidden />
            <ArrowDown size={18} />
            Salida
          </label>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Cantidad</label>
          <input
            type="number"
            min="1"
            className={`${styles.input} ${errors.cantidad ? styles.inputError : ''}`}
            placeholder="0"
            {...register('cantidad')}
          />
          {errors.cantidad && (
            <span className={styles.error}>{errors.cantidad.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Motivo</label>
          <input
            className={`${styles.input} ${errors.motivo ? styles.inputError : ''}`}
            placeholder="Ej: Compra a proveedor, Ajuste de inventario..."
            {...register('motivo')}
          />
          {errors.motivo && (
            <span className={styles.error}>{errors.motivo.message}</span>
          )}
        </div>

        {cantidad > 0 && (
          <div className={`${styles.preview} ${stockResultante < 0 ? styles.previewDanger : ''}`}>
            <span>Stock resultante:</span>
            <strong>{stockResultante} unidades</strong>
          </div>
        )}

        <div className={styles.actions}>
          <Button variant="ghost" onClick={handleClose} type="button">
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isPending}
            variant={tipo === 'SALIDA' ? 'danger' : 'primary'}
          >
            Confirmar {tipo === 'ENTRADA' ? 'entrada' : 'salida'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AjusteStockModal;