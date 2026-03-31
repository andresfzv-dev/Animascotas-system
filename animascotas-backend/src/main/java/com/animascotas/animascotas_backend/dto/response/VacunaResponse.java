package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class VacunaResponse {
    private String id;
    private String nombre;
    private String informacion;
    private LocalDate fechaAplicacion;
    private LocalDate fechaProximaDosis;
    private String mascotaNombre;
    private String clienteNombre;
    private Boolean proximaAVencer;
}