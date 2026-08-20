import { useState } from 'react';
import { Edit, Package, AlertTriangle, Plus, BarChart2 } from 'lucide-react';
import Button from '../../../components/common/Button';
import PresentacionFormModal from './PresentacionFormModal';
import AjusteStockModal from './AjusteStockModal';
import styles from './ProductoCard.module.css';

const ProductoCard = ({ producto, onEditar, soloStockBajo, search }) => {
  const [isPresentacionModalOpen, setIsPresentacionModalOpen] = useState(false);
  const [isAjusteModalOpen, setIsAjusteModalOpen] = useState(false);
  const [presentacionSeleccionada, setPresentacionSeleccionada] = useState(null);
  const [presentacionAjuste, setPresentacionAjuste] = useState(null);

  const tieneStockBajo = producto.presentaciones.some((p) => p.stockBajo);

  const esBusquedaCodigo = search && search.length > 1 &&
    producto.presentaciones.some(
      (p) => p.codigoBarras?.toLowerCase().includes(search.toLowerCase())
    ) &&
    !producto.nombre.toLowerCase().includes(search.toLowerCase());

  const presentacionesMostradas = (() => {
    let result = producto.presentaciones;
    if (soloStockBajo) {
      result = result.filter((p) => p.stockBajo);
    }
    if (esBusquedaCodigo) {
      result = result.filter((p) =>
        p.codigoBarras?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  })();

  const handleNuevaPresentacion = () => {
    setPresentacionSeleccionada(null);
    setIsPresentacionModalOpen(true);
  };

  const handleEditarPresentacion = (presentacion) => {
    setPresentacionSeleccionada(presentacion);
    setIsPresentacionModalOpen(true);
  };

  const handleAjusteStock = (e, presentacion) => {
    e.stopPropagation();
    setPresentacionAjuste(presentacion);
    setIsAjusteModalOpen(true);
  };

  return (
    <>
      <div className={styles.card}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <Package size={20} className={styles.icon} />
            <div>
              <h3 className={styles.nombre}>{producto.nombre}</h3>
              <span className={styles.categoria}>{producto.categoria}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            {tieneStockBajo && (
              <AlertTriangle size={18} className={styles.alertIcon} title="Stock bajo" />
            )}
            <Button variant="ghost" size="sm" onClick={() => onEditar(producto)}>
              <Edit size={16} />
            </Button>
          </div>
        </div>

        {producto.descripcion && (
          <p className={styles.descripcion}>{producto.descripcion}</p>
        )}

        <div className={styles.presentaciones}>
          <div className={styles.presentacionesHeader}>
            <span className={styles.presentacionesTitle}>Presentaciones</span>
            <button className={styles.addBtn} onClick={handleNuevaPresentacion}>
              <Plus size={14} />
              Agregar
            </button>
          </div>

          {presentacionesMostradas.length === 0 ? (
            <p className={styles.sinPresentaciones}>Sin presentaciones</p>
          ) : (
            <div className={styles.presentacionesList}>
              {presentacionesMostradas.map((p) => (
                <div
                  key={p.id}
                  className={`${styles.presentacion} ${p.stockBajo ? styles.stockBajo : ''}`}
                >
                  <div
                    className={styles.presentacionClickable}
                    onClick={() => handleEditarPresentacion(p)}
                  >
                    <div className={styles.presentacionInfo}>
                      <span className={styles.variante}>{p.variante}</span>
                      <span className={styles.precio}>
                        ${p.precioVenta.toLocaleString('es-CO')}
                      </span>
                    </div>
                    <div className={styles.presentacionStock}>
                      <span className={`${styles.stock} ${p.stockBajo ? styles.stockBajoText : ''}`}>
                        Stock: {p.stock}
                      </span>
                      {p.codigoBarras && (
                        <span className={styles.codigo}>{p.codigoBarras}</span>
                      )}
                    </div>
                  </div>
                  <button
                    className={styles.ajusteBtn}
                    onClick={(e) => handleAjusteStock(e, p)}
                    title="Ajustar stock"
                  >
                    <BarChart2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PresentacionFormModal
        isOpen={isPresentacionModalOpen}
        onClose={() => {
          setIsPresentacionModalOpen(false);
          setPresentacionSeleccionada(null);
        }}
        productoId={producto.id}
        presentacion={presentacionSeleccionada}
      />

      <AjusteStockModal
        isOpen={isAjusteModalOpen}
        onClose={() => {
          setIsAjusteModalOpen(false);
          setPresentacionAjuste(null);
        }}
        presentacion={presentacionAjuste}
      />
    </>
  );
};

export default ProductoCard;