import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner} />
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;