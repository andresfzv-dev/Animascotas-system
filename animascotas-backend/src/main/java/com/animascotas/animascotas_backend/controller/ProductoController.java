package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.PresentacionRequest;
import com.animascotas.animascotas_backend.dto.request.ProductoRequest;
import com.animascotas.animascotas_backend.dto.response.PresentacionResponse;
import com.animascotas.animascotas_backend.dto.response.ProductoResponse;
import com.animascotas.animascotas_backend.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarActivos() {
        return ResponseEntity.ok(productoService.listarActivos());
    }

    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResponse>> listarPorCategoria(
            @PathVariable String categoriaId) {
        return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponse>> buscarPorNombre(
            @RequestParam String nombre) {
        return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> buscarPorId(@PathVariable String id) {
        return ResponseEntity.ok(productoService.buscarPorId(id));
    }

    @GetMapping("/codigo-barras/{codigo}")
    public ResponseEntity<PresentacionResponse> buscarPorCodigoBarras(
            @PathVariable String codigo) {
        return ResponseEntity.ok(productoService.buscarPorCodigoBarras(codigo));
    }

    @GetMapping("/stock-bajo")
    public ResponseEntity<List<PresentacionResponse>> listarStockBajo() {
        return ResponseEntity.ok(productoService.listarStockBajo());
    }

    @PostMapping
    public ResponseEntity<ProductoResponse> crear(
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(productoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoResponse> actualizar(
            @PathVariable String id,
            @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable String id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/presentaciones")
    public ResponseEntity<PresentacionResponse> agregarPresentacion(
            @PathVariable String id,
            @Valid @RequestBody PresentacionRequest request,
            @AuthenticationPrincipal String usuarioEmail) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.agregarPresentacion(id, request, usuarioEmail));
    }

    @PutMapping("/presentaciones/{presentacionId}")
    public ResponseEntity<PresentacionResponse> actualizarPresentacion(
            @PathVariable String presentacionId,
            @Valid @RequestBody PresentacionRequest request) {
        return ResponseEntity.ok(
            productoService.actualizarPresentacion(presentacionId, request));
    }

    @PutMapping("/presentaciones/{presentacionId}/sintomas")
    public ResponseEntity<Void> asignarSintomas(
            @PathVariable String presentacionId,
            @RequestBody List<String> sintomaIds) {
        productoService.asignarSintomas(presentacionId, sintomaIds);
        return ResponseEntity.noContent().build();
    }
}