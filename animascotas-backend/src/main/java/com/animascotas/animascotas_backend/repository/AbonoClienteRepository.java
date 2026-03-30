package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.AbonoCliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

    @Repository
    public interface AbonoClienteRepository extends JpaRepository<AbonoCliente, String> {

    }
