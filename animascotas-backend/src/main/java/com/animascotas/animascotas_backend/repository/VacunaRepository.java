package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Vacuna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface VacunaRepository extends JpaRepository<Vacuna, String> {

    List<Vacuna> findByMascotaId(String mascotaId);

    @Query("SELECT v FROM Vacuna v WHERE v.fechaProximaDosis BETWEEN :hoy AND :limite")
    List<Vacuna> findProximasAVencer(LocalDate hoy, LocalDate limite);
}