package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class AbonoClienteResponse {
    private String id;
    private BigDecimal monto;
    private LocalDateTime fecha;
}