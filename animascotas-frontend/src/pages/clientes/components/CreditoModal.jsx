import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { FileDown, Printer } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import { getCredito, registrarAbono, registrarDeuda, getAbonosPorCliente } from '../../../api/clientes.api';
import { getVentasPorCliente } from '../../../api/ventas.api';
import { imprimirTicketCredito } from '../../../utils/impresora';
import styles from './ClienteModal.module.css';

const abonoSchema = z.object({
  monto: z.coerce.number().positive('Debe ser mayor a 0'),
});

const formatPesos = (valor) =>
  `$${Number(valor).toLocaleString('es-CO', { maximumFractionDigits: 0 })}`;

const CreditoModal = ({ isOpen, onClose, cliente }) => {
  const queryClient = useQueryClient();

  const { data: credito, isLoading: loadingCredito } = useQuery({
    queryKey: ['credito', cliente?.id],
    queryFn: () => getCredito(cliente.id),
    enabled: !!cliente?.id && isOpen,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: ventas = [], isLoading: loadingVentas } = useQuery({
    queryKey: ['ventas-cliente', cliente?.id],
    queryFn: () => getVentasPorCliente(cliente.id),
    enabled: !!cliente?.id && isOpen,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const { data: abonos = [], isLoading: loadingAbonos } = useQuery({
    queryKey: ['abonos-cliente', cliente?.id],
    queryFn: () => getAbonosPorCliente(cliente.id),
    enabled: !!cliente?.id && isOpen,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const {
    register: registerAbono,
    handleSubmit: handleAbono,
    reset: resetAbono,
    formState: { errors: errorsAbono },
  } = useForm({ resolver: zodResolver(abonoSchema) });

  const {
    register: registerDeuda,
    handleSubmit: handleDeuda,
    reset: resetDeuda,
    formState: { errors: errorsDeuda },
  } = useForm({ resolver: zodResolver(abonoSchema) });

  const abonoMutation = useMutation({
    mutationFn: (data) => registrarAbono(cliente.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credito', cliente.id] });
      queryClient.refetchQueries({ queryKey: ['credito', cliente.id] });
      queryClient.invalidateQueries({ queryKey: ['abonos-cliente', cliente.id] });
      toast.success('Abono registrado');
      resetAbono();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Error al registrar abono'),
  });

  const deudaMutation = useMutation({
    mutationFn: (data) => registrarDeuda(cliente.id, data.monto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credito', cliente.id] });
      queryClient.refetchQueries({ queryKey: ['credito', cliente.id] });
      toast.success('Deuda registrada');
      resetDeuda();
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || 'Error al registrar deuda'),
  });

  const historialCombinado = [
    ...ventas.map((v) => ({ ...v, tipo: 'VENTA', _fecha: new Date(v.fecha) })),
    ...abonos.map((a) => ({ ...a, tipo: 'ABONO', _fecha: new Date(a.fecha) })),
  ].sort((a, b) => b._fecha - a._fecha);

  const generarReporte = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ANIMASCOTAS', 105, 20, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('La Tebaida, Quindío', 105, 27, { align: 'center' });
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text(`Estado de cuenta — ${cliente.nombre}`, 105, 38, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-CO')}`, 14, 48);

    if (credito) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`Deuda total: ${formatPesos(credito.deudaTotal)}`, 14, 58);
      doc.text(`Saldo pendiente: ${formatPesos(credito.saldoPendiente)}`, 14, 65);
    }

    autoTable(doc, {
      startY: 75,
      head: [['Fecha', 'Descripción', 'Tipo', 'Monto']],
      body: historialCombinado.map((item) => [
        item._fecha.toLocaleDateString('es-CO'),
        item.tipo === 'VENTA'
          ? item.items.map((i) => `${i.producto} - ${i.variante} x${i.cantidad}`).join('\n')
          : 'Abono recibido',
        item.tipo,
        item.tipo === 'VENTA'
          ? formatPesos(item.total)
          : `+${formatPesos(item.monto)}`,
      ]),
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [46, 125, 50], textColor: 255 },
      alternateRowStyles: { fillColor: [232, 245, 233] },
      columnStyles: { 1: { cellWidth: 80 } },
      didParseCell: (data) => {
        if (data.column.index === 2 && data.section === 'body') {
          if (data.cell.raw === 'ABONO') {
            data.cell.styles.textColor = [46, 125, 50];
            data.cell.styles.fontStyle = 'bold';
          }
        }
      },
    });

    doc.save(`credito-${cliente.nombre.replace(' ', '-')}.pdf`);
  };

  const handleImprimir = async () => {
    try {
      await imprimirTicketCredito(cliente.nombre, credito, ventas);
      toast.success('Ticket enviado a la impresora');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!cliente) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Crédito — ${cliente.nombre}`}
      size="lg"
    >
      {loadingCredito ? (
        <LoadingSpinner />
      ) : (
        <div className={styles.creditoContainer}>
          {credito ? (
            <div className={styles.creditoInfo}>
              <div className={styles.creditoStat}>
                <span className={styles.creditoLabel}>Deuda total</span>
                <span className={styles.creditoValue}>
                  {formatPesos(credito.deudaTotal)}
                </span>
              </div>
              <div
                className={`${styles.creditoStat} ${
                  credito.saldoPendiente > 0
                    ? styles.creditoPendiente
                    : styles.creditoPagado
                }`}
              >
                <span className={styles.creditoLabel}>Saldo pendiente</span>
                <span
                  className={`${styles.creditoValue} ${
                    credito.saldoPendiente > 0
                      ? styles.creditoRed
                      : styles.creditoGreen
                  }`}
                >
                  {formatPesos(credito.saldoPendiente)}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.sinCredito}>Sin crédito registrado</div>
          )}

          <div className={styles.formSection}>
            <h4 className={styles.sectionTitle}>Registrar deuda</h4>
            <form
              onSubmit={handleDeuda(deudaMutation.mutate)}
              className={styles.inlineForm}
            >
              <input
                type="number"
                className={styles.input}
                placeholder="Monto"
                {...registerDeuda('monto')}
              />
              <Button type="submit" size="sm" isLoading={deudaMutation.isPending}>
                Registrar
              </Button>
            </form>
            {errorsDeuda.monto && (
              <span className={styles.error}>{errorsDeuda.monto.message}</span>
            )}
          </div>

          {credito && credito.saldoPendiente > 0 && (
            <div className={styles.formSection}>
              <h4 className={styles.sectionTitle}>Registrar abono</h4>
              <form
                onSubmit={handleAbono(abonoMutation.mutate)}
                className={styles.inlineForm}
              >
                <input
                  type="number"
                  className={styles.input}
                  placeholder="Monto"
                  {...registerAbono('monto')}
                />
                <Button type="submit" size="sm" isLoading={abonoMutation.isPending}>
                  Abonar
                </Button>
              </form>
              {errorsAbono.monto && (
                <span className={styles.error}>{errorsAbono.monto.message}</span>
              )}
            </div>
          )}

          <div className={styles.formSection}>
            <div className={styles.ventasHeader}>
              <h4 className={styles.sectionTitle}>Historial</h4>
              {historialCombinado.length > 0 && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Button variant="ghost" size="sm" onClick={handleImprimir}>
                    <Printer size={15} />
                  </Button>
                  <Button variant="secondary" size="sm" onClick={generarReporte}>
                    <FileDown size={15} />
                    Reporte PDF
                  </Button>
                </div>
              )}
            </div>

            {loadingVentas || loadingAbonos ? (
              <LoadingSpinner />
            ) : historialCombinado.length === 0 ? (
              <p className={styles.sinCredito}>Sin movimientos registrados</p>
            ) : (
              <div className={styles.ventasList}>
                {historialCombinado.map((item) =>
                  item.tipo === 'ABONO' ? (
                    <div key={item.id} className={styles.abonoItem}>
                      <div className={styles.ventaFecha}>
                        {item._fecha.toLocaleDateString('es-CO')}
                      </div>
                      <div className={styles.ventaProductos}>
                        <span className={styles.abonoBadge}>💰 Abono recibido</span>
                      </div>
                      <span className={styles.abonoTotal}>
                        +{formatPesos(item.monto)}
                      </span>
                    </div>
                  ) : (
                    <div key={item.id} className={styles.ventaItem}>
                      <div className={styles.ventaFecha}>
                        {item._fecha.toLocaleDateString('es-CO')}
                      </div>
                      <div className={styles.ventaProductos}>
                        {item.items.map((i, idx) => (
                          <span key={idx} className={styles.ventaProducto}>
                            {i.producto} — {i.variante} x{i.cantidad}
                          </span>
                        ))}
                      </div>
                      <span className={styles.ventaTotal}>
                        {formatPesos(item.total)}
                      </span>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};

export default CreditoModal;