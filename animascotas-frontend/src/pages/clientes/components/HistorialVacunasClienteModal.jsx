import { useQuery } from '@tanstack/react-query';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import { getMascotasPorCliente } from '../../../api/mascotas.api';
import { getVacunasPorMascota } from '../../../api/mascotas.api';
import styles from './HistorialVacunasClienteModal.module.css';

const HistorialVacunasClienteModal = ({ isOpen, onClose, cliente }) => {
  const { data: mascotas = [], isLoading: loadingMascotas } = useQuery({
    queryKey: ['mascotas-cliente-historial', cliente?.id],
    queryFn: () => getMascotasPorCliente(cliente.id),
    enabled: !!cliente?.id && isOpen,
    staleTime: 0,
  });

  const { data: vacunasPorMascota = [], isLoading: loadingVacunas } = useQuery({
    queryKey: ['vacunas-cliente', cliente?.id, mascotas.map((m) => m.id)],
    queryFn: async () => {
      const resultados = await Promise.all(
        mascotas.map((m) =>
          getVacunasPorMascota(m.id).then((vacunas) => ({
            mascota: m,
            vacunas,
          }))
        )
      );
      return resultados;
    },
    enabled: mascotas.length > 0 && isOpen,
    staleTime: 0,
  });

  const isLoading = loadingMascotas || loadingVacunas;
  const hayVacunas = vacunasPorMascota.some((g) => g.vacunas.length > 0);

  if (!cliente) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Vacunas — ${cliente.nombre}`}
      size="md"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : !hayVacunas ? (
        <EmptyState message="Este cliente no tiene vacunas registradas" />
      ) : (
        <div className={styles.grupos}>
          {vacunasPorMascota
            .filter((g) => g.vacunas.length > 0)
            .map((g) => (
              <div key={g.mascota.id} className={styles.grupo}>
                <h4 className={styles.mascotaNombre}>{g.mascota.nombre}</h4>
                <div className={styles.vacunasList}>
                  {g.vacunas.map((v) => (
                    <div
                      key={v.id}
                      className={`${styles.vacunaCard} ${v.proximaAVencer ? styles.vacunaCardAlerta : ''}`}
                    >
                      <div className={styles.vacunaHeader}>
                        <span className={styles.vacunaNombre}>{v.nombre}</span>
                        {v.precio && (
                          <span className={styles.vacunaPrecio}>
                            ${Number(v.precio).toLocaleString('es-CO')}
                          </span>
                        )}
                      </div>
                      <div className={styles.vacunaFechas}>
                        Aplicada: {v.fechaAplicacion} — Próxima dosis: {v.fechaProximaDosis}
                        {v.proximaAVencer && ' ⚠️'}
                      </div>
                      {v.informacion && (
                        <div className={styles.vacunaInfo}>{v.informacion}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </Modal>
  );
};

export default HistorialVacunasClienteModal;