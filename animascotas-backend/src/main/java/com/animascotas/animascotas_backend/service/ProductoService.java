package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.Categoria;
import com.animascotas.animascotas_backend.domain.entity.Presentacion;
import com.animascotas.animascotas_backend.domain.entity.Producto;
import com.animascotas.animascotas_backend.domain.entity.Sintoma;
import com.animascotas.animascotas_backend.dto.request.PresentacionRequest;
import com.animascotas.animascotas_backend.dto.request.ProductoRequest;
import com.animascotas.animascotas_backend.dto.response.PresentacionResponse;
import com.animascotas.animascotas_backend.dto.response.ProductoResponse;
import com.animascotas.animascotas_backend.dto.response.SintomaResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.CategoriaRepository;
import com.animascotas.animascotas_backend.repository.PresentacionRepository;
import com.animascotas.animascotas_backend.repository.ProductoRepository;
import com.animascotas.animascotas_backend.repository.SintomaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final PresentacionRepository presentacionRepository;
    private final CategoriaRepository categoriaRepository;
    private final SintomaRepository sintomaRepository;

    public List<ProductoResponse> listarActivos() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductoResponse> listarPorCategoria(String categoriaId) {
        return productoRepository.findByCategoriaIdAndActivoTrue(categoriaId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProductoResponse> buscarPorNombre(String nombre) {
        return productoRepository.buscarPorNombre(nombre)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProductoResponse buscarPorId(String id) {
        return toResponse(findProductoOrThrow(id));
    }

    public PresentacionResponse buscarPorCodigoBarras(String codigoBarras) {
        Presentacion presentacion = presentacionRepository
                .findByCodigoBarras(codigoBarras)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Presentación", codigoBarras));
        return toPresentacionResponse(presentacion);
    }

    public List<PresentacionResponse> listarStockBajo() {
        return presentacionRepository.findStockBajo()
                .stream()
                .map(this::toPresentacionResponse)
                .toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = findCategoriaOrThrow(request.getCategoriaId());

        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setCategoria(categoria);
        producto.setActivo(true);

        return toResponse(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(String id, ProductoRequest request) {
        Producto producto = findProductoOrThrow(id);
        Categoria categoria = findCategoriaOrThrow(request.getCategoriaId());

        producto.setNombre(request.getNombre());
        producto.setDescripcion(request.getDescripcion());
        producto.setCategoria(categoria);

        return toResponse(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(String id) {
        Producto producto = findProductoOrThrow(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }

    @Transactional
    public PresentacionResponse agregarPresentacion(String productoId,
                                                    PresentacionRequest request) {
        Producto producto = findProductoOrThrow(productoId);

        if (request.getCodigoBarras() != null
                && presentacionRepository.existsByCodigoBarras(request.getCodigoBarras())) {
            throw new BusinessException(
                    "Ya existe una presentación con el código de barras: "
                            + request.getCodigoBarras());
        }

        Presentacion presentacion = new Presentacion();
        presentacion.setProducto(producto);
        presentacion.setVariante(request.getVariante());
        presentacion.setPrecioProveedor(request.getPrecioProveedor());
        presentacion.setPorcentajeGanancia(request.getPorcentajeGanancia());
        presentacion.setPrecioVenta(calcularPrecioVenta(
                request.getPrecioProveedor(),
                request.getPorcentajeGanancia()
        ));
        presentacion.setCodigoBarras(request.getCodigoBarras());
        presentacion.setStockMinimo(request.getStockMinimo());

        return toPresentacionResponse(presentacionRepository.save(presentacion));
    }

    @Transactional
    public PresentacionResponse actualizarPresentacion(String presentacionId,
                                                       PresentacionRequest request) {
        Presentacion presentacion = findPresentacionOrThrow(presentacionId);

        if (request.getCodigoBarras() != null
                && !request.getCodigoBarras().equals(presentacion.getCodigoBarras())
                && presentacionRepository.existsByCodigoBarras(request.getCodigoBarras())) {
            throw new BusinessException(
                    "Ya existe una presentación con el código de barras: "
                            + request.getCodigoBarras());
        }

        presentacion.setVariante(request.getVariante());
        presentacion.setPrecioProveedor(request.getPrecioProveedor());
        presentacion.setPorcentajeGanancia(request.getPorcentajeGanancia());
        presentacion.setPrecioVenta(calcularPrecioVenta(
                request.getPrecioProveedor(),
                request.getPorcentajeGanancia()
        ));
        presentacion.setCodigoBarras(request.getCodigoBarras());
        presentacion.setStockMinimo(request.getStockMinimo());

        return toPresentacionResponse(presentacionRepository.save(presentacion));
    }

    @Transactional
    public void asignarSintomas(String presentacionId, List<String> sintomaIds) {
        Presentacion presentacion = findPresentacionOrThrow(presentacionId);

        List<Sintoma> sintomas = sintomaIds.stream()
                .map(sintomaId -> sintomaRepository.findById(sintomaId)
                        .orElseThrow(() -> new ResourceNotFoundException("Síntoma", sintomaId)))
                .toList();

        presentacion.getSintomas().clear();
        presentacion.getSintomas().addAll(sintomas);
        presentacionRepository.save(presentacion);
    }

    private BigDecimal calcularPrecioVenta(BigDecimal precioProveedor,
                                           BigDecimal porcentajeGanancia) {
        BigDecimal factor = porcentajeGanancia
                .divide(BigDecimal.valueOf(100))
                .add(BigDecimal.ONE);
        return precioProveedor
                .multiply(factor)
                .setScale(2, RoundingMode.HALF_UP);
    }

    private Producto findProductoOrThrow(String id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto", id));
    }

    private Presentacion findPresentacionOrThrow(String id) {
        return presentacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación", id));
    }

    private Categoria findCategoriaOrThrow(String id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", id));
    }

    private ProductoResponse toResponse(Producto producto) {
        List<PresentacionResponse> presentaciones = producto.getPresentaciones()
                .stream()
                .map(this::toPresentacionResponse)
                .toList();
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCategoria().getNombre(),
                producto.getActivo(),
                presentaciones
        );
    }

    public PresentacionResponse toPresentacionResponse(Presentacion presentacion) {
        List<SintomaResponse> sintomas = presentacion.getSintomas()
                .stream()
                .map(s -> new SintomaResponse(s.getId(), s.getNombre(), s.getDescripcion()))
                .toList();

        return new PresentacionResponse(
                presentacion.getId(),
                presentacion.getVariante(),
                presentacion.getPrecioProveedor(),
                presentacion.getPorcentajeGanancia(),
                presentacion.getPrecioVenta(),
                presentacion.getCodigoBarras(),
                presentacion.getStock(),
                presentacion.getStockMinimo(),
                presentacion.getStock() <= presentacion.getStockMinimo(),
                sintomas
        );
    }
}