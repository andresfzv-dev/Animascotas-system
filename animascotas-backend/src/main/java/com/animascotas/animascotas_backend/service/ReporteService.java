package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.repository.PresentacionRepository;
import com.animascotas.animascotas_backend.repository.VentaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReporteService {

    private final VentaRepository ventaRepository;
    private final PresentacionRepository presentacionRepository;

    public Map<String, Object> reporteDiario(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        BigDecimal total = ventaRepository
                .sumTotalByFechaBetween(inicio, fin);

        List<Map<String, Object>> productosMasVendidos =
                ventaRepository.findProductosMasVendidos(inicio, fin)
                        .stream()
                        .limit(10)
                        .map(row -> {
                            Map<String, Object> item = new LinkedHashMap<>();
                            item.put("presentacionId", row[0]);
                            item.put("variante", row[1]);
                            item.put("totalVendido", row[2]);
                            return item;
                        })
                        .toList();

        Map<String, Object> reporte = new LinkedHashMap<>();
        reporte.put("fecha", fecha.toString());
        reporte.put("totalVentas", total != null ? total : BigDecimal.ZERO);
        reporte.put("productosMasVendidos", productosMasVendidos);
        reporte.put("alertasStockBajo", presentacionRepository.findStockBajo().size());

        return reporte;
    }

    public Map<String, Object> reporteMensual(int anio, int mes) {
        LocalDate primerDia = LocalDate.of(anio, mes, 1);
        LocalDate ultimoDia = primerDia.withDayOfMonth(primerDia.lengthOfMonth());

        LocalDateTime inicio = primerDia.atStartOfDay();
        LocalDateTime fin = ultimoDia.atTime(LocalTime.MAX);

        BigDecimal total = ventaRepository.sumTotalByFechaBetween(inicio, fin);

        List<Map<String, Object>> productosMasVendidos =
                ventaRepository.findProductosMasVendidos(inicio, fin)
                        .stream()
                        .limit(10)
                        .map(row -> {
                            Map<String, Object> item = new LinkedHashMap<>();
                            item.put("presentacionId", row[0]);
                            item.put("variante", row[1]);
                            item.put("totalVendido", row[2]);
                            return item;
                        })
                        .toList();

        Map<String, Object> reporte = new LinkedHashMap<>();
        reporte.put("anio", anio);
        reporte.put("mes", mes);
        reporte.put("totalVentas", total != null ? total : BigDecimal.ZERO);
        reporte.put("productosMasVendidos", productosMasVendidos);

        return reporte;
    }
}