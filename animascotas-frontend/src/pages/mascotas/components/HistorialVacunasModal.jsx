import { useQuery } from '@tanstack/react-query';
import Modal from '../../../components/common/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState';
import { getVacunasPorMascota } from '../../../api/mascotas.api';
import styles from './MascotaModal.module.css';

const HistorialVacunasModal = ({ isOpen, onClose, mascota }) => {
  const { data: vacunas = [], isLoading } = useQuery({
    queryKey: ['vacunas-mascota', mascota?.id],
    queryFn: () => getVacunasPorMascota(mascota.id),
    enabled: !!mascota?.id && isOpen,
    staleTime: 0,
  });

  if (!mascota) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Historial de vacunas — ${mascota.nombre}`}
      size="md"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : vacunas.length === 0 ? (
        <EmptyState message="Esta mascota no tiene vacunas registradas" />
      ) : (
        <div className={styles.historialList}>
          {vacunas.map((v) => (
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
      )}
    </Modal>
  );
};

export default HistorialVacunasModal;