import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  PawPrint, Truck, BarChart2, Archive, UserCog,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import styles from './Sidebar.module.css';

const TODOS_LOS_MODULOS = [
  { path: '/',            label: 'Dashboard',    icon: LayoutDashboard, modulo: 'DASHBOARD',    end: true },
  { path: '/productos',   label: 'Productos',    icon: Package,         modulo: 'PRODUCTOS' },
  { path: '/ventas',      label: 'Ventas',       icon: ShoppingCart,    modulo: 'VENTAS' },
  { path: '/clientes',    label: 'Clientes',     icon: Users,           modulo: 'CLIENTES' },
  { path: '/mascotas',    label: 'Mascotas',     icon: PawPrint,        modulo: 'MASCOTAS' },
  { path: '/proveedores', label: 'Proveedores',  icon: Truck,           modulo: 'PROVEEDORES' },
  { path: '/reportes',    label: 'Reportes',     icon: BarChart2,       modulo: 'REPORTES' },
  { path: '/inventario',  label: 'Inventario',   icon: Archive,         modulo: 'INVENTARIO' },
];

const Sidebar = () => {
  const { usuario, tieneModulo } = useAuthStore();

  const modulosVisibles = TODOS_LOS_MODULOS.filter((m) =>
    tieneModulo(m.modulo)
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <PawPrint size={28} />
        <span>Animascotas</span>
      </div>

      <nav className={styles.nav}>
        <ul className={styles.navList}>
          {modulosVisibles.map(({ path, icon: Icon, label, end }) => (
            <li key={path}>
              <NavLink
                to={path}
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
              <li>
                <NavLink
                  to="/usuarios"
                  className={({ isActive }) =>
                    `${styles.navItem} ${isActive ? styles.active : ''}`
                  }
                >
                  <UserCog size={20} />
                  <span>Usuarios</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;