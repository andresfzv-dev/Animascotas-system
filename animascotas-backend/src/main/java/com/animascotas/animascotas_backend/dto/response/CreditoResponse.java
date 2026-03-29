package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CreditoResponse {

    private String id;
    private String clienteNombre;
    private BigDecimal deudaTotal;
    private BigDecimal saldoPendiente;
}