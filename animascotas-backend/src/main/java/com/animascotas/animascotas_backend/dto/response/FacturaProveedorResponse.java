package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class FacturaProveedorResponse {

    private String id;
    private String proveedorNombre;
    private String numeroFactura;
    private BigDecimal total;
    private BigDecimal saldoPendiente;
    private LocalDate fecha;
    private LocalDate fechaVencimiento;
    private Boolean vencida;
    private String imagenUrl;
}