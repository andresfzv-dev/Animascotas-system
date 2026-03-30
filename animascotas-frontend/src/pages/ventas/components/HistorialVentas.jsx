import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FileDown, Receipt, Printer } from 'lucide-react';
import { getVentasPorFecha } from '../../../api/ventas.api';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import useAuthStore from '../../../store/authStore';
import { generarReporteDiarioPDF, generarTicketVentaPDF } from '../../../utils/reportes';
import { imprimirTicketVenta, imprimirResumenDia } from '../../../utils/impresora';
import toast from 'react-hot-toast';
import styles from './HistorialVentas.module.css';

const HistorialVentas = () => {
  const hoy = new Date();
  const { usuario } = useAuthStore();
  const [fecha, setFecha] = useState(format(hoy, 'yyyy-MM-dd'));
  const [filtroMetodo, setFiltroMetodo] = useState('');
  const [filtroProducto, setFiltroProducto] = useState('');

  const handleImprimirTicket = async (venta) => {
    try {
      await imprimirTicketVenta(venta, usuario?.nombre);
      toast.success('Ticket enviado a la impresora');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImprimirResumen = async () => {
    try {
      await imprimirResumenDia(ventasFiltradas, fecha, usuario?.nombre);
      toast.success('Resumen enviado a la impresora');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const inicio = `${fecha}T00:00:00`;
  const fin = `${fecha}T23:59:59`;

  const { data: ventas = [], isLoading } = useQuery({
    queryKey: ['ventas', fecha],
    queryFn: () => getVentasPorFecha(inicio, fin),
  });

  const ventasFiltradas = ventas.filter((v) => {
    const matchMetodo = filtroMetodo ? v.metodoPago === filtroMetodo : true;
    const matchProducto = filtroProducto
      ? v.items.some((i) =>
          `${i.producto} ${i.variante}`.toLowerCase().includes(filtroProducto.toLowerCase())
        )
      : true;
    return matchMetodo && matchProducto;
  });

  const totalDia = ventasFiltradas.reduce((acc, v) => acc + v.total, 0);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className={styles.datePicker}
        />
        <input
          type="text"
          placeholder="Filtrar por producto..."
          value={filtroProducto}
          onChange={(e) => setFiltroProducto(e.target.value)}
          className={styles.datePicker}
        />
        <select
          className={styles.datePicker}
          value={filtroMetodo}
          onChange={(e) => setFiltroMetodo(e.target.value)}
        >
          <option value="">Todos los métodos</option>
          <option value="EFECTIVO">Efectivo</option>
          <option value="TRANSFERENCIA">Transferencia</option>
        </select>
        {ventasFiltradas.length > 0 && (
          <div className={styles.totalDia}>
            <span>Total:</span>
            <strong>${totalDia.toLocaleString('es-CO')}</strong>
          </div>
        )}
        {ventas.length > 0 && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => generarReporteDiarioPDF(ventasFiltradas, fecha, usuario?.nombre)}
          >
            <FileDown size={16} />
            Reporte PDF
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleImprimirResumen}
        >
          <Printer size={16} />
          Imprimir resumen
        </Button>
      </div>

      {ventasFiltradas.length === 0 ? (
        <EmptyState message="No hay ventas con ese filtro" />
      ) : (
        <div className={styles.tabla}>
          <div className={styles.header}>
            <span>Hora</span>
            <span>Cliente</span>
            <span>Productos</span>
            <span>Método</span>
            <span>Total</span>
            <span>Recibido</span>
            <span>Cambio</span>
            <span></span>
          </div>
          {ventasFiltradas.map((v) => (
            <div key={v.id} className={styles.row}>
              <span className={styles.hora}>
                {format(new Date(v.fecha), 'hh:mm a', { locale: es })}
              </span>
              <span>{v.cliente}</span>
              <div className={styles.productos}>
                {v.items.map((i, idx) => (
                  <span key={idx} className={styles.productoItem}>
                    {i.producto} — {i.variante} x{i.cantidad}
                  </span>
                ))}
              </div>
              <span className={`${styles.metodo} ${v.metodoPago === 'EFECTIVO' ? styles.efectivo : styles.transferencia}`}>
                {v.metodoPago}
              </span>
              <span className={styles.total}>
                ${v.total.toLocaleString('es-CO')}
              </span>
              <span className={styles.recibido}>
                ${v.montoRecibido.toLocaleString('es-CO')}
              </span>
              <span className={styles.cambio}>
                ${v.cambio.toLocaleString('es-CO')}
              </span>
              <button
                className={styles.ticketBtn}
                onClick={() => generarTicketVentaPDF(v, usuario?.nombre)}
                title="Descargar ticket"
              >
                <Receipt size={15} />
              </button>

              <button
                className={styles.ticketBtn}
                onClick={() => handleImprimirTicket(v)}
                title="Imprimir ticket"
              >
                <Printer size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistorialVentas;