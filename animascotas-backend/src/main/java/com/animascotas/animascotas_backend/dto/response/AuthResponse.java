package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String tipo = "Bearer";
    private String nombre;
    private String rol;

    public AuthResponse(String token, String nombre, String rol) {
        this.token = token;
        this.nombre = nombre;
        this.rol = rol;
    }
}