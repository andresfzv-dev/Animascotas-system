import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import { getVentasPorFecha, getGanancia } from '../api/ventas.api';
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

  const inicioMes = `${format(startOfMonth(new Date()), 'yyyy-MM-dd')}T00:00:00`;

  const { data: ventasHoy = [], isLoading: loadingVentas } = useQuery({
    queryKey: ['ventas', hoy],
    queryFn: () => getVentasPorFecha(inicio, fin),
    staleTime: 0,
  });


  const { data: gananciaHoy = { ganancia: 0 } } = useQuery({
    queryKey: ['ganancia-hoy', hoy],
    queryFn: () => getGanancia(inicio, fin),
    staleTime: 0,
  });


  const { data: gananciaMes = { ganancia: 0 } } = useQuery({
    queryKey: ['ganancia-mes', hoy],
    queryFn: () => getGanancia(inicioMes, fin),
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

        {/* ✅ NUEVAS CARDS */}
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ganancia hoy</span>
            <span className={styles.statValue}>
              ${Number(gananciaHoy.ganancia).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
            <span className={styles.statSub}>Utilidad del día</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <TrendingUp size={24} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Ganancia del mes</span>
            <span className={styles.statValue}>
              ${Number(gananciaMes.ganancia).toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </span>
            <span className={styles.statSub}>{format(new Date(), 'MMMM yyyy')}</span>
          </div>
        </div>
      </div>

      <div className={styles.bottomGrid}>
        {/* resto intacto */}
      </div>
    </div>
  );
};

export default DashboardPage;