import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Image, Download, Edit, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getFacturasPorProveedor, subirImagenFactura } from '../../../api/proveedores.api';
import styles from './ProveedorDetalleModal.module.css';

const formatPesos = (valor) =>
  `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const apiBase = import.meta.env.VITE_API_URL === '/api'
  ? ''
  : 'http://localhost:8080';

const ProveedorDetalleModal = ({ isOpen, onClose, proveedor, onEditarFactura, onAbonar }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [facturaImagenId, setFacturaImagenId] = useState(null);

  const handleDescargarImagen = async (facturaId, numeroFactura) => {
    try {
      const authStorage = localStorage.getItem('auth-storage');
      const token = JSON.parse(authStorage)?.state?.token;

      const response = await fetch(apiBase + '/api/proveedores/facturas/' + facturaId + '/imagen', {
        headers: { Authorization: 'Bearer ' + token }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'factura-' + numeroFactura;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      toast.error('Error al descargar la imagen');
    }
  };

  const { data: facturas = [], isLoading } = useQuery({
    queryKey: ['facturas-proveedor', proveedor?.id],
    queryFn: () => getFacturasPorProveedor(proveedor.id),
    enabled: !!proveedor?.id && isOpen,
    staleTime: 0,
  });

  const subirMutation = useMutation({
    mutationFn: ({ facturaId, archivo }) => subirImagenFactura(facturaId, archivo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facturas-proveedor', proveedor.id] });
      queryClient.invalidateQueries({ queryKey: ['facturas-pendientes'] });
      queryClient.invalidateQueries({ queryKey: ['todas-facturas'] });
      toast.success('Imagen subida correctamente');
      setFacturaImagenId(null);
    },
    onError: () => toast.error('Error al subir la imagen'),
  });

  const handleSubirImagen = (facturaId) => {
    setFacturaImagenId(facturaId);
    fileInputRef.current?.click();
  };

  const handleArchivoSeleccionado = (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;
    subirMutation.mutate({ facturaId: facturaImagenId, archivo });
    e.target.value = '';
  };

  const getEstado = (f) => {
    if (f.saldoPendiente === 0) return { label: 'PAGADA', clase: styles.estadoPagada };
    if (f.vencida) return { label: 'VENCIDA', clase: styles.estadoVencida };
    return { label: 'PENDIENTE', clase: styles.estadoPendiente };
  };

  if (!proveedor) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Facturas — ${proveedor.nombre}`}
      size="xl"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : facturas.length === 0 ? (
        <p className={styles.sinFacturas}>No hay facturas registradas para este proveedor</p>
      ) : (
        <div className={styles.container}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*,.pdf"
            onChange={handleArchivoSeleccionado}
          />

          {facturas.map((f) => {
            const estado = getEstado(f);
            const imagenUrl = apiBase + '/api/proveedores/facturas/' + f.id + '/imagen';
            return (
              <div
                key={f.id}
                className={styles.facturaCard + (f.vencida ? ' ' + styles.cardVencida : '')}
              >
                <div className={styles.facturaHeader}>
                  <div className={styles.facturaInfo}>
                    <h3 className={styles.facturaNumero}>{f.numeroFactura}</h3>
                    <span className={styles.estadoBadge + ' ' + estado.clase}>
                      {estado.label}
                    </span>
                  </div>
                  <div className={styles.facturaAcciones}>
                    <button
                      className={styles.iconBtn}
                      onClick={() => onEditarFactura(f)}
                      title="Editar factura"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className={styles.iconBtn}
                      onClick={() => handleSubirImagen(f.id)}
                      title="Subir imagen"
                      disabled={subirMutation.isPending}
                    >
                      <Upload size={16} />
                    </button>

                    {f.imagenUrl && (
                      <a
                        href={imagenUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.iconBtn}
                        title="Ver imagen"
                      >
                        <Eye size={16} />
                      </a>
                    )}

                    {/* ✅ SOLO ESTE BOTÓN CAMBIÓ */}
                    {f.imagenUrl && (
                      <button
                        className={styles.iconBtn}
                        onClick={() => handleDescargarImagen(f.id, f.numeroFactura)}
                        title="Descargar imagen"
                      >
                        <Download size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div className={styles.facturaDetalles}>
                  <div className={styles.detalle}>
                    <span className={styles.detalleLabel}>Fecha llegada</span>
                    <span>{f.fecha}</span>
                  </div>
                  <div className={styles.detalle}>
                    <span className={styles.detalleLabel}>Vencimiento</span>
                    <span className={f.vencida ? styles.vencidaText : ''}>
                      {f.fechaVencimiento}
                    </span>
                  </div>
                  <div className={styles.detalle}>
                    <span className={styles.detalleLabel}>Total factura</span>
                    <span>{formatPesos(f.total)}</span>
                  </div>
                  <div className={styles.detalle}>
                    <span className={styles.detalleLabel}>Pagado</span>
                    <span className={styles.pagadoText}>
                      {formatPesos(f.total - f.saldoPendiente)}
                    </span>
                  </div>
                  <div className={styles.detalle}>
                    <span className={styles.detalleLabel}>Saldo pendiente</span>
                    <span className={f.saldoPendiente > 0 ? styles.pendienteText : styles.pagadoText}>
                      {formatPesos(f.saldoPendiente)}
                    </span>
                  </div>
                </div>

                {f.imagenUrl ? (
                  <div className={styles.imagenContainer}>
                    <Image size={14} />
                    <span className={styles.imagenLabel}>Imagen adjunta</span>
                    <a
                      href={imagenUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={styles.verImagenLink}
                    >
                      Ver imagen
                    </a>
                  </div>
                ) : (
                  <div className={styles.sinImagen}>
                    <Image size={14} />
                    <span>Sin imagen adjunta — haz clic en ↑ para subir</span>
                  </div>
                )}

                {f.saldoPendiente > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onAbonar(f)}
                    style={{ marginTop: '12px' }}
                  >
                    Registrar abono
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};

export default ProveedorDetalleModal;