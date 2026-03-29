package com.animascotas.animascotas_backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@AllArgsConstructor
public class PresentacionResponse {

    private String id;
    private String variante;
    private BigDecimal precioProveedor;
    private BigDecimal porcentajeGanancia;
    private BigDecimal precioVenta;
    private String codigoBarras;
    private Integer stock;
    private Integer stockMinimo;
    private Boolean stockBajo;
    private List<SintomaResponse> sintomas;
}