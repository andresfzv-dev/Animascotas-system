import { useState } from 'react';
import { Plus, History } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import NuevaVentaModal from './components/NuevaVentaModal';
import HistorialVentas from './components/HistorialVentas';
import styles from './VentasPage.module.css';

const VentasPage = () => {
  const [isNuevaVentaOpen, setIsNuevaVentaOpen] = useState(false);
  const [vista, setVista] = useState('historial');

  return (
    <div>
      <PageHeader
        title="Ventas"
        actions={
          <div className={styles.headerActions}>
            <div className={styles.vistaBtns}>
              <button
                className={`${styles.vistaBtn} ${vista === 'historial' ? styles.vistaActive : ''}`}
                onClick={() => setVista('historial')}
              >
                <History size={16} />
                Historial
              </button>
            </div>
            <Button onClick={() => setIsNuevaVentaOpen(true)}>
              <Plus size={18} />
              Nueva venta
            </Button>
          </div>
        }
      />

      <HistorialVentas />

      <NuevaVentaModal
        isOpen={isNuevaVentaOpen}
        onClose={() => setIsNuevaVentaOpen(false)}
      />
    </div>
  );
};

export default VentasPage;