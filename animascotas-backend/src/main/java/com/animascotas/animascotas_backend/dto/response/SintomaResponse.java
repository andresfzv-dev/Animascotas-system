package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SintomaResponse {

    private String id;
    private String nombre;
    private String descripcion;
}