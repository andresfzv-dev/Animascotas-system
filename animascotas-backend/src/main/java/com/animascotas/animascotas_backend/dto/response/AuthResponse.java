package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String nombre;
    private String rol;
    private List<String> modulos;
}