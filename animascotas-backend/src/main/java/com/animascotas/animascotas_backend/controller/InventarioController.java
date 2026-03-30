package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.domain.entity.MovimientoInventario;
import com.animascotas.animascotas_backend.dto.request.MovimientoRequest;
import com.animascotas.animascotas_backend.repository.MovimientoInventarioRepository;
import com.animascotas.animascotas_backend.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;
    private final MovimientoInventarioRepository movimientoRepository;  

    @PostMapping("/presentaciones/{presentacionId}/movimientos")
    public ResponseEntity<Void> registrarMovimiento(
            @PathVariable String presentacionId,
            @Valid @RequestBody MovimientoRequest request,
            @AuthenticationPrincipal String usuarioEmail) {
        inventarioService.registrarMovimiento(presentacionId, request, usuarioEmail);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/presentaciones/{presentacionId}/movimientos")
    public ResponseEntity<List<MovimientoInventario>> getMovimientos(
            @PathVariable String presentacionId) {
        return ResponseEntity.ok(
                movimientoRepository.findByPresentacionId(presentacionId));
    }
}