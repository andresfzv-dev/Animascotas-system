package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.ClienteRequest;
import com.animascotas.animascotas_backend.dto.response.AbonoClienteResponse;
import com.animascotas.animascotas_backend.dto.response.ClienteResponse;
import com.animascotas.animascotas_backend.dto.response.CreditoResponse;
import com.animascotas.animascotas_backend.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    public ResponseEntity<List<ClienteResponse>> listarActivos() {
        return ResponseEntity.ok(clienteService.listarActivos());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ClienteResponse>> buscarPorNombre(
            @RequestParam String nombre) {
        return ResponseEntity.ok(clienteService.buscarPorNombre(nombre));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteResponse> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(clienteService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<ClienteResponse> crear(
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clienteService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteResponse> actualizar(
            @PathVariable String id,
            @Valid @RequestBody ClienteRequest request) {
        return ResponseEntity.ok(clienteService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        clienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/credito")
    public ResponseEntity<CreditoResponse> consultarCredito(@PathVariable String id) {
        return ResponseEntity.ok(clienteService.consultarCredito(id));
    }

    @PostMapping("/{id}/credito/deuda")
    public ResponseEntity<CreditoResponse> registrarDeuda(
            @PathVariable String id,
            @RequestParam BigDecimal monto) {
        return ResponseEntity.ok(clienteService.registrarDeuda(id, monto));
    }

    @PostMapping("/{id}/credito/abonos")
    public ResponseEntity<CreditoResponse> registrarAbono(
            @PathVariable String id,
            @Valid @RequestBody AbonoRequest request) {
        return ResponseEntity.ok(clienteService.registrarAbono(id, request));
    }

    @GetMapping("/{id}/abonos")
    public ResponseEntity<List<AbonoClienteResponse>> listarAbonos(@PathVariable String id) {
        return ResponseEntity.ok(clienteService.listarAbonosPorCliente(id));
    }

    @GetMapping("/creditos/total-pendiente")
    public ResponseEntity<BigDecimal> totalCreditosPendientes() {
        return ResponseEntity.ok(clienteService.totalCreditosPendientes());
    }
}