package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.FacturaProveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface FacturaProveedorRepository extends JpaRepository<FacturaProveedor, String> {

    List<FacturaProveedor> findByProveedorId(String proveedorId);

    @Query("SELECT f FROM FacturaProveedor f WHERE f.saldoPendiente > 0")
    List<FacturaProveedor> findConSaldoPendiente();

    @Query("SELECT f FROM FacturaProveedor f WHERE f.fechaVencimiento <= :fecha AND f.saldoPendiente > 0")
    List<FacturaProveedor> findVencidasOPorVencer(LocalDate fecha);

    List<FacturaProveedor> findByProveedorIdIsNotNull();

}