package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.AbonoProveedor;
import com.animascotas.animascotas_backend.domain.entity.FacturaProveedor;
import com.animascotas.animascotas_backend.domain.entity.Proveedor;
import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.FacturaProveedorRequest;
import com.animascotas.animascotas_backend.dto.request.ProveedorRequest;
import com.animascotas.animascotas_backend.dto.response.AbonoProveedorResponse;
import com.animascotas.animascotas_backend.dto.response.FacturaProveedorResponse;
import com.animascotas.animascotas_backend.dto.response.ProveedorResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.AbonoProveedorRepository;
import com.animascotas.animascotas_backend.repository.FacturaProveedorRepository;
import com.animascotas.animascotas_backend.repository.ProveedorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final FacturaProveedorRepository facturaRepository;
    private final AbonoProveedorRepository abonoProveedorRepository;
    @Value("${app.upload-dir}")
    private String uploadDirPath;

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
                factura.getFechaVencimiento().isBefore(LocalDate.now()),
                factura.getImagenUrl()
        );
    }

    public List<ProveedorResponse> listarActivos() {
        return proveedorRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public FacturaProveedorResponse registrarFactura(String proveedorId,
                                                     FacturaProveedorRequest request) {
        Proveedor proveedor = proveedorRepository.findById(proveedorId)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor", proveedorId));

        FacturaProveedor factura = new FacturaProveedor();
        factura.setProveedor(proveedor);
        factura.setNumeroFactura(request.getNumeroFactura());
        factura.setTotal(request.getTotal());
        factura.setFecha(request.getFecha());
        factura.setFechaVencimiento(request.getFechaVencimiento());

        return toFacturaResponse(facturaRepository.save(factura));
    }

    private ProveedorResponse toResponse(Proveedor proveedor) {
        return new ProveedorResponse(
                proveedor.getId(),
                proveedor.getNombre(),
                proveedor.getTelefono(),
                proveedor.getEmail(),
                proveedor.getActivo()
        );
    }

    public List<FacturaProveedorResponse> listarTodasFacturas() {
        return facturaRepository.findAll()
                .stream()
                .map(this::toFacturaResponse)
                .toList();
    }

    @Transactional
    public FacturaProveedorResponse actualizarFactura(String facturaId, FacturaProveedorRequest request) {
        FacturaProveedor factura = facturaRepository.findById(facturaId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura", facturaId));

        factura.setNumeroFactura(request.getNumeroFactura());
        factura.setTotal(request.getTotal());
        factura.setFecha(request.getFecha());
        factura.setFechaVencimiento(request.getFechaVencimiento());

        return toFacturaResponse(facturaRepository.save(factura));
    }

    public List<AbonoProveedorResponse> listarAbonosPorFactura(String facturaId) {
        return abonoProveedorRepository.findByFacturaId(facturaId)
                .stream()
                .map(a -> new AbonoProveedorResponse(a.getId(), a.getMonto(), a.getFecha()))
                .toList();
    }

    @Transactional
    public FacturaProveedorResponse subirImagenFactura(String facturaId, MultipartFile archivo) {
        FacturaProveedor factura = facturaRepository.findById(facturaId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura", facturaId));

        try {
            Path uploadDir = Paths.get(uploadDirPath);
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            String extension = archivo.getOriginalFilename()
                    .substring(archivo.getOriginalFilename().lastIndexOf('.'));
            String nombreArchivo = "factura-" + facturaId + extension;
            Path rutaArchivo = uploadDir.resolve(nombreArchivo);
            Files.copy(archivo.getInputStream(), rutaArchivo, StandardCopyOption.REPLACE_EXISTING);

            factura.setImagenUrl("/uploads/" + nombreArchivo);
            return toFacturaResponse(facturaRepository.save(factura));
        } catch (IOException e) {
            throw new BusinessException("Error al subir la imagen");
        }
    }

    public List<FacturaProveedorResponse> listarFacturasPorProveedor(String proveedorId) {
        return facturaRepository.findByProveedorId(proveedorId)
                .stream()
                .map(this::toFacturaResponse)
                .toList();
    }

    public Resource obtenerImagenFactura(String facturaId) {
        FacturaProveedor factura = facturaRepository.findById(facturaId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura", facturaId));

        if (factura.getImagenUrl() == null) {
            throw new ResourceNotFoundException("Imagen", facturaId);
        }

        try {
            Path rutaArchivo = Paths.get(uploadDirPath)
                    .resolve(factura.getImagenUrl().replace("/uploads/", ""));
            return new UrlResource(rutaArchivo.toUri());
        } catch (Exception e) {
            throw new BusinessException("Error al obtener la imagen");
        }
    }

}