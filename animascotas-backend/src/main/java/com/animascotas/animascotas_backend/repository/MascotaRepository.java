package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Mascota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MascotaRepository extends JpaRepository<Mascota, String> {

    List<Mascota> findByClienteId(String clienteId);
}