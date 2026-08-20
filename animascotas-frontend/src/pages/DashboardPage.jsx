import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Package, TrendingUp, Download, Upload } from 'lucide-react';
import { format, startOfMonth } from 'date-fns';
import toast from 'react-hot-toast';
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

    const getToken = () => {
  try {
    const stored = localStorage.getItem('auth-storage');
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
};

const handleBackup = async () => {
  try {
    toast.loading('Generando backup...');
    const token = getToken();
    const response = await fetch('/api/backup/exportar', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    if (!response.ok) throw new Error();
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `animascotas_backup_${hoy}.sql`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.dismiss();
    toast.success('Backup descargado correctamente');
  } catch {
    toast.dismiss();
    toast.error('Error al generar el backup');
  }
};

const handleImportar = async (e) => {
  const archivo = e.target.files[0];
  if (!archivo) return;
  if (!window.confirm('¿Estás seguro? Esto reemplazará todos los datos actuales con los del backup.')) return;

  const formData = new FormData();
  formData.append('archivo', archivo);
  const token = getToken();

  try {
    toast.loading('Importando backup...');
    const response = await fetch('/api/backup/importar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) throw new Error();
    toast.dismiss();
    toast.success('Backup importado. Recarga la página.');
  } catch {
    toast.dismiss();
    toast.error('Error al importar el backup');
  }
  e.target.value = '';
};

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
<div style={{ display: 'flex', gap: '8px' }}>
<button className={styles.backupBtn} onClick={() => {
  handleBackup();
}}>
  <Download size={16} />
  Backup
</button>
  <label className={styles.backupBtn} style={{ cursor: 'pointer' }}>
    <Upload size={16} />
    Importar backup
    <input
      type="file"
      accept=".sql"
      style={{ display: 'none' }}
      onChange={handleImportar}
    />
  </label>
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