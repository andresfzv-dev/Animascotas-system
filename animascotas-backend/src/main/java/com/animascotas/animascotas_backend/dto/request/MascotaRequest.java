package com.animascotas.animascotas_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class MascotaRequest {

    @NotNull(message = "El cliente es obligatorio")
    private String clienteId;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    private String especie;
    private String raza;
    private LocalDate fechaNacimiento;
}