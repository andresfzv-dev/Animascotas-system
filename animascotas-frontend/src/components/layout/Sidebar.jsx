import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  PawPrint, Truck, BarChart2, Archive, UserCog,
  Dog, Cat, Bird, Fish, Bone,
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

const footerPawPositions = [
  { top: '10%', left: '15%', size: 16, rotate: -20 },
  { top: '55%', left: '80%', size: 14, rotate: 15 },
  { top: '75%', left: '30%', size: 12, rotate: 35 },
  { top: '20%', left: '65%', size: 18, rotate: -10 },
];

const floatingDecor = [
  { Icon: Bone, size: 60, top: '15%', left: '20%', rotate: -25 },
  { Icon: Fish, size: 44, top: '65%', left: '75%', rotate: 20 },
  { Icon: Bird, size: 36, top: '40%', left: '10%', rotate: -15 },
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

      <div className={styles.decorSection}>
        {floatingDecor.map(({ Icon, size, top, left, rotate }, idx) => (
          <Icon
            key={idx}
            className={styles.decorFloating}
            size={size}
            style={{ top, left, transform: `rotate(${rotate}deg)` }}
          />
        ))}
        <div className={styles.decorIconsGroup}>
          <Dog size={26} />
          <Cat size={26} />
          <PawPrint size={22} />
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.footerPaws}>
          {footerPawPositions.map((p, idx) => (
            <PawPrint
              key={idx}
              className={styles.footerPaw}
              size={p.size}
              style={{ top: p.top, left: p.left, transform: `rotate(${p.rotate}deg)` }}
            />
          ))}
        </div>
        <div className={styles.footerContent}>
          <div className={styles.footerIconWrap}>
            <Dog size={16} />
          </div>
          <span>Cuidando a tus mejores amigos</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;