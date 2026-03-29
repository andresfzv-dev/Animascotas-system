package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Sintoma;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SintomaRepository extends JpaRepository<Sintoma, String> {

    Optional<Sintoma> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);
}