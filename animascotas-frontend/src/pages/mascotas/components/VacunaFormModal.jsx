import { useState } from 'react';
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
  precio: z.coerce.number().positive('El precio debe ser mayor a 0'),
});

const VacunaFormModal = ({ isOpen, onClose, mascota }) => {
  const queryClient = useQueryClient();
  const [showCobro, setShowCobro] = useState(false);
  const [vacunaRegistrada, setVacunaRegistrada] = useState(null);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(vacunaSchema),
  });

  const precio = watch('precio') || 0;
  const cambio = montoRecibido ? Number(montoRecibido) - Number(precio) : 0;

  const mutation = useMutation({
    mutationFn: (data) => registrarVacuna(mascota.id, data),
    onSuccess: (vacuna) => {
      queryClient.invalidateQueries({ queryKey: ['recordatorios'] });
      setVacunaRegistrada(vacuna);
      setShowCobro(true);
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Error al registrar vacuna'),
  });

const cobrarMutation = useMutation({
  mutationFn: async () => {
    const { createVenta } = await import('../../../api/ventas.api');
    return createVenta({
      clienteId: mascota.clienteId || null,
      metodoPago: metodoPago,
      montoRecibido: metodoPago === 'TRANSFERENCIA' ? Number(precio) : Number(montoRecibido),
      esCredito: false,
      items: [],
      descripcionServicio: `Vacuna — ${mascota.nombre}`,
      totalServicio: Number(precio),
    });
  },
  onSuccess: (venta) => {
    queryClient.invalidateQueries({ queryKey: ['ventas'] });
    const cambioFinal = metodoPago === 'EFECTIVO'
      ? Number(montoRecibido) - Number(precio)
      : 0;
    toast.success(`Cobro registrado — Cambio: $${cambioFinal.toLocaleString('es-CO')}`);
    handleClose();
  },
  onError: () => toast.error('Vacuna registrada pero no se pudo registrar el cobro'),
});

  const handleClose = () => {
    reset();
    setShowCobro(false);
    setVacunaRegistrada(null);
    setMontoRecibido('');
    setMetodoPago('EFECTIVO');
    onClose();
  };

  if (!mascota) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={showCobro ? `Cobrar vacuna — ${mascota.nombre}` : `Vacuna — ${mascota.nombre}`}
      size="sm"
    >
      {!showCobro ? (
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
            <label className={styles.label}>Precio</label>
            <input
              type="number"
              className={`${styles.input} ${errors.precio ? styles.inputError : ''}`}
              placeholder="0"
              {...register('precio')}
            />
            {errors.precio && <span className={styles.error}>{errors.precio.message}</span>}
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
              {errors.fechaAplicacion && (
                <span className={styles.error}>{errors.fechaAplicacion.message}</span>
              )}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Próxima dosis</label>
              <input type="date" className={styles.input} {...register('fechaProximaDosis')} />
              {errors.fechaProximaDosis && (
                <span className={styles.error}>{errors.fechaProximaDosis.message}</span>
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleClose} type="button">Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>
              Registrar vacuna
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.form}>
          <div className={styles.cobroInfo}>
            <div className={styles.cobroRow}>
              <span>Vacuna</span>
              <strong>{vacunaRegistrada?.nombre}</strong>
            </div>
            <div className={styles.cobroRow}>
              <span>Mascota</span>
              <strong>{mascota.nombre}</strong>
            </div>
            <div className={styles.cobroRow}>
              <span>Total a cobrar</span>
              <strong className={styles.cobroTotal}>
                ${Number(precio).toLocaleString('es-CO')}
              </strong>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Método de pago</label>
            <div className={styles.metodoPago}>
              {['EFECTIVO', 'TRANSFERENCIA'].map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`${styles.metodoBtn} ${metodoPago === m ? styles.metodoActive : ''}`}
                  onClick={() => setMetodoPago(m)}
                >
                  {m === 'EFECTIVO' ? '💵 Efectivo' : '📲 Transferencia'}
                </button>
              ))}
            </div>
          </div>

          {metodoPago === 'EFECTIVO' && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Monto recibido</label>
                <input
                  type="number"
                  className={styles.input}
                  placeholder="0"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  autoFocus
                />
              </div>
              {montoRecibido && (
                <div className={`${styles.cambioRow} ${cambio < 0 ? styles.cambioNegativo : ''}`}>
                  <span>Cambio</span>
                  <strong>${cambio.toLocaleString('es-CO')}</strong>
                </div>
              )}
            </>
          )}

          <div className={styles.actions}>
            <Button variant="ghost" onClick={handleClose} type="button">
              Cancelar
            </Button>
            <Button
              onClick={() => cobrarMutation.mutate()}
              isLoading={cobrarMutation.isPending}
              disabled={metodoPago === 'EFECTIVO' && (!montoRecibido || cambio < 0)}
            >
              Confirmar cobro
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default VacunaFormModal;