package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, String> {

    List<Proveedor> findByActivoTrue();

    boolean existsByNombreIgnoreCase(String nombre);
}