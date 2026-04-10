package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.domain.entity.FacturaProveedor;
import com.animascotas.animascotas_backend.domain.entity.Proveedor;
import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.FacturaProveedorRequest;
import com.animascotas.animascotas_backend.dto.request.ProveedorRequest;
import com.animascotas.animascotas_backend.dto.response.AbonoProveedorResponse;
import com.animascotas.animascotas_backend.dto.response.FacturaProveedorResponse;
import com.animascotas.animascotas_backend.dto.response.ProveedorResponse;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @GetMapping
    public ResponseEntity<List<ProveedorResponse>> listarActivos() {
        return ResponseEntity.ok(proveedorService.listarActivos());
    }

    @PostMapping("/{proveedorId}/facturas")
    public ResponseEntity<FacturaProveedorResponse> registrarFactura(
            @PathVariable String proveedorId,
            @Valid @RequestBody FacturaProveedorRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(proveedorService.registrarFactura(proveedorId, request));
    }

    @GetMapping("/facturas/todas")
    public ResponseEntity<List<FacturaProveedorResponse>> listarTodasFacturas() {
        return ResponseEntity.ok(proveedorService.listarTodasFacturas());
    }

    @PutMapping("/facturas/{facturaId}")
    public ResponseEntity<FacturaProveedorResponse> actualizarFactura(
            @PathVariable String facturaId,
            @Valid @RequestBody FacturaProveedorRequest request) {
        return ResponseEntity.ok(proveedorService.actualizarFactura(facturaId, request));
    }

    @GetMapping("/facturas/{facturaId}/abonos")
    public ResponseEntity<List<AbonoProveedorResponse>> listarAbonosPorFactura(
            @PathVariable String facturaId) {
        return ResponseEntity.ok(proveedorService.listarAbonosPorFactura(facturaId));
    }

    @PostMapping("/facturas/{facturaId}/imagen")
    public ResponseEntity<FacturaProveedorResponse> subirImagen(
            @PathVariable String facturaId,
            @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(proveedorService.subirImagenFactura(facturaId, archivo));
    }

    @GetMapping("/facturas/{facturaId}/imagen")
    public ResponseEntity<Resource> descargarImagen(@PathVariable String facturaId) throws IOException {
        Resource resource = proveedorService.obtenerImagenFactura(facturaId);
        String contentType = determinarContentType(resource.getFilename());

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, contentType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    private String determinarContentType(String filename) {
        if (filename == null) return "application/octet-stream";
        if (filename.endsWith(".pdf")) return "application/pdf";
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
        if (filename.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }

    @GetMapping("/{proveedorId}/facturas")
    public ResponseEntity<List<FacturaProveedorResponse>> listarFacturasPorProveedor(
            @PathVariable String proveedorId) {
        return ResponseEntity.ok(proveedorService.listarFacturasPorProveedor(proveedorId));
    }
}