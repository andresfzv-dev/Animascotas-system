package com.animascotas.animascotas_backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class PresentacionRequest {

    @NotBlank(message = "La variante es obligatoria")
    private String variante;

    @NotNull(message = "El precio del proveedor es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    private BigDecimal precioProveedor;

    @NotNull(message = "El porcentaje de ganancia es obligatorio")
    @DecimalMin(value = "0.0", message = "El porcentaje no puede ser negativo")
    @DecimalMax(value = "999.99", message = "El porcentaje no puede superar 999.99")
    private BigDecimal porcentajeGanancia;

    private String codigoBarras;

    @NotNull(message = "El stock mínimo es obligatorio")
    @Min(value = 0, message = "El stock mínimo no puede ser negativo")
    private Integer stockMinimo;

    @Min(value = 0, message = "El stock inicial no puede ser negativo")
    private Integer stockInicial = 0;

    @DecimalMin(value = "0.0", inclusive = false, message = "El precio de venta debe ser mayor a 0")
    private BigDecimal precioVenta;
}