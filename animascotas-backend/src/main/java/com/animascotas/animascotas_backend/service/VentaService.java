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

import java.util.*;
import java.util.stream.Stream;

import com.animascotas.animascotas_backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;

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
    private final CreditoClienteRepository creditoClienteRepository;

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

        if (request.getDescripcionServicio() != null && request.getTotalServicio() != null) {
            total = request.getTotalServicio();
            venta.setDescripcionServicio(request.getDescripcionServicio());
        } else {
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
                item.setCostoUnitario(presentacion.getPrecioProveedor());

                items.add(item);
                total = total.add(subtotal);

                presentacion.setStock(presentacion.getStock() - itemRequest.getCantidad());
                presentacionRepository.save(presentacion);

                registrarMovimientoVenta(presentacion, itemRequest.getCantidad(), usuario);
            }
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

        if (venta.getDescripcionServicio() != null && items.isEmpty()) {
            items = List.of(new VentaItemResponse(
                    null,
                    venta.getDescripcionServicio(),
                    "Servicio",
                    1,
                    venta.getTotal(),
                    venta.getTotal()
            ));
        }

        BigDecimal ganancia;
        if (venta.getDescripcionServicio() != null) {
            ganancia = venta.getTotal();
        } else {
            ganancia = venta.getItems().stream()
                    .map(item -> {
                        BigDecimal costo = item.getCostoUnitario() != null
                                ? item.getCostoUnitario().multiply(BigDecimal.valueOf(item.getCantidad()))
                                : BigDecimal.ZERO;
                        return item.getSubtotal().subtract(costo);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return new VentaResponse(
                venta.getId(),
                venta.getCliente() != null ? venta.getCliente().getNombre() : "Mostrador",
                venta.getUsuario().getNombre(),
                venta.getTotal(),
                venta.getMetodoPago().name(),
                venta.getMontoRecibido(),
                venta.getCambio(),
                venta.getFecha(),
                items,
                ganancia,
                venta.getMontoEfectivo(),
                venta.getMontoTransferencia()
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
                        List.of(),
                        BigDecimal.ZERO,
                        null,
                        null
                ))
                .toList();

        return Stream.concat(ventas.stream(), abonos.stream())
                .sorted(Comparator.comparing(VentaResponse::getFecha))
                .toList();
    }

    public Map<String, BigDecimal> calcularGanancias(String inicioStr, String finStr) {
        LocalDateTime inicio = LocalDateTime.parse(inicioStr);
        LocalDateTime fin = LocalDateTime.parse(finStr);

        List<Venta> ventas = ventaRepository.findByFechaBetween(inicio, fin)
                .stream()
                .filter(v -> v.getMetodoPago() != MetodoPago.CREDITO)
                .toList();

        BigDecimal ganancia = ventas.stream()
                .map(v -> {
                    if (v.getDescripcionServicio() != null) {
                        return v.getTotal();
                    }
                    return v.getItems().stream()
                            .map(item -> {
                                BigDecimal costo = item.getCostoUnitario() != null
                                        ? item.getCostoUnitario().multiply(BigDecimal.valueOf(item.getCantidad()))
                                        : BigDecimal.ZERO;
                                return item.getSubtotal().subtract(costo);
                            })
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, BigDecimal> resultado = new HashMap<>();
        resultado.put("ganancia", ganancia);
        return resultado;
    }

    @Transactional
    public void eliminarVenta(String ventaId) {
        Venta venta = ventaRepository.findById(ventaId)
                .orElseThrow(() -> new ResourceNotFoundException("Venta", ventaId));
        // Revertir stock si tiene items (no es servicio/vacuna)
        if (venta.getDescripcionServicio() == null) {
            for (VentaItem item : venta.getItems()) {
                Presentacion presentacion = item.getPresentacion();
                presentacion.setStock(presentacion.getStock() + item.getCantidad());
                presentacionRepository.save(presentacion);
            }
        }
        if (venta.getMetodoPago() == MetodoPago.CREDITO && venta.getCliente() != null) {
            CreditoCliente credito = venta.getCliente().getCredito();
            if (credito != null) {
                BigDecimal nuevaDeuda = credito.getDeudaTotal().subtract(venta.getTotal());
                credito.setDeudaTotal(nuevaDeuda.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : nuevaDeuda);
                BigDecimal nuevoSaldo = credito.getSaldoPendiente().subtract(venta.getTotal());
                credito.setSaldoPendiente(nuevoSaldo.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : nuevoSaldo);
                creditoClienteRepository.save(credito);
            }
        }

        ventaRepository.delete(venta);
    }
}