import { PackageOpen } from 'lucide-react';
import styles from './EmptyState.module.css';

const EmptyState = ({ message = 'No hay datos para mostrar', icon: Icon = PackageOpen }) => {
  return (
    <div className={styles.container}>
      <Icon size={48} className={styles.icon} />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default EmptyState;