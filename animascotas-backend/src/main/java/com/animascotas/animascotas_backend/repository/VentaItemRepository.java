package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.VentaItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VentaItemRepository extends JpaRepository<VentaItem, String> {
    void deleteByPresentacionId(String presentacionId);
}