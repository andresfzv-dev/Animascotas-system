package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UsuarioResponse {

    private String id;
    private String nombre;
    private String email;
    private String rol;
    private Boolean activo;
}