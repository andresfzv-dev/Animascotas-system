package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.config.JwtService;
import com.animascotas.animascotas_backend.domain.entity.Usuario;
import com.animascotas.animascotas_backend.dto.request.LoginRequest;
import com.animascotas.animascotas_backend.dto.response.AuthResponse;
import com.animascotas.animascotas_backend.exception.ApiException;
import com.animascotas.animascotas_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .filter(u -> u.getActivo())
                .orElseThrow(() -> new ApiException(
                        "Credenciales inválidas", HttpStatus.UNAUTHORIZED));

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPasswordHash())) {
            throw new ApiException("Credenciales inválidas", HttpStatus.UNAUTHORIZED);
        }

        String token = jwtService.generateToken(
                usuario.getEmail(),
                usuario.getRol().name()
        );

        return new AuthResponse(
                token,
                usuario.getNombre(),
                usuario.getRol().name(),
                usuario.getModulos()
        );
    }
}
