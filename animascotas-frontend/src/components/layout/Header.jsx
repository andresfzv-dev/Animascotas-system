import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import styles from './Header.module.css';

const Header = () => {
  const { usuario, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <h1 className={styles.title}>Sistema de Gestión</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.userInfo}>
          <User size={16} />
          <span>{usuario?.nombre}</span>
          <span className={styles.role}>{usuario?.rol}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={18} />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
};

export default Header;