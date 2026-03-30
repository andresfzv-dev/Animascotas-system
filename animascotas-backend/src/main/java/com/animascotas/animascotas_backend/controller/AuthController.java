package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.LoginRequest;
import com.animascotas.animascotas_backend.dto.response.AuthResponse;
import com.animascotas.animascotas_backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}