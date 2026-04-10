package com.animascotas.animascotas_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class VacunaRequest {

    @NotBlank(message = "El nombre de la vacuna es obligatorio")
    private String nombre;

    private String informacion;

    @NotNull(message = "La fecha de aplicación es obligatoria")
    private LocalDate fechaAplicacion;

    @NotNull(message = "La fecha de próxima dosis es obligatoria")
    private LocalDate fechaProximaDosis;

    private BigDecimal precio;
}