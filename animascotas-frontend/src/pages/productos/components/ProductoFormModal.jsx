import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Trash2, Plus } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import { createProducto, updateProducto, deleteProducto } from '../../../api/productos.api';
import { createCategoria } from '../../../api/categorias.api';
import styles from './FormModal.module.css';

const productoSchema = z.object({
  nombre: z.string().min(1, 'El nombre es obligatorio'),
  descripcion: z.string().optional(),
  categoriaId: z.string().min(1, 'La categoría es obligatoria'),
});

const ProductoFormModal = ({ isOpen, onClose, producto, categorias }) => {
  const queryClient = useQueryClient();
  const isEditing = !!producto;
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productoSchema),
  });

  useEffect(() => {
    if (producto) {
      const categoria = categorias.find((c) => c.nombre === producto.categoria);
      reset({
        nombre: producto.nombre,
        descripcion: producto.descripcion || '',
        categoriaId: categoria?.id || '',
      });
    } else {
      reset({ nombre: '', descripcion: '', categoriaId: '' });
    }
    setMostrarNuevaCategoria(false);
    setNuevaCategoria('');
  }, [producto, categorias, reset]);

  const saveMutation = useMutation({
    mutationFn: (data) =>
      isEditing ? updateProducto(producto.id, data) : createProducto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success(isEditing ? 'Producto actualizado' : 'Producto creado');
      onClose();
    },
    onError: () => toast.error('Ocurrió un error, intenta de nuevo'),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteProducto(producto.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado');
      onClose();
    },
    onError: () => toast.error('No se pudo eliminar el producto'),
  });

  const handleCrearCategoria = async () => {
    if (!nuevaCategoria.trim()) {
      toast.error('Escribe el nombre de la categoría');
      return;
    }
    try {
      const cat = await createCategoria(nuevaCategoria.trim());
      await queryClient.invalidateQueries({ queryKey: ['categorias'] });
      setValue('categoriaId', cat.id);
      toast.success(`Categoría "${cat.nombre}" creada`);
      setMostrarNuevaCategoria(false);
      setNuevaCategoria('');
    } catch {
      toast.error('Error al crear la categoría');
    }
  };

  const handleDelete = () => {
    if (window.confirm(`¿Eliminar "${producto.nombre}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar producto' : 'Nuevo producto'}
    >
      <form onSubmit={handleSubmit(saveMutation.mutate)} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Nombre</label>
          <input
            className={`${styles.input} ${errors.nombre ? styles.inputError : ''}`}
            placeholder="Ej: NexGard Spectra"
            {...register('nombre')}
          />
          {errors.nombre && (
            <span className={styles.error}>{errors.nombre.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <div className={styles.categoriaHeader}>
            <label className={styles.label}>Categoría</label>
            <button
              type="button"
              className={styles.nuevaCategoriaBtn}
              onClick={() => setMostrarNuevaCategoria(!mostrarNuevaCategoria)}
            >
              <Plus size={14} />
              Nueva categoría
            </button>
          </div>

          {mostrarNuevaCategoria && (
            <div className={styles.nuevaCategoriaRow}>
              <input
                className={styles.input}
                placeholder="Nombre de la nueva categoría"
                value={nuevaCategoria}
                onChange={(e) => setNuevaCategoria(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCrearCategoria())}
                autoFocus
              />
              <Button type="button" size="sm" onClick={handleCrearCategoria}>
                Crear
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setMostrarNuevaCategoria(false);
                  setNuevaCategoria('');
                }}
              >
                Cancelar
              </Button>
            </div>
          )}

          <select
            className={`${styles.input} ${errors.categoriaId ? styles.inputError : ''}`}
            {...register('categoriaId')}
          >
            <option value="">Seleccionar categoría</option>
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
          {errors.categoriaId && (
            <span className={styles.error}>{errors.categoriaId.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Descripción (opcional)</label>
          <textarea
            className={styles.textarea}
            placeholder="Descripción del producto..."
            rows={3}
            {...register('descripcion')}
          />
        </div>

        <div className={styles.actions}>
          {isEditing && (
            <Button
              variant="danger"
              type="button"
              isLoading={deleteMutation.isPending}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Eliminar
            </Button>
          )}
          <div className={styles.actionsRight}>
            <Button variant="ghost" onClick={onClose} type="button">
              Cancelar
            </Button>
            <Button type="submit" isLoading={saveMutation.isPending}>
              {isEditing ? 'Guardar cambios' : 'Crear producto'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default ProductoFormModal;