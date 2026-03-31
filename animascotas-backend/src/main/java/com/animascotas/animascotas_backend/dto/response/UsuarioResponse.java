package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class UsuarioResponse {
    private String id;
    private String nombre;
    private String email;
    private String rol;
    private Boolean activo;
    private List<String> modulos;
}