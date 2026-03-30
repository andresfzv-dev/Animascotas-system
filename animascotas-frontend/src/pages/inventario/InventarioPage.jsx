import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowUp, ArrowDown, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getProductos, getStockBajo, deleteProducto } from '../../api/productos.api';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import AjusteStockModal from '../productos/components/AjusteStockModal';
import styles from './InventarioPage.module.css';

const InventarioPage = () => {
  const queryClient = useQueryClient();
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
  const [filtro, setFiltro] = useState('todos');
  const [search, setSearch] = useState('');

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const { data: stockBajo = [] } = useQuery({
    queryKey: ['stock-bajo'],
    queryFn: getStockBajo,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      toast.success('Producto eliminado correctamente');
    },
    onError: () => toast.error('No se pudo eliminar el producto'),
  });

  const todasLasPresentaciones = productos.flatMap((p) =>
    p.presentaciones.map((pres) => ({
      ...pres,
      productoNombre: p.nombre,
      productoId: p.id,
      productoCategoria: p.categoria,
    }))
  );

  const valorTotalInventario = todasLasPresentaciones.reduce(
    (acc, p) => acc + p.precioVenta * p.stock, 0
  );

  const presentacionesFiltradas = todasLasPresentaciones
    .filter((p) => {
      const matchFiltro =
        filtro === 'stock-bajo' ? p.stockBajo :
        filtro === 'sin-stock' ? p.stock === 0 : true;
      const matchSearch = search
        ? p.productoNombre.toLowerCase().includes(search.toLowerCase()) ||
          p.variante.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchFiltro && matchSearch;
    })
    .sort((a, b) => a.productoNombre.localeCompare(b.productoNombre, 'es'));

  const handleAjuste = (presentacion, tipo) => {
    setPresentacionSeleccionada({ ...presentacion, tipoDefault: tipo });
    setIsAjusteModalOpen(true);
  };

  const handleEliminarProducto = (productoId, productoNombre) => {
    if (window.confirm(`¿Eliminar "${productoNombre}"? Esta acción no se puede deshacer.`)) {
      deleteMutation.mutate(productoId);
    }
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Inventario"
        subtitle={`${todasLasPresentaciones.length} presentaciones registradas`}
      />

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total presentaciones</span>
          <span className={styles.statValue}>{todasLasPresentaciones.length}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statWarning}`}>
          <span className={styles.statLabel}>Stock bajo</span>
          <span className={styles.statValue}>{stockBajo.length}</span>
        </div>
        <div className={`${styles.statCard} ${styles.statDanger}`}>
          <span className={styles.statLabel}>Sin stock</span>
          <span className={styles.statValue}>
            {todasLasPresentaciones.filter((p) => p.stock === 0).length}
          </span>
        </div>
        <div className={`${styles.statCard} ${styles.statPrimary}`}>
          <span className={styles.statLabel}>Valor total inventario</span>
          <span className={styles.statValue}>
            ${valorTotalInventario.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
          </span>
        </div>
      </div>

      <div className={styles.toolbar}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar producto o variante..."
        />
        <div className={styles.filters}>
          {['todos', 'stock-bajo', 'sin-stock'].map((f) => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filtro === f ? styles.filterActive : ''}`}
              onClick={() => setFiltro(f)}
            >
              {f === 'todos' && 'Todos'}
              {f === 'stock-bajo' && 'Stock bajo'}
              {f === 'sin-stock' && 'Sin stock'}
            </button>
          ))}
        </div>
      </div>

      {presentacionesFiltradas.length === 0 ? (
        <EmptyState message="No hay presentaciones con ese filtro" />
      ) : (
        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <span>Producto</span>
            <span>Variante</span>
            <span>Categoría</span>
            <span>Stock</span>
            <span>Mínimo</span>
            <span>Precio venta</span>
            <span>Valor en stock</span>
            <span>Acciones</span>
          </div>

          {presentacionesFiltradas.map((p) => (
            <div
              key={p.id}
              className={`${styles.tableRow}
                ${p.stockBajo && p.stock > 0 ? styles.rowWarning : ''}
                ${p.stock === 0 ? styles.rowDanger : ''}`}
            >
              <span className={styles.productoNombre}>{p.productoNombre}</span>
              <span>{p.variante}</span>
              <span className={styles.categoria}>{p.productoCategoria}</span>
              <span className={`${styles.stock}
                ${p.stockBajo && p.stock > 0 ? styles.stockBajo : ''}
                ${p.stock === 0 ? styles.sinStock : ''}`}>
                {p.stock}
              </span>
              <span>{p.stockMinimo}</span>
              <span className={styles.precio}>
                ${p.precioVenta.toLocaleString('es-CO')}
              </span>
              <span className={styles.valorStock}>
                ${(p.precioVenta * p.stock).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </span>
              <div className={styles.acciones}>
                <button
                  className={`${styles.accionBtn} ${styles.entrada}`}
                  onClick={() => handleAjuste(p, 'ENTRADA')}
                  title="Registrar entrada"
                >
                  <ArrowUp size={15} />
                </button>
                <button
                  className={`${styles.accionBtn} ${styles.salida}`}
                  onClick={() => handleAjuste(p, 'SALIDA')}
                  title="Registrar salida"
                >
                  <ArrowDown size={15} />
                </button>
                <button
                  className={`${styles.accionBtn} ${styles.eliminar}`}
                  onClick={() => handleEliminarProducto(p.productoId, p.productoNombre)}
                  title="Eliminar producto"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AjusteStockModal
        isOpen={isAjusteModalOpen}
        onClose={() => {
          setIsAjusteModalOpen(false);
          setPresentacionSeleccionada(null);
        }}
        presentacion={presentacionSeleccionada}
      />
    </div>
  );
};

export default InventarioPage;