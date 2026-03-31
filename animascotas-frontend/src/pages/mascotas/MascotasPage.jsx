import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Bell } from 'lucide-react';
import { getClientes } from '../../api/clientes.api';
import { getMascotasPorCliente, getRecordatorios } from '../../api/mascotas.api';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import MascotaFormModal from './components/MascotaFormModal';
import VacunaFormModal from './components/VacunaFormModal';
import styles from './MascotasPage.module.css';

const MascotasPage = () => {
  const [vista, setVista] = useState('mascotas');
  const [clienteFiltro, setClienteFiltro] = useState('');
  const [isMascotaModalOpen, setIsMascotaModalOpen] = useState(false);
  const [isVacunaModalOpen, setIsVacunaModalOpen] = useState(false);
  const [mascotaSeleccionada, setMascotaSeleccionada] = useState(null);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes'],
    queryFn: getClientes,
  });

  const { data: todasMascotas = [], isLoading } = useQuery({
    queryKey: ['mascotas-todas', clientes.map((c) => c.id)],
    queryFn: async () => {
      if (clientes.length === 0) return [];
      const resultados = await Promise.all(
        clientes.map((c) =>
          getMascotasPorCliente(c.id).then((mascotas) =>
            mascotas.map((m) => ({ ...m, clienteNombre: c.nombre, clienteId: c.id }))
          )
        )
      );
      return resultados.flat();
    },
    enabled: clientes.length > 0,
    staleTime: 0,
  });

  const { data: recordatorios = [] } = useQuery({
    queryKey: ['recordatorios'],
    queryFn: getRecordatorios,
    staleTime: 0,
  });

  const mascotasFiltradas = clienteFiltro
    ? todasMascotas.filter((m) => m.clienteId === clienteFiltro)
    : todasMascotas;

  const handleRegistrarVacuna = (mascota) => {
    setMascotaSeleccionada(mascota);
    setIsVacunaModalOpen(true);
  };

  return (
    <div>
      <PageHeader
        title="Mascotas"
        subtitle={`${todasMascotas.length} mascotas registradas`}
        actions={
          <div className={styles.headerActions}>
            <div className={styles.vistaBtns}>
              <button
                className={`${styles.vistaBtn} ${vista === 'mascotas' ? styles.vistaActive : ''}`}
                onClick={() => setVista('mascotas')}
              >
                Mascotas
              </button>
              <button
                className={`${styles.vistaBtn} ${vista === 'recordatorios' ? styles.vistaActive : ''}`}
                onClick={() => setVista('recordatorios')}
              >
                <Bell size={14} />
                Recordatorios ({recordatorios.length})
              </button>
            </div>
            <Button onClick={() => setIsMascotaModalOpen(true)}>
              <Plus size={18} />
              Nueva mascota
            </Button>
          </div>
        }
      />

      {vista === 'mascotas' && (
        <div>
          <div className={styles.filtroBar}>
            <select
              className={styles.select}
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
            >
              <option value="">Todos los clientes</option>
              {clientes.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            {clienteFiltro && (
              <button
                className={styles.limpiarFiltro}
                onClick={() => setClienteFiltro('')}
              >
                Limpiar filtro
              </button>
            )}
          </div>

          {isLoading ? (
            <LoadingSpinner />
          ) : mascotasFiltradas.length === 0 ? (
            <EmptyState message="No hay mascotas registradas" />
          ) : (
            <div className={styles.grid}>
              {mascotasFiltradas.map((mascota) => (
                <div key={mascota.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <div className={styles.avatar}>
                      {mascota.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className={styles.nombre}>{mascota.nombre}</h3>
                      <span className={styles.especie}>
                        {mascota.especie} {mascota.raza ? `— ${mascota.raza}` : ''}
                      </span>
                      <span className={styles.dueno}>
                        👤 {mascota.clienteNombre}
                      </span>
                    </div>
                  </div>
                  {mascota.fechaNacimiento && (
                    <p className={styles.fecha}>
                      Nacimiento: {mascota.fechaNacimiento}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRegistrarVacuna(mascota)}
                  >
                    + Registrar vacuna
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {vista === 'recordatorios' && (
        recordatorios.length === 0 ? (
          <EmptyState message="No hay vacunas próximas a vencer" />
        ) : (
          <div className={styles.tabla}>
            <div className={styles.header}>
              <span>Mascota</span>
              <span>Dueño</span>
              <span>Vacuna</span>
              <span>Próxima dosis</span>
              <span>Estado</span>
            </div>
            {recordatorios.map((r) => (
              <div key={r.id} className={`${styles.row} ${r.proximaAVencer ? styles.rowAlerta : ''}`}>
                <span className={styles.bold}>{r.mascotaNombre}</span>
                <span className={styles.muted}>{r.clienteNombre || '—'}</span>
                <span>{r.nombre}</span>
                <span className={styles.muted}>{r.fechaProximaDosis}</span>
                <span className={`${styles.badge} ${r.proximaAVencer ? styles.badgeAlerta : styles.badgeOk}`}>
                  {r.proximaAVencer ? '⚠️ Próxima' : '✓ Al día'}
                </span>
              </div>
            ))}
          </div>
        )
      )}

      <MascotaFormModal
        isOpen={isMascotaModalOpen}
        onClose={() => setIsMascotaModalOpen(false)}
        clientes={clientes}
      />

      <VacunaFormModal
        isOpen={isVacunaModalOpen}
        onClose={() => {
          setIsVacunaModalOpen(false);
          setMascotaSeleccionada(null);
        }}
        mascota={mascotaSeleccionada}
      />
    </div>
  );
};

export default MascotasPage;