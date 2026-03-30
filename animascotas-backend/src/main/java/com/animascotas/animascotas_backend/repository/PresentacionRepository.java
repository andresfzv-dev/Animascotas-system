package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Presentacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PresentacionRepository extends JpaRepository<Presentacion, String> {

    List<Presentacion> findByProductoId(String productoId);

    Optional<Presentacion> findByCodigoBarras(String codigoBarras);

    boolean existsByCodigoBarras(String codigoBarras);

    @Query("SELECT p FROM Presentacion p WHERE p.stock <= p.stockMinimo")
    List<Presentacion> findStockBajo();

    @Query("SELECT p FROM Presentacion p JOIN p.sintomas s WHERE s.id = :sintomaId")
    List<Presentacion> findBySintomaId(String sintomaId);
}