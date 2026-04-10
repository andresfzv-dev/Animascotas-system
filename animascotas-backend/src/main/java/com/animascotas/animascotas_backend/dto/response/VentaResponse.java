package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@AllArgsConstructor
public class VentaResponse {

    private String id;
    private String cliente;
    private String usuario;
    private BigDecimal total;
    private String metodoPago;
    private BigDecimal montoRecibido;
    private BigDecimal cambio;
    private LocalDateTime fecha;
    private List<VentaItemResponse> items;
    private BigDecimal ganancia;
}