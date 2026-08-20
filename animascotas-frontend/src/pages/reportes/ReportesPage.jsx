import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { FileDown, Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import { getVentasPorFecha, getGanancia } from '../../api/ventas.api';
import { getTodasFacturas } from '../../api/proveedores.api';
import { getProductos } from '../../api/productos.api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import useAuthStore from '../../store/authStore';
import { getTotalCreditosPendientes } from '../../api/clientes.api';
import {
  generarReporteDiarioPDF,
  generarReporteProveedoresPDF,
  generarReporteInventarioPDF,
} from '../../utils/reportes';
import { imprimirResumenDia } from '../../utils/impresora';
import styles from './ReportesPage.module.css';

const getMetodoClase = (metodo, estilos) => {
  if (metodo === 'EFECTIVO') return estilos.efectivo;
  if (metodo === 'TRANSFERENCIA') return estilos.transferencia;
  if (metodo === 'CREDITO') return estilos.credito;
  if (metodo === 'MIXTO') return estilos.mixto;
  return estilos.abono;
};

const ReportesPage = () => {
  const { usuario } = useAuthStore();
  const hoy = format(new Date(), 'yyyy-MM-dd');
  const [fechaInicio, setFechaInicio] = useState(hoy);
  const [fechaFin, setFechaFin] = useState(hoy);
  const [vistaReporte, setVistaReporte] = useState('ventas');
  const [modoFiltro, setModoFiltro] = useState('rango'); // 'rango' | 'mes'
  const [mesSeleccionado, setMesSeleccionado] = useState(format(new Date(), 'yyyy-MM'));

  const inicio = modoFiltro === 'mes'
    ? `${format(startOfMonth(new Date(`${mesSeleccionado}-01`)), 'yyyy-MM-dd')}T00:00:00`
    : `${fechaInicio}T00:00:00`;

  const fin = modoFiltro === 'mes'
    ? `${format(endOfMonth(new Date(`${mesSeleccionado}-01`)), 'yyyy-MM-dd')}T23:59:59`
    : `${fechaFin}T23:59:59`;

  const periodoTexto = modoFiltro === 'mes'
    ? format(new Date(`${mesSeleccionado}-01`), 'MMMM yyyy')
    : `${fechaInicio} al ${fechaFin}`;

  const { data: ventas = [], isLoading: loadingVentas } = useQuery({
    queryKey: ['ventas-reporte', modoFiltro, fechaInicio, fechaFin, mesSeleccionado],
    queryFn: () => getVentasPorFecha(inicio, fin),
    staleTime: 0,
  });

  const { data: gananciaReporte = { ganancia: 0 } } = useQuery({
    queryKey: ['ganancia-reporte', modoFiltro, fechaInicio, fechaFin, mesSeleccionado],
    queryFn: () => getGanancia(inicio, fin),
    staleTime: 0,
  });

  const { data: facturas = [], isLoading: loadingFacturas } = useQuery({
    queryKey: ['todas-facturas'],
    queryFn: getTodasFacturas,
    staleTime: 0,
  });

  const { data: productos = [], isLoading: loadingProductos } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const { data: totalCreditoPendiente = 0 } = useQuery({
    queryKey: ['total-credito-pendiente'],
    queryFn: getTotalCreditosPendientes,
    staleTime: 0,
  });

  const totalGeneral = ventas
    .filter((v) => v.metodoPago !== 'CREDITO')
    .reduce((acc, v) => acc + v.total, 0);

  const totalEfectivo = ventas
    .filter((v) => v.metodoPago === 'EFECTIVO')
    .reduce((acc, v) => acc + v.total, 0) +
    ventas
      .filter((v) => v.metodoPago === 'MIXTO')
      .reduce((acc, v) => acc + (v.montoEfectivo || 0), 0);

  const totalTransferencia = ventas
    .filter((v) => v.metodoPago === 'TRANSFERENCIA')
    .reduce((acc, v) => acc + v.total, 0) +
    ventas
      .filter((v) => v.metodoPago === 'MIXTO')
      .reduce((acc, v) => acc + (v.montoTransferencia || 0), 0);

  const totalMixto = ventas
    .filter((v) => v.metodoPago === 'MIXTO')
    .reduce((acc, v) => acc + v.total, 0);

  const totalAbonos = ventas
    .filter((v) => v.metodoPago === 'ABONO')
    .reduce((acc, v) => acc + v.total, 0);

  const productosMasVendidos = ventas
    .filter((v) => v.metodoPago !== 'ABONO')
    .flatMap((v) => v.items)
    .reduce((acc, item) => {
      const key = `${item.producto} - ${item.variante}`;
      acc[key] = (acc[key] || 0) + item.cantidad;
      return acc;
    }, {});

  const topProductos = Object.entries(productosMasVendidos)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const valorTotalInventario = productos
    .flatMap((p) => p.presentaciones)
    .reduce((acc, p) => acc + p.precioVenta * p.stock, 0);

  const totalDeudaProveedores = facturas
    .reduce((acc, f) => acc + f.saldoPendiente, 0);

  const handleExportarPDF = () => {
    generarReporteDiarioPDF(ventas, periodoTexto, usuario?.nombre);
  };

  const handleImprimirResumen = async () => {
    try {
      await imprimirResumenDia(
        ventas,
        periodoTexto,
        usuario?.nombre,
        Number(gananciaReporte.ganancia)
      );
      toast.success('Resumen enviado a la impresora');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loadingVentas || loadingFacturas || loadingProductos) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader title="Reportes" />

      <div className={styles.vistaSelector}>
        {['ventas', 'proveedores', 'inventario'].map((v) => (
          <button
            key={v}
            className={`${styles.vistaBtnReporte} ${vistaReporte === v ? styles.vistaActiveReporte : ''}`}
            onClick={() => setVistaReporte(v)}
          >
            {v === 'ventas' && 'Ventas'}
            {v === 'proveedores' && 'Proveedores'}
            {v === 'inventario' && 'Inventario'}
          </button>
        ))}
      </div>

      {vistaReporte === 'ventas' && (
        <div>
          <div className={styles.toolbarReporte}>
            <div className={styles.filtros}>
              <div className={styles.filtroField}>
                <label className={styles.filtroLabel}>Buscar por</label>
                <select
                  className={styles.filtroInput}
                  value={modoFiltro}
                  onChange={(e) => setModoFiltro(e.target.value)}
                >
                  <option value="rango">Rango de fechas</option>
                  <option value="mes">Mes</option>
                </select>
              </div>

              {modoFiltro === 'rango' ? (
                <>
                  <div className={styles.filtroField}>
                    <label className={styles.filtroLabel}>Desde</label>
                    <input
                      type="date"
                      className={styles.filtroInput}
                      value={fechaInicio}
                      onChange={(e) => setFechaInicio(e.target.value)}
                    />
                  </div>
                  <div className={styles.filtroField}>
                    <label className={styles.filtroLabel}>Hasta</label>
                    <input
                      type="date"
                      className={styles.filtroInput}
                      value={fechaFin}
                      onChange={(e) => setFechaFin(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className={styles.filtroField}>
                  <label className={styles.filtroLabel}>Mes</label>
                  <input
                    type="month"
                    className={styles.filtroInput}
                    value={mesSeleccionado}
                    onChange={(e) => setMesSeleccionado(e.target.value)}
                  />
                </div>
              )}
            </div>
            {ventas.length > 0 && (
              <div className={styles.headerActions}>
                <Button variant="secondary" onClick={handleImprimirResumen}>
                  <Printer size={16} />
                  Imprimir resumen
                </Button>
                <Button onClick={handleExportarPDF}>
                  <FileDown size={16} />
                  Exportar PDF
                </Button>
              </div>
            )}
          </div>

          {ventas.length === 0 ? (
            <EmptyState message="No hay ventas en el período seleccionado" />
          ) : (
            <div className={styles.content}>
              <div className={styles.statsRow}>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Total recaudado</span>
                  <span className={styles.statValue}>
                    ${totalGeneral.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>
                    {ventas.filter((v) => v.metodoPago !== 'CREDITO').length} transacciones
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Efectivo</span>
                  <span className={styles.statValue}>
                    ${totalEfectivo.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>Incluye pagos mixtos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Transferencia</span>
                  <span className={styles.statValue}>
                    ${totalTransferencia.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>Incluye pagos mixtos</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Pagos mixtos</span>
                  <span className={styles.statValue}>
                    ${totalMixto.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>
                    {ventas.filter((v) => v.metodoPago === 'MIXTO').length} ventas
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Abonos recibidos</span>
                  <span className={styles.statValue}>
                    ${totalAbonos.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>
                    {ventas.filter((v) => v.metodoPago === 'ABONO').length} abonos
                  </span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statLabel}>Ganancia estimada</span>
                  <span className={styles.statValue}>
                    ${Number(gananciaReporte.ganancia).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>Utilidad del período</span>
                </div>
              </div>

              <div className={styles.statsRow} style={{ marginTop: '12px' }}>
                <div className={`${styles.statCard} ${styles.statCreditoInfo}`}>
                  <span className={styles.statLabel}>Créditos pendientes de cobro</span>
                  <span className={styles.statValue}>
                    ${Number(totalCreditoPendiente).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.statSub}>Saldo real pendiente</span>
                </div>
              </div>

              <div className={styles.bottomGrid}>
                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Detalle de ventas</h3>
                  <div className={styles.tabla}>
                    <div className={styles.tablaHeader}>
                      <span>Fecha</span>
                      <span>Cliente</span>
                      <span>Productos</span>
                      <span>Método</span>
                      <span>Total</span>
                    </div>
                    {ventas.map((v) => (
                      <div key={v.id} className={`${styles.tablaRow} ${v.metodoPago === 'ABONO' ? styles.rowAbono : ''}`}>
                        <span className={styles.muted}>
                          {format(new Date(v.fecha), 'dd/MM HH:mm')}
                        </span>
                        <span>{v.cliente}</span>
                        <span className={styles.muted}>
                          {v.metodoPago === 'ABONO'
                            ? '💰 Abono recibido'
                            : v.items.map((i) => `${i.producto} x${i.cantidad}`).join(', ')}
                        </span>
                        <span className={`${styles.metodo} ${getMetodoClase(v.metodoPago, styles)}`}>
                          {v.metodoPago}
                        </span>
                        <span className={styles.total}>
                          ${v.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.card}>
                  <h3 className={styles.cardTitle}>Productos más vendidos</h3>
                  {topProductos.length === 0 ? (
                    <p className={styles.empty}>Sin datos</p>
                  ) : (
                    <div className={styles.topList}>
                      {topProductos.map(([nombre, cantidad], idx) => (
                        <div key={nombre} className={styles.topItem}>
                          <div className={styles.topRank}>{idx + 1}</div>
                          <div className={styles.topInfo}>
                            <span className={styles.topNombre}>{nombre}</span>
                            <div className={styles.topBar}>
                              <div
                                className={styles.topBarFill}
                                style={{ width: `${(cantidad / topProductos[0][1]) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className={styles.topCantidad}>{cantidad} uds</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {vistaReporte === 'proveedores' && (
        <div>
          <div className={styles.toolbarReporte}>
            <div className={styles.resumenStat}>
              <span>Deuda total pendiente con proveedores:</span>
              <strong>
                ${totalDeudaProveedores.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </strong>
            </div>
            {facturas.length > 0 && (
              <Button onClick={() => generarReporteProveedoresPDF(facturas)}>
                <FileDown size={16} />
                Exportar PDF
              </Button>
            )}
          </div>

          {facturas.length === 0 ? (
            <EmptyState message="No hay facturas registradas" />
          ) : (
            <div className={styles.tabla}>
              <div className={styles.tablaHeaderProveedores}>
                <span>Proveedor</span>
                <span>N° Factura</span>
                <span>Fecha</span>
                <span>Vencimiento</span>
                <span>Total</span>
                <span>Pagado</span>
                <span>Pendiente</span>
                <span>Estado</span>
              </div>
              {facturas.map((f) => (
                <div
                  key={f.id}
                  className={`${styles.tablaRowProveedores} ${f.vencida ? styles.rowVencida : ''}`}
                >
                  <span className={styles.bold}>{f.proveedorNombre}</span>
                  <span className={styles.muted}>{f.numeroFactura}</span>
                  <span className={styles.muted}>{f.fecha}</span>
                  <span className={`${styles.muted} ${f.vencida ? styles.vencida : ''}`}>
                    {f.fechaVencimiento}
                  </span>
                  <span>
                    ${f.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.pagado}>
                    ${(f.total - f.saldoPendiente).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.pendiente}>
                    ${f.saldoPendiente.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span
                    className={`${styles.estadoBadge} ${
                      f.vencida
                        ? styles.estadoVencida
                        : f.saldoPendiente === 0
                        ? styles.estadoPagada
                        : styles.estadoPendiente
                    }`}
                  >
                    {f.vencida ? 'VENCIDA' : f.saldoPendiente === 0 ? 'PAGADA' : 'PENDIENTE'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {vistaReporte === 'inventario' && (
        <div>
          <div className={styles.toolbarReporte}>
            <div className={styles.resumenStat}>
              <span>Valor total del inventario:</span>
              <strong>
                ${valorTotalInventario.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
              </strong>
            </div>
            {productos.length > 0 && (
              <Button onClick={() => generarReporteInventarioPDF(productos)}>
                <FileDown size={16} />
                Exportar PDF
              </Button>
            )}
          </div>

          <div className={styles.tabla}>
            <div className={styles.tablaHeaderInventario}>
              <span>Producto</span>
              <span>Variante</span>
              <span>Categoría</span>
              <span>Stock</span>
              <span>Mín.</span>
              <span>Precio venta</span>
              <span>Valor en stock</span>
            </div>
            {productos
              .flatMap((p) =>
                p.presentaciones.map((pres) => ({
                  ...pres,
                  productoNombre: p.nombre,
                  categoria: p.categoria,
                }))
              )
              .sort((a, b) => a.productoNombre.localeCompare(b.productoNombre, 'es'))
              .map((p) => (
                <div
                  key={p.id}
                  className={`${styles.tablaRowInventario} ${
                    p.stock === 0 ? styles.rowSinStock : ''
                  } ${p.stockBajo && p.stock > 0 ? styles.rowStockBajo : ''}`}
                >
                  <span className={styles.bold}>{p.productoNombre}</span>
                  <span>{p.variante}</span>
                  <span className={styles.categoriaBadge}>{p.categoria}</span>
                  <span
                    className={`${styles.stockNum} ${
                      p.stock === 0 ? styles.sinStockText : ''
                    } ${p.stockBajo && p.stock > 0 ? styles.stockBajoText : ''}`}
                  >
                    {p.stock}
                  </span>
                  <span className={styles.muted}>{p.stockMinimo}</span>
                  <span>
                    ${p.precioVenta.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                  <span className={styles.valorStock}>
                    ${(p.precioVenta * p.stock).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportesPage;