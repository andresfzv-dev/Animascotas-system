package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, String> {

    List<Venta> findByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT SUM(v.total) FROM Venta v WHERE v.fecha BETWEEN :inicio AND :fin")
    java.math.BigDecimal sumTotalByFechaBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("""
            SELECT vi.presentacion.id, vi.presentacion.variante,
                   SUM(vi.cantidad) as totalVendido
            FROM VentaItem vi
            WHERE vi.venta.fecha BETWEEN :inicio AND :fin
            GROUP BY vi.presentacion.id, vi.presentacion.variante
            ORDER BY totalVendido DESC
            """)
    List<Object[]> findProductosMasVendidos(LocalDateTime inicio, LocalDateTime fin);
}