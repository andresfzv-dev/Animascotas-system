import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  UserCog,
  PawPrint,
  Truck,
  BarChart2,
  Warehouse,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import styles from './Sidebar.module.css';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/productos', icon: Package, label: 'Productos' },
  { to: '/ventas', icon: ShoppingCart, label: 'Ventas' },
  { to: '/clientes', icon: Users, label: 'Clientes' },
  { to: '/mascotas', icon: PawPrint, label: 'Mascotas' },
  { to: '/proveedores', icon: Truck, label: 'Proveedores' },
  { to: '/reportes', icon: BarChart2, label: 'Reportes' },
  { to: '/inventario', icon: Warehouse, label: 'Inventario' },
];

const adminItems = [
  { to: '/usuarios', icon: UserCog, label: 'Usuarios' },
];

const Sidebar = () => {
  const { usuario } = useAuthStore();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <PawPrint size={28} />
        <span>Animascotas</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <Icon size={20} />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}

          {usuario?.rol === 'ADMIN' && (
            <>
              <li className={styles.divider} />
              {adminItems.map(({ to, icon: Icon, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    className={({ isActive }) =>
                      `${styles.navItem} ${isActive ? styles.active : ''}`
                    }
                  >
                    <Icon size={20} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;