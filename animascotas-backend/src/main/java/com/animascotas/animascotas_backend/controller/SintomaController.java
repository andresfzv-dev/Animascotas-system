package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.dto.request.SintomaRequest;
import com.animascotas.animascotas_backend.dto.response.PresentacionResponse;
import com.animascotas.animascotas_backend.dto.response.SintomaResponse;
import com.animascotas.animascotas_backend.service.SintomaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/sintomas")
@RequiredArgsConstructor
public class SintomaController {

    private final SintomaService sintomaService;

    @GetMapping
    public ResponseEntity<List<SintomaResponse>> listarTodos() {
        return ResponseEntity.ok(sintomaService.listarTodos());
    }

    @PostMapping
    public ResponseEntity<SintomaResponse> crear(
            @Valid @RequestBody SintomaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(sintomaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SintomaResponse> actualizar(
            @PathVariable String id,
            @Valid @RequestBody SintomaRequest request) {
        return ResponseEntity.ok(sintomaService.actualizar(id, request));
    }

    @GetMapping("/{id}/medicamentos")
    public ResponseEntity<List<PresentacionResponse>> buscarMedicamentos(
            @PathVariable String id) {
        return ResponseEntity.ok(sintomaService.buscarMedicamentosPorSintoma(id));
    }
}