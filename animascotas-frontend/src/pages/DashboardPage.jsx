import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { getVentasPorFecha } from '../api/ventas.api';
import { getProductos } from '../api/productos.api';
import { getRecordatorios } from '../api/mascotas.api';
import { getAlertasVencimiento } from '../api/proveedores.api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import useAuthStore from '../store/authStore';
import styles from './DashboardPage.module.css';

const MetodoBadge = ({ metodo, estilos }) => {
  const clase =
    metodo === 'EFECTIVO'
      ? estilos.efectivo
      : metodo === 'TRANSFERENCIA'
      ? estilos.transferencia
      : metodo === 'ABONO'
      ? estilos.abono
      : estilos.credito;
  return <span className={`${estilos.ventaMetodo} ${clase}`}>{metodo}</span>;
};

const DashboardPage = () => {
  const { usuario } = useAuthStore();
  const hoy = format(new Date(), 'yyyy-MM-dd');
  const inicio = `${hoy}T00:00:00`;
  const fin = `${hoy}T23:59:59`;

  const { data: ventasHoy = [], isLoading: loadingVentas } = useQuery({
    queryKey: ['ventas', hoy],
    queryFn: () => getVentasPorFecha(inicio, fin),
    staleTime: 0,
  });

  const { data: recordatorios = [] } = useQuery({
    queryKey: ['recordatorios'],
    queryFn: getRecordatorios,
    staleTime: 0,
  });

  const { data: alertasProveedor = [] } = useQuery({
    queryKey: ['alertas-vencimiento'],
    queryFn: getAlertasVencimiento,
    staleTime: 0,
  });

  const { data: productos = [] } = useQuery({
    queryKey: ['productos'],
    queryFn: getProductos,
  });

  const totalVentasHoy = ventasHoy
    .filter((v) => v.metodoPago !== 'CREDITO')
    .reduce((acc, v) => acc + v.total, 0);

  const totalProductos = productos.reduce((acc, p) => acc + p.presentaciones.length, 0);
  const horaActual = new Date().getHours();
  const saludo =
    horaActual < 12 ? 'Buenos días' : horaActual < 18 ? 'Buenas tardes' : 'Buenas noches';

  if (loadingVentas) return <LoadingSpinner />;

  return (
    <div className={styles.container}>
      <div className={styles.welcomeBar}>
        <div>
          <h1 className={styles.welcomeTitle}>
            {saludo}, {usuario?.nombre}
          </h1>
          <p className={styles.welcomeSub}>
            {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy")}
          </p>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statGreen}`}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ventas de hoy</span>
            <span className={styles.statValue}>
              ${totalVentasHoy.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
            <span className={styles.statSub}>
              {ventasHoy.filter((v) => v.metodoPago !== 'CREDITO').length} transacciones
            </span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <ShoppingCart size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ventas registradas</span>
            <span className={styles.statValue}>{ventasHoy.length}</span>
            <span className={styles.statSub}>En el día de hoy</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <Package size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Presentaciones</span>
            <span className={styles.statValue}>{totalProductos}</span>
            <span className={styles.statSub}>{productos.length} productos base</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Últimas ventas</h2>
            <span className={styles.cardBadge}>{ventasHoy.length}</span>
          </div>
          {ventasHoy.length === 0 ? (
            <p className={styles.empty}>No hay ventas registradas hoy</p>
          ) : (
            <div className={styles.ventasList}>
              {ventasHoy
                .slice(-5)
                .reverse()
                .map((v) => (
                  <div key={v.id} className={styles.ventaItem}>
                    <div className={styles.ventaInfo}>
                      <span className={styles.ventaCliente}>{v.cliente}</span>
                      <span className={styles.ventaProductos}>
                        {v.metodoPago === 'ABONO'
                          ? '💰 Abono recibido'
                          : v.items.map((i) => `${i.producto} x${i.cantidad}`).join(', ')}
                      </span>
                    </div>
                    <div className={styles.ventaDerecha}>
                      <span className={styles.ventaTotal}>
                        ${v.total.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                      </span>
                      <MetodoBadge metodo={v.metodoPago} estilos={styles} />
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        <div className={styles.alertasColumn}>
          {recordatorios.length > 0 && (
            <div className={`${styles.card} ${styles.cardInfo}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Bell size={18} />
                  Vacunas próximas
                </h2>
                <span className={styles.cardBadge}>{recordatorios.length}</span>
              </div>
              <div className={styles.alertasList}>
                {recordatorios.slice(0, 5).map((r) => (
                  <div key={r.id} className={styles.alertaItem}>
                    <span className={styles.alertaNombre}>{r.mascotaNombre}</span>
                    <span className={styles.alertaStock}>{r.fechaProximaDosis}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {alertasProveedor.length > 0 && (
            <div className={`${styles.card} ${styles.cardDanger}`}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <AlertTriangle size={18} />
                  Facturas por vencer
                </h2>
                <span className={styles.cardBadge}>{alertasProveedor.length}</span>
              </div>
              <div className={styles.alertasList}>
                {alertasProveedor.slice(0, 5).map((f) => (
                  <div key={f.id} className={styles.alertaItem}>
                    <span className={styles.alertaNombre}>{f.proveedorNombre}</span>
                    <span className={styles.alertaStock}>
                      ${f.saldoPendiente.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;