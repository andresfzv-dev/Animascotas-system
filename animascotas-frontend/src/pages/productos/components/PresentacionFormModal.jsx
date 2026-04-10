import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Scan } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createPresentacion, updatePresentacion, deletePresentacion } from '../../../api/productos.api';
import styles from './FormModal.module.css';

const presentacionSchema = z.object({
  variante: z.string().min(1, 'La variante es obligatoria'),
  precioProveedor: z.coerce.number().positive('Debe ser mayor a 0'),
  porcentajeGanancia: z.coerce.number().min(0, 'No puede ser negativo'),
  codigoBarras: z.string().optional(),
  stockMinimo: z.coerce.number().min(0, 'No puede ser negativo'),
  stockInicial: z.coerce.number().min(0, 'No puede ser negativo'),
  precioVentaOverride: z.coerce.number().optional(),
});

const PresentacionFormModal = ({ isOpen, onClose, productoId, presentacion }) => {
  const queryClient = useQueryClient();
  const isEditing = !!presentacion;
  const codigoBarrasRef = useRef(null);

  const [precioVentaManual, setPrecioVentaManual] = useState('');

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(presentacionSchema),
    defaultValues: { stockMinimo: 1, porcentajeGanancia: 0, stockInicial: 0 },
  });

  const precioProveedor = watch('precioProveedor') || 0;
  const porcentajeGanancia = watch('porcentajeGanancia') || 0;
  const precioVentaCalculado = precioProveedor * (1 + porcentajeGanancia / 100);

  useEffect(() => {
    if (presentacion) {
      reset({
        variante: presentacion.variante,
        precioProveedor: presentacion.precioProveedor,
        porcentajeGanancia: presentacion.porcentajeGanancia,
        codigoBarras: presentacion.codigoBarras || '',
        stockMinimo: presentacion.stockMinimo,
        stockInicial: 0,
      });
      setPrecioVentaManual(presentacion.precioVenta?.toString() || '');
    } else {
      reset({
        variante: '', precioProveedor: '', porcentajeGanancia: 0,
        codigoBarras: '', stockMinimo: 1, stockInicial: 0,
      });
      setPrecioVentaManual('');
    }
  }, [presentacion, reset]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        ...data,
        precioVenta: precioVentaManual ? Number(precioVentaManual) : null,
      };
      return isEditing
        ? updatePresentacion(presentacion.id, payload)
        : createPresentacion(productoId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success(isEditing ? 'Presentación actualizada' : 'Presentación creada');
      reset({
        variante: '', precioProveedor: '', porcentajeGanancia: 0,
        codigoBarras: '', stockMinimo: 1, stockInicial: 0,
      });
      setPrecioVentaManual('');
      onClose();
    },
    onError: () => toast.error('Ocurrió un error, intenta de nuevo'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deletePresentacion(presentacion.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Presentación eliminada');
      onClose();
    },
    onError: () => toast.error('No se pudo eliminar la presentación'),
  });

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar la presentación "${presentacion.variante}"?`)) {
      deleteMutation.mutate();
    }
  };

  const handleFocusCodigo = () => {
    codigoBarrasRef.current?.focus();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar presentación' : 'Nueva presentación'}
    >
      <form onSubmit={handleSubmit(mutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Variante</label>
          <input
            className={`${styles.input} ${errors.variante ? styles.inputError : ''}`}
            placeholder="Ej: 1kg, Rojo, Talla S"
            {...register('variante')}
          />
          {errors.variante && (
            <span className={styles.error}>{errors.variante.message}</span>
          )}
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Precio proveedor</label>
            <input
              type="number"
              className={`${styles.input} ${errors.precioProveedor ? styles.inputError : ''}`}
              placeholder="0"
              {...register('precioProveedor')}
            />
            {errors.precioProveedor && (
              <span className={styles.error}>{errors.precioProveedor.message}</span>
            )}
          </div>
          <div className={styles.field}>
            <label className={styles.label}>% Ganancia</label>
            <input
              type="number"
              className={`${styles.input} ${errors.porcentajeGanancia ? styles.inputError : ''}`}
              placeholder="0"
              {...register('porcentajeGanancia')}
            />
            {errors.porcentajeGanancia && (
              <span className={styles.error}>{errors.porcentajeGanancia.message}</span>
            )}
          </div>
        </div>

        <div className={styles.precioVenta}>
          <div className={styles.precioVentaInfo}>
            <span>Precio de venta calculado:</span>
            <strong>
              ${precioVentaCalculado.toLocaleString('es-CO', { minimumFractionDigits: 0 })}
            </strong>
          </div>
          <div className={styles.field} style={{ marginTop: '8px' }}>
            <label className={styles.label}>
              Precio de venta final
              <span className={styles.hint}> (ingrésalo manualmente)</span>
            </label>
            <input
              type="number"
              className={styles.input}
              value={precioVentaManual}
              onChange={(e) => setPrecioVentaManual(e.target.value)}
              placeholder={Math.round(precioVentaCalculado)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Código de barras</label>
          <div className={styles.codigoBarrasWrapper}>
            <input
              className={styles.input}
              placeholder="Escanea o deja vacío para generar automáticamente"
              {...register('codigoBarras')}
              ref={(e) => {
                register('codigoBarras').ref(e);
                codigoBarrasRef.current = e;
              }}
            />
            <button
              type="button"
              className={styles.scanBtn}
              onClick={handleFocusCodigo}
              title="Listo para escanear"
            >
              <Scan size={18} />
            </button>
          </div>
          <span className={styles.hint}>
            Si dejas este campo vacío, el sistema generará un código automáticamente
          </span>
        </div>

        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Stock mínimo</label>
            <input
              type="number"
              className={`${styles.input} ${errors.stockMinimo ? styles.inputError : ''}`}
              {...register('stockMinimo')}
            />
            {errors.stockMinimo && (
              <span className={styles.error}>{errors.stockMinimo.message}</span>
            )}
          </div>
          {!isEditing && (
            <div className={styles.field}>
              <label className={styles.label}>Stock inicial</label>
              <input
                type="number"
                className={`${styles.input} ${errors.stockInicial ? styles.inputError : ''}`}
                placeholder="0"
                {...register('stockInicial')}
              />
              {errors.stockInicial && (
                <span className={styles.error}>{errors.stockInicial.message}</span>
              )}
            </div>
          )}
        </div>

        <div className={styles.actions}>
          {isEditing && (
            <Button
              variant="danger"
              type="button"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              Eliminar
            </Button>
          )}
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={onClose} type="button">Cancelar</Button>
            <Button type="submit" isLoading={mutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear presentación'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PresentacionFormModal;