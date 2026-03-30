package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.ProveedorRequest;
import com.animascotas.animascotas_backend.dto.response.FacturaProveedorResponse;
import com.animascotas.animascotas_backend.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @PostMapping
    public ResponseEntity<Void> crear(@Valid @RequestBody ProveedorRequest request) {
        proveedorService.crear(request);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/facturas/pendientes")
    public ResponseEntity<List<FacturaProveedorResponse>> listarFacturasPendientes() {
        return ResponseEntity.ok(proveedorService.listarFacturasPendientes());
    }

    @GetMapping("/facturas/alertas")
    public ResponseEntity<List<FacturaProveedorResponse>> listarAlertas() {
        return ResponseEntity.ok(proveedorService.listarAlertasVencimiento());
    }

    @PostMapping("/facturas/{facturaId}/abonos")
    public ResponseEntity<FacturaProveedorResponse> registrarAbono(
            @PathVariable String facturaId,
            @Valid @RequestBody AbonoRequest request) {
        return ResponseEntity.ok(proveedorService.registrarAbono(facturaId, request));
    }
}