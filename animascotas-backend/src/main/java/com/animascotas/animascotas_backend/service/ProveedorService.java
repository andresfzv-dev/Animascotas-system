package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.AbonoProveedor;
import com.animascotas.animascotas_backend.domain.entity.FacturaProveedor;
import com.animascotas.animascotas_backend.domain.entity.Proveedor;
import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.ProveedorRequest;
import com.animascotas.animascotas_backend.dto.response.FacturaProveedorResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.AbonoProveedorRepository;
import com.animascotas.animascotas_backend.repository.FacturaProveedorRepository;
import com.animascotas.animascotas_backend.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final FacturaProveedorRepository facturaRepository;
    private final AbonoProveedorRepository abonoProveedorRepository;

    @Transactional
    public void crear(ProveedorRequest request) {
        if (proveedorRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new BusinessException(
                    "Ya existe un proveedor con el nombre: " + request.getNombre());
        }

        Proveedor proveedor = new Proveedor();
        proveedor.setNombre(request.getNombre());
        proveedor.setTelefono(request.getTelefono());
        proveedor.setEmail(request.getEmail());
        proveedor.setActivo(true);
        proveedorRepository.save(proveedor);
    }

    public List<FacturaProveedorResponse> listarFacturasPendientes() {
        return facturaRepository.findConSaldoPendiente()
                .stream()
                .map(this::toFacturaResponse)
                .toList();
    }

    public List<FacturaProveedorResponse> listarAlertasVencimiento() {
        LocalDate limite = LocalDate.now().plusDays(7);
        return facturaRepository.findVencidasOPorVencer(limite)
                .stream()
                .map(this::toFacturaResponse)
                .toList();
    }

    @Transactional
    public FacturaProveedorResponse registrarAbono(String facturaId,
                                                   AbonoRequest request) {
        FacturaProveedor factura = facturaRepository.findById(facturaId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura", facturaId));

        if (request.getMonto().compareTo(factura.getSaldoPendiente()) > 0) {
            throw new BusinessException(
                    "El abono supera el saldo pendiente: " + factura.getSaldoPendiente());
        }

        factura.setSaldoPendiente(
                factura.getSaldoPendiente().subtract(request.getMonto()));

        AbonoProveedor abono = new AbonoProveedor();
        abono.setFactura(factura);
        abono.setMonto(request.getMonto());
        abonoProveedorRepository.save(abono);

        return toFacturaResponse(facturaRepository.save(factura));
    }

    private FacturaProveedorResponse toFacturaResponse(FacturaProveedor factura) {
        return new FacturaProveedorResponse(
                factura.getId(),
                factura.getProveedor().getNombre(),
                factura.getNumeroFactura(),
                factura.getTotal(),
                factura.getSaldoPendiente(),
                factura.getFecha(),
                factura.getFechaVencimiento(),
                factura.getFechaVencimiento().isBefore(LocalDate.now())
        );
    }
}