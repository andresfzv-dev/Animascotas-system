import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createCliente, updateCliente, eliminarCliente } from '../../../api/clientes.api';
import styles from './ClienteModal.module.css';

const clienteSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  telefono: z.string().optional(),
});

const ClienteFormModal = ({ isOpen, onClose, cliente }) => {
  const queryClient = useQueryClient();
  const isEditing = !!cliente;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(clienteSchema),
  });

  useEffect(() => {
    if (cliente) {
      reset({ nombre: cliente.nombre, telefono: cliente.telefono || '' });
    } else {
      reset({ nombre: '', telefono: '' });
    }
  }, [cliente, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateCliente(cliente.id, data) : createCliente(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success(isEditing ? 'Cliente actualizado' : 'Cliente creado');
      onClose();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Ocurrió un error');
    },
  });

  const eliminarMutation = useMutation({
    mutationFn: () => eliminarCliente(cliente.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      toast.success('Cliente eliminado');
      onClose();
    },
    onError: () => toast.error('No se pudo eliminar el cliente'),
  });

  const handleEliminar = () => {
    if (window.confirm(`¿Eliminar permanentemente a "${cliente.nombre}"?`)) {
      eliminarMutation.mutate();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar cliente' : 'Nuevo cliente'}
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
          {errors.nombre && (
            <span className={styles.error}>{errors.nombre.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Teléfono (opcional)</label>
          <input
            className={styles.input}
            placeholder="Ej: 3001234567"
            {...register('telefono')}
          />
        </div>

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
          <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear cliente'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ClienteFormModal;