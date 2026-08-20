package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.VentaRequest;
import com.animascotas.animascotas_backend.dto.response.VentaResponse;
import com.animascotas.animascotas_backend.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    public ResponseEntity<VentaResponse> registrar(
            @Valid @RequestBody VentaRequest request,
            @AuthenticationPrincipal String usuarioEmail) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ventaService.registrarVenta(request, usuarioEmail));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentaResponse> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(ventaService.buscarPorId(id));
    }

    @GetMapping
    public ResponseEntity<List<VentaResponse>> listarPorFecha(
            @RequestParam LocalDateTime inicio,
            @RequestParam LocalDateTime fin) {
        return ResponseEntity.ok(ventaService.listarPorFechaConAbonos(inicio, fin));
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<VentaResponse>> listarPorCliente(
            @PathVariable String clienteId) {
        return ResponseEntity.ok(ventaService.listarPorCliente(clienteId));
    }

    @GetMapping("/ganancia")
    public ResponseEntity<Map<String, BigDecimal>> obtenerGanancias(
            @RequestParam String inicio,
            @RequestParam String fin) {
        return ResponseEntity.ok(ventaService.calcularGanancias(inicio, fin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        ventaService.eliminarVenta(id);
        return ResponseEntity.noContent().build();
    }
}