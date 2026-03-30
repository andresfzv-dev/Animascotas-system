package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.MovimientoInventario;
import com.animascotas.animascotas_backend.domain.entity.Presentacion;
import com.animascotas.animascotas_backend.domain.entity.Usuario;
import com.animascotas.animascotas_backend.domain.enums.TipoMovimiento;
import com.animascotas.animascotas_backend.dto.request.MovimientoRequest;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.MovimientoInventarioRepository;
import com.animascotas.animascotas_backend.repository.PresentacionRepository;
import com.animascotas.animascotas_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InventarioService {

    private final PresentacionRepository presentacionRepository;
    private final MovimientoInventarioRepository movimientoRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public void registrarMovimiento(String presentacionId,
                                    MovimientoRequest request, String usuarioEmail) {

        Presentacion presentacion = presentacionRepository.findById(presentacionId)
                .orElseThrow(() -> new ResourceNotFoundException("Presentación", presentacionId));

        Usuario usuario = usuarioRepository.findByEmail(usuarioEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", usuarioEmail));

        if (request.getTipo() == TipoMovimiento.SALIDA) {
            if (presentacion.getStock() < request.getCantidad()) {
                throw new BusinessException(
                        "Stock insuficiente. Stock actual: " + presentacion.getStock()
                                + ", cantidad solicitada: " + request.getCantidad());
            }
            presentacion.setStock(presentacion.getStock() - request.getCantidad());
        } else {
            presentacion.setStock(presentacion.getStock() + request.getCantidad());
        }

        presentacionRepository.save(presentacion);

        MovimientoInventario movimiento = new MovimientoInventario();
        movimiento.setPresentacion(presentacion);
        movimiento.setUsuario(usuario);
        movimiento.setTipo(request.getTipo());
        movimiento.setCantidad(request.getCantidad());
        movimiento.setMotivo(request.getMotivo());
        movimientoRepository.save(movimiento);
    }
}
