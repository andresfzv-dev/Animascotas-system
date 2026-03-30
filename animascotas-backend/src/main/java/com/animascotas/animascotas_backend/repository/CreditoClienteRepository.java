package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.CreditoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CreditoClienteRepository extends JpaRepository<CreditoCliente, String> {
    Optional<CreditoCliente> findByClienteId(String clienteId);
}