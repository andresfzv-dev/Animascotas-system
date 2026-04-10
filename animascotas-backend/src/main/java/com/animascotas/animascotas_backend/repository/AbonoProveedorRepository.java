package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.AbonoProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbonoProveedorRepository extends JpaRepository<AbonoProveedor, String> {
    List<AbonoProveedor> findByFacturaId(String facturaId);
}