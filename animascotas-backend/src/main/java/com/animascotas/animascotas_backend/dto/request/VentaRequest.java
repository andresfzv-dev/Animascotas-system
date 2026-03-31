package com.animascotas.animascotas_backend.dto.request;

import com.animascotas.animascotas_backend.domain.enums.MetodoPago;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
public class VentaRequest {

    private String clienteId;

    @NotNull(message = "El método de pago es obligatorio")
    private MetodoPago metodoPago;

    @NotNull(message = "El monto recibido es obligatorio")
    private BigDecimal montoRecibido;

    @NotEmpty(message = "La venta debe tener al menos un producto")
    private List<VentaItemRequest> items;

    private Boolean esCredito = false;

    public boolean isEsCredito() {
        return Boolean.TRUE.equals(esCredito);
    }
}