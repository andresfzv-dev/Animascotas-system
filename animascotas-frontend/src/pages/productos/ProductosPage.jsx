import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { getProductos } from '../../api/productos.api';
import { getCategorias } from '../../api/categorias.api';
import PageHeader from '../../components/common/PageHeader';
import SearchBar from '../../components/common/SearchBar';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProductoCard from './components/ProductoCard';
import ProductoFormModal from './components/ProductoFormModal';
import styles from './ProductosPage.module.css';

const ProductosPage = () => {
  const [search, setSearch] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [soloStockBajo, setSoloStockBajo] = useState(false);

  const { data: productos = [], isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const { data: categorias = [] } = useQuery({
    queryKey: ['categorias'],
    queryFn: getCategorias,
  });

  const productosFiltrados = productos
    .filter((p) => {
      const matchNombre = p.nombre.toLowerCase().includes(search.toLowerCase());
      const matchCodigo = p.presentaciones.some(
        (pres) => pres.codigoBarras?.toLowerCase().includes(search.toLowerCase())
      );
      const matchCategoria = categoriaFiltro ? p.categoria === categoriaFiltro : true;
      const matchStockBajo = soloStockBajo
        ? p.presentaciones.some((pres) => pres.stockBajo)
        : true;
      return (matchNombre || matchCodigo) && matchCategoria && matchStockBajo;
    })
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const handleNuevoProducto = () => {
    setProductoSeleccionado(null);
    setIsModalOpen(true);
  };

  const handleEditarProducto = (producto) => {
    setProductoSeleccionado(producto);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductoSeleccionado(null);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Productos"
        subtitle={`${productos.length} productos registrados`}
        actions={
          <Button onClick={handleNuevoProducto}>
            <Plus size={18} />
            Nuevo producto
          </Button>
        }
      />

      <div className={styles.filters}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar por nombre o código de barras..."
        />

        <select
          className={styles.select}
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.nombre}>
              {cat.nombre}
            </option>
          ))}
        </select>

        <button
          className={`${styles.stockBajoBtn} ${soloStockBajo ? styles.stockBajoActive : ''}`}
          onClick={() => setSoloStockBajo(!soloStockBajo)}
        >
          Stock bajo
        </button>
      </div>

      {productosFiltrados.length === 0 ? (
        <EmptyState message="No se encontraron productos" />
      ) : (
        <div className={styles.grid}>
          {productosFiltrados.map((producto) => (
            <ProductoCard
              key={producto.id}
              producto={producto}
              onEditar={handleEditarProducto}
              soloStockBajo={soloStockBajo}
              search={search}
            />
          ))}
        </div>
      )}

      <ProductoFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        producto={productoSeleccionado}
        categorias={categorias}
      />
    </div>
  );
};

export default ProductosPage;