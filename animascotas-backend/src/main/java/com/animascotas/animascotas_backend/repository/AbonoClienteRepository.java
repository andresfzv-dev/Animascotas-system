package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.AbonoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
    public interface AbonoClienteRepository extends JpaRepository<AbonoCliente, String> {

    @Query("SELECT a FROM AbonoCliente a WHERE a.credito.cliente.id = :clienteId")
    List<AbonoCliente> findByClienteId(@Param("clienteId") String clienteId);

    @Query("SELECT a FROM AbonoCliente a WHERE a.fecha BETWEEN :inicio AND :fin")
    List<AbonoCliente> findByFechaBetween(
            @Param("inicio") LocalDateTime inicio,
            @Param("fin") LocalDateTime fin
    );
    }
