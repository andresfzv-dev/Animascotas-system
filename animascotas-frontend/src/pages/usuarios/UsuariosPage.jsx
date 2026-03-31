import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { getUsuarios } from '../../api/usuarios.api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import UsuarioFormModal from './components/UsuarioFormModal';
import styles from './UsuariosPage.module.css';

const UsuariosPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const { data: usuarios = [], isLoading } = useQuery({
    queryKey: ['usuarios'],
    queryFn: getUsuarios,
    staleTime: 0,
  });

  const handleEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setIsModalOpen(true);
  };

  const handleNuevo = () => {
    setUsuarioSeleccionado(null);
    setIsModalOpen(true);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Usuarios"
        subtitle={`${usuarios.length} usuarios registrados`}
        actions={
          <Button onClick={handleNuevo}>
            <Plus size={18} />
            Nuevo usuario
          </Button>
        }
      />

      {usuarios.length === 0 ? (
        <EmptyState message="No hay usuarios registrados" />
      ) : (
        <div className={styles.tabla}>
          <div className={styles.header}>
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Estado</span>
            <span>Acciones</span>
          </div>
          {usuarios.map((u) => (
            <div key={u.id} className={`${styles.row} ${!u.activo ? styles.rowInactivo : ''}`}>
              <span className={styles.nombre}>{u.nombre}</span>
              <span className={styles.muted}>{u.email}</span>
              <span className={`${styles.badge} ${u.rol === 'ADMIN' ? styles.badgeAdmin : styles.badgeEmpleado}`}>
                {u.rol}
              </span>
              <div className={styles.estado}>
                {u.activo
                  ? <><UserCheck size={15} className={styles.iconActivo} /> Activo</>
                  : <><UserX size={15} className={styles.iconInactivo} /> Inactivo</>
                }
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleEditar(u)}>
                Editar
              </Button>
            </div>
          ))}
        </div>
      )}

      <UsuarioFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setUsuarioSeleccionado(null);
        }}
        usuario={usuarioSeleccionado}
      />
    </div>
  );
};

export default UsuariosPage;