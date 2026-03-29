package com.animascotas.animascotas_backend.repository;

import com.animascotas.animascotas_backend.domain.entity.Usuario;
import com.animascotas.animascotas_backend.domain.enums.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);

    List<Usuario> findByRolAndActivoTrue(Rol rol);
}