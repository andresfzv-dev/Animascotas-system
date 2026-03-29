package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.util.List;

@Getter
@AllArgsConstructor
public class ProductoResponse {

    private String id;
    private String nombre;
    private String descripcion;
    private String categoria;
    private Boolean activo;
    private List<PresentacionResponse> presentaciones;
}