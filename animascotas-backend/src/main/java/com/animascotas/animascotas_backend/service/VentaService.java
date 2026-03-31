package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.*;
import com.animascotas.animascotas_backend.domain.enums.MetodoPago;
import com.animascotas.animascotas_backend.domain.enums.TipoMovimiento;
import com.animascotas.animascotas_backend.dto.request.VentaRequest;
import com.animascotas.animascotas_backend.dto.response.VentaItemResponse;
import com.animascotas.animascotas_backend.dto.response.VentaResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.AbonoClienteRepository;
import java.util.stream.Stream;
import java.util.Comparator;
import com.animascotas.animascotas_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class VentaService {

    private final VentaRepository ventaRepository;
    private final PresentacionRepository presentacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final AbonoClienteRepository abonoClienteRepository;

    @Transactional
    public VentaResponse registrarVenta(VentaRequest request, String usuarioEmail) {
        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioEmail));

        Venta venta = new Venta();
        venta.setUsuario(usuario);
        venta.setMetodoPago(request.isEsCredito() ? MetodoPago.CREDITO : request.getMetodoPago());

        if (request.getClienteId() != null) {
            Cliente cliente = clienteRepository.findById(request.getClienteId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Cliente", request.getClienteId()));
            venta.setCliente(cliente);
        }

        List<VentaItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (var itemRequest : request.getItems()) {
            Presentacion presentacion = presentacionRepository
                    .findById(itemRequest.getPresentacionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Presentación", itemRequest.getPresentacionId()));

            if (presentacion.getStock() < itemRequest.getCantidad()) {
                throw new BusinessException(
                        "Stock insuficiente para: " + presentacion.getVariante()
                                + ". Stock actual: " + presentacion.getStock());
            }

            BigDecimal subtotal = presentacion.getPrecioVenta()
                    .multiply(BigDecimal.valueOf(itemRequest.getCantidad()));

            VentaItem item = new VentaItem();
            item.setVenta(venta);
            item.setPresentacion(presentacion);
            item.setCantidad(itemRequest.getCantidad());
            item.setPrecioUnitario(presentacion.getPrecioVenta());
            item.setSubtotal(subtotal);

            items.add(item);
            total = total.add(subtotal);

            presentacion.setStock(presentacion.getStock() - itemRequest.getCantidad());
            presentacionRepository.save(presentacion);

            registrarMovimientoVenta(presentacion, itemRequest.getCantidad(), usuario);
        }

        if (!request.isEsCredito() && request.getMontoRecibido().compareTo(total) < 0) {
            throw new BusinessException("El monto recibido es menor al total de la venta");
        }

        BigDecimal montoRecibido = request.isEsCredito()
                ? BigDecimal.ZERO
                : request.getMontoRecibido();
        BigDecimal cambio = request.isEsCredito()
                ? BigDecimal.ZERO
                : request.getMontoRecibido().subtract(total);

        venta.setItems(items);
        venta.setTotal(total);
        venta.setMontoRecibido(montoRecibido);
        venta.setCambio(cambio);

        return toResponse(ventaRepository.save(venta));
    }

    public List<VentaResponse> listarPorFecha(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findByFechaBetween(inicio, fin)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public VentaResponse buscarPorId(String id) {
        return toResponse(ventaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", id)));
    }

    private void registrarMovimientoVenta(Presentacion presentacion,
                                          Integer cantidad, Usuario usuario) {
        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setPresentacion(presentacion);
        movimiento.setUsuario(usuario);
        movimiento.setTipo(TipoMovimiento.SALIDA);
        movimiento.setCantidad(cantidad);
        movimiento.setMotivo("Venta registrada");
        movimientoRepository.save(movimiento);
    }

    private VentaResponse toResponse(Venta venta) {
        List<VentaItemResponse> items = venta.getItems()
                .stream()
                .map(item -> new VentaItemResponse(
                        item.getPresentacion().getId(),
                        item.getPresentacion().getProducto().getNombre(),
                        item.getPresentacion().getVariante(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getSubtotal()
                ))
                .toList();

        return new VentaResponse(
                venta.getId(),
                venta.getCliente() != null ? venta.getCliente().getNombre() : "Mostrador",
                venta.getUsuario().getNombre(),
                venta.getTotal(),
                venta.getMetodoPago().name(),
                venta.getMontoRecibido(),
                venta.getCambio(),
                venta.getFecha(),
                items
        );
    }

    public List<VentaResponse> listarPorCliente(String clienteId) {
        return ventaRepository.findByClienteId(clienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<VentaResponse> listarPorFechaConAbonos(LocalDateTime inicio, LocalDateTime fin) {
        List<VentaResponse> ventas = ventaRepository.findByFechaBetween(inicio, fin)
                .stream()
                .map(this::toResponse)
                .toList();

        List<VentaResponse> abonos = abonoClienteRepository
                .findByFechaBetween(inicio, fin)
                .stream()
                .map(a -> new VentaResponse(
                        a.getId(),
                        a.getCredito().getCliente().getNombre(),
                        "Sistema",
                        a.getMonto(),
                        "ABONO",
                        a.getMonto(),
                        BigDecimal.ZERO,
                        a.getFecha(),
                        List.of()
                ))
                .toList();

        return Stream.concat(ventas.stream(), abonos.stream())
                .sorted(Comparator.comparing(VentaResponse::getFecha))
                .toList();
    }
}