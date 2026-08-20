package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.MascotaRequest;
import com.animascotas.animascotas_backend.dto.request.VacunaRequest;
import com.animascotas.animascotas_backend.dto.response.MascotaResponse;
import com.animascotas.animascotas_backend.dto.response.VacunaResponse;
import com.animascotas.animascotas_backend.service.MascotaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/mascotas")
@RequiredArgsConstructor
public class MascotaController {

    private final MascotaService mascotaService;

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<MascotaResponse>> listarPorCliente(
            @PathVariable String clienteId) {
        return ResponseEntity.ok(mascotaService.listarPorCliente(clienteId));
    }

    @GetMapping("/vacunas/recordatorios")
    public ResponseEntity<List<VacunaResponse>> listarRecordatorios() {
        return ResponseEntity.ok(mascotaService.listarRecordatorios());
    }

    @PostMapping
    public ResponseEntity<MascotaResponse> crear(
            @Valid @RequestBody MascotaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mascotaService.crear(request));
    }

    @PostMapping("/{mascotaId}/vacunas")
    public ResponseEntity<VacunaResponse> registrarVacuna(
            @PathVariable String mascotaId,
            @Valid @RequestBody VacunaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mascotaService.registrarVacuna(mascotaId, request));
    }

    @GetMapping("/{mascotaId}/vacunas")
    public ResponseEntity<List<VacunaResponse>> listarVacunasPorMascota(
            @PathVariable String mascotaId) {
        return ResponseEntity.ok(mascotaService.listarVacunasPorMascota(mascotaId));
    }
}