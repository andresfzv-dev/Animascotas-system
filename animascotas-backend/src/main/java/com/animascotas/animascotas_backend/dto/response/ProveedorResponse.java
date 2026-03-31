package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ProveedorResponse {
    private String id;
    private String nombre;
    private String telefono;
    private String email;
    private Boolean activo;
}