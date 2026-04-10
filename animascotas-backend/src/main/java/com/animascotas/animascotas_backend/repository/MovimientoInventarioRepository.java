package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.MovimientoInventario;
import com.animascotas.animascotas_backend.domain.enums.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, String> {

    List<MovimientoInventario> findByPresentacionId(String presentacionId);

    List<MovimientoInventario> findByTipoAndFechaBetween(
            TipoMovimiento tipo,
            LocalDateTime inicio,
            LocalDateTime fin
    );

    void deleteByPresentacionId(String presentacionId);
}