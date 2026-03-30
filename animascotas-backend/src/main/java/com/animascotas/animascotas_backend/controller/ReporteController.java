package com.animascotas.animascotas_backend.controller;

import com.animascotas.animascotas_backend.service.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/diario")
    public ResponseEntity<Map<String, Object>> reporteDiario(
            @RequestParam(required = false) String fecha) {
        LocalDate dia = fecha != null
                ? LocalDate.parse(fecha)
                : LocalDate.now();
        return ResponseEntity.ok(reporteService.reporteDiario(dia));
    }

    @GetMapping("/mensual")
    public ResponseEntity<Map<String, Object>> reporteMensual(
            @RequestParam int anio,
            @RequestParam int mes) {
        return ResponseEntity.ok(reporteService.reporteMensual(anio, mes));
    }
}