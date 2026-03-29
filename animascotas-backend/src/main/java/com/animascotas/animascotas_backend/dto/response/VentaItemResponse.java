package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class VentaItemResponse {

    private String presentacionId;
    private String producto;
    private String variante;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}