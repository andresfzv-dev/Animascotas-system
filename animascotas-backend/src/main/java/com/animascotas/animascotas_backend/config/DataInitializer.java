package com.animascotas.animascotas_backend.config;

import com.animascotas.animascotas_backend.domain.entity.Categoria;
import com.animascotas.animascotas_backend.domain.entity.Usuario;
import com.animascotas.animascotas_backend.domain.enums.Rol;
import com.animascotas.animascotas_backend.repository.CategoriaRepository;
import com.animascotas.animascotas_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements ApplicationRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;

    @Override
    public void run(ApplicationArguments args) {
        crearAdminSiNoExiste();
        crearCategoriasSiNoExisten();
    }

    private void crearAdminSiNoExiste() {
        if (!usuarioRepository.existsByEmail("admin@animascotas.com")) {
            Usuario admin = new Usuario();
            admin.setNombre("Administrador");
            admin.setEmail("admin@animascotas.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRol(Rol.ADMIN);
            admin.setActivo(true);
            usuarioRepository.save(admin);
            log.info("Usuario administrador creado exitosamente");
        }
    }

    private void crearCategoriasSiNoExisten() {
        List<String> categorias = List.of("Medicamentos", "Accesorios", "Alimento", "Otros");
        for (String nombre : categorias) {
            if (!categoriaRepository.existsByNombre(nombre)) {
                Categoria categoria = new Categoria();
                categoria.setNombre(nombre);
                categoriaRepository.save(categoria);
                log.info("Categoría creada: {}", nombre);
            }
        }
    }
}