import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, AlertTriangle } from 'lucide-react';
import { getProveedores, getFacturasPendientes, getAlertasVencimiento } from '../../api/proveedores.api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ProveedorFormModal from './components/ProveedorFormModal';
import FacturaModal from './components/FacturaModal';
import AbonoProveedorModal from './components/AbonoProveedorModal';
import ProveedorDetalleModal from './components/ProveedorDetalleModal'; // ✅ IMPORT AGREGADO
import styles from './ProveedoresPage.module.css';

const FacturasTabla = ({ facturas }) => {
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className={styles.tabla}>
        <div className={styles.headerFactura}>
          <span>Proveedor</span>
          <span>N° Factura</span>
          <span>Total</span>
          <span>Saldo</span>
          <span>Vencimiento</span>
          <span>Acciones</span>
        </div>
        {facturas.map((f) => (
          <div
            key={f.id}
            className={`${styles.row} ${f.vencida ? styles.rowVencida : ''}`}
            style={{ gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr 1fr' }}
          >
            <span className={styles.nombre}>{f.proveedorNombre}</span>
            <span className={styles.muted}>{f.numeroFactura}</span>
            <span>${f.total.toLocaleString('es-CO')}</span>
            <span className={styles.saldoPendiente}>
              ${f.saldoPendiente.toLocaleString('es-CO')}
            </span>
            <span className={`${styles.muted} ${f.vencida ? styles.vencida : ''}`}>
              {f.fechaVencimiento} {f.vencida && '⚠️'}
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFacturaSeleccionada(f);
                  setIsEditModalOpen(true);
                }}
              >
                Editar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setFacturaSeleccionada(f);
                  setIsAbonoModalOpen(true);
                }}
              >
                Abonar
              </Button>
            </div>
          </div>
        ))}
      </div>

      <AbonoProveedorModal
        isOpen={isAbonoModalOpen}
        onClose={() => {
          setIsAbonoModalOpen(false);
          setFacturaSeleccionada(null);
        }}
        factura={facturaSeleccionada}
      />

      <FacturaModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFacturaSeleccionada(null);
        }}
        proveedor={{ nombre: facturaSeleccionada?.proveedorNombre, id: facturaSeleccionada?.proveedorId }}
        factura={facturaSeleccionada}
      />
    </>
  );
};

const ProveedoresPage = () => {
  const [isProveedorModalOpen, setIsProveedorModalOpen] = useState(false);
  const [isFacturaModalOpen, setIsFacturaModalOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState(null);
  const [vista, setVista] = useState('proveedores');

  // ✅ ESTADOS AGREGADOS
  const [isDetalleModalOpen, setIsDetalleModalOpen] = useState(false);
  const [proveedorDetalle, setProveedorDetalle] = useState(null);
  const [isEditFacturaOpen, setIsEditFacturaOpen] = useState(false);
  const [isAbonoOpen, setIsAbonoOpen] = useState(false);
  const [facturaSeleccionadaDetalle, setFacturaSeleccionadaDetalle] = useState(null);

  const { data: proveedores = [], isLoading } = useQuery({
    queryKey: ['proveedores'],
    queryFn: getProveedores,
  });

  const { data: facturasPendientes = [] } = useQuery({
    queryKey: ['facturas-pendientes'],
    queryFn: getFacturasPendientes,
  });

  const { data: alertas = [] } = useQuery({
    queryKey: ['alertas-vencimiento'],
    queryFn: getAlertasVencimiento,
    staleTime: 0,
  });

  const handleRegistrarFactura = (proveedor) => {
    setProveedorSeleccionado(proveedor);
    setIsFacturaModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Proveedores"
        actions={
          <div className={styles.headerActions}>
            <div className={styles.vistaBtns}>
              {['proveedores', 'pendientes', 'alertas'].map((v) => (
                <button
                  key={v}
                  className={`${styles.vistaBtn} ${vista === v ? styles.vistaActive : ''}`}
                  onClick={() => setVista(v)}
                >
                  {v === 'proveedores' && 'Proveedores'}
                  {v === 'pendientes' && `Pendientes (${facturasPendientes.length})`}
                  {v === 'alertas' && (
                    <span className={styles.alertaLabel}>
                      {alertas.length > 0 && <AlertTriangle size={14} />}
                      Alertas ({alertas.length})
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Button onClick={() => setIsProveedorModalOpen(true)}>
              <Plus size={18} />
              Nuevo proveedor
            </Button>
          </div>
        }
      />

      {vista === 'proveedores' && (
        proveedores.length === 0 ? (
          <EmptyState message="No hay proveedores registrados" />
        ) : (
          <div className={styles.tabla}>
            <div className={styles.header}>
              <span>Nombre</span>
              <span>Teléfono</span>
              <span>Email</span>
              <span>Acciones</span>
            </div>
            {proveedores.map((p) => (
              <div key={p.id} className={styles.row}>
                <span className={styles.nombre}>{p.nombre}</span>
                <span className={styles.muted}>{p.telefono || '—'}</span>
                <span className={styles.muted}>{p.email || '—'}</span>

                {/* ✅ BOTONES ACTUALIZADOS */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setProveedorDetalle(p);
                      setIsDetalleModalOpen(true);
                    }}
                  >
                    Ver facturas
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRegistrarFactura(p)}
                  >
                    + Factura
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {vista === 'pendientes' && (
        facturasPendientes.length === 0 ? (
          <EmptyState message="No hay facturas pendientes" />
        ) : (
          <FacturasTabla facturas={facturasPendientes} />
        )
      )}

      {vista === 'alertas' && (
        alertas.length === 0 ? (
          <EmptyState message="No hay alertas de vencimiento" />
        ) : (
          <FacturasTabla facturas={alertas} />
        )
      )}

      <ProveedorFormModal
        isOpen={isProveedorModalOpen}
        onClose={() => setIsProveedorModalOpen(false)}
      />

      <FacturaModal
        isOpen={isFacturaModalOpen}
        onClose={() => {
          setIsFacturaModalOpen(false);
          setProveedorSeleccionado(null);
        }}
        proveedor={proveedorSeleccionado}
      />

      {/* ✅ MODALES AGREGADOS */}
      <ProveedorDetalleModal
        isOpen={isDetalleModalOpen}
        onClose={() => {
          setIsDetalleModalOpen(false);
          setProveedorDetalle(null);
        }}
        proveedor={proveedorDetalle}
        onEditarFactura={(f) => {
          setFacturaSeleccionadaDetalle(f);
          setIsEditFacturaOpen(true);
        }}
        onAbonar={(f) => {
          setFacturaSeleccionadaDetalle(f);
          setIsAbonoOpen(true);
        }}
      />

      <FacturaModal
        isOpen={isEditFacturaOpen}
        onClose={() => {
          setIsEditFacturaOpen(false);
          setFacturaSeleccionadaDetalle(null);
        }}
        proveedor={proveedorDetalle}
        factura={facturaSeleccionadaDetalle}
      />

      <AbonoProveedorModal
        isOpen={isAbonoOpen}
        onClose={() => {
          setIsAbonoOpen(false);
          setFacturaSeleccionadaDetalle(null);
        }}
        factura={facturaSeleccionadaDetalle}
      />
    </div>
  );
};

export default ProveedoresPage;