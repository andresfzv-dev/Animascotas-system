package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.Usuario;
import com.animascotas.animascotas_backend.dto.request.UsuarioRequest;
import com.animascotas.animascotas_backend.dto.response.UsuarioResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UsuarioResponse buscarPorId(String id) {
        return toResponse(findByIdOrThrow(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest request) {
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(
                    "Ya existe un usuario con el email: " + request.getEmail());
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("La contraseña es obligatoria");
        }

        if (request.getPassword().length() < 8) {
            throw new BusinessException("La contraseña debe tener mínimo 8 caracteres");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        usuario.setRol(request.getRol());
        usuario.setActivo(true);

        if (request.getModulos() != null && !request.getModulos().isEmpty()) {
            usuario.getModulos().addAll(request.getModulos());
        }

        return toResponse(usuarioRepository.save(usuario));
    }
    @Transactional
    public UsuarioResponse actualizar(String id, UsuarioRequest request) {
        Usuario usuario = findByIdOrThrow(id);

        System.out.println("=== ACTUALIZANDO USUARIO ===");
        System.out.println("ID: " + id);
        System.out.println("Módulos recibidos: " + request.getModulos());

        usuario.setNombre(request.getNombre());
        usuario.setEmail(request.getEmail());
        usuario.setRol(request.getRol());

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getModulos() != null) {
            usuario.getModulos().clear();
            usuario.getModulos().addAll(request.getModulos());
            System.out.println("Módulos guardados: " + usuario.getModulos());
        } else {
            System.out.println("Módulos recibidos son NULL");
        }

        return toResponse(usuarioRepository.save(usuario));
    }

    private Usuario findByIdOrThrow(String id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", id));
    }

    private UsuarioResponse toResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().name(),
                usuario.getActivo(),
                usuario.getModulos()
        );
    }

    @Transactional
    public void eliminar(String id) {
        Usuario usuario = findByIdOrThrow(id);
        usuarioRepository.delete(usuario);
    }
}