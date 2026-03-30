package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.Sintoma;
import com.animascotas.animascotas_backend.dto.request.SintomaRequest;
import com.animascotas.animascotas_backend.dto.response.PresentacionResponse;
import com.animascotas.animascotas_backend.dto.response.SintomaResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.PresentacionRepository;
import com.animascotas.animascotas_backend.repository.SintomaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SintomaService {

    private final SintomaRepository sintomaRepository;
    private final PresentacionRepository presentacionRepository;
    private final ProductoService productoService;

    public List<SintomaResponse> listarTodos() {
        return sintomaRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public SintomaResponse crear(SintomaRequest request) {
        if (sintomaRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new BusinessException(
                    "Ya existe un síntoma con el nombre: " + request.getNombre());
        }

        Sintoma sintoma = new Sintoma();
        sintoma.setNombre(request.getNombre());
        sintoma.setDescripcion(request.getDescripcion());

        return toResponse(sintomaRepository.save(sintoma));
    }

    @Transactional
    public SintomaResponse actualizar(String id, SintomaRequest request) {
        Sintoma sintoma = sintomaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Síntoma", id));

        if (!sintoma.getNombre().equalsIgnoreCase(request.getNombre())
                && sintomaRepository.existsByNombreIgnoreCase(request.getNombre())) {
            throw new BusinessException(
                    "Ya existe un síntoma con el nombre: " + request.getNombre());
        }

        sintoma.setNombre(request.getNombre());
        sintoma.setDescripcion(request.getDescripcion());

        return toResponse(sintomaRepository.save(sintoma));
    }

    public List<PresentacionResponse> buscarMedicamentosPorSintoma(String sintomaId) {
        sintomaRepository.findById(sintomaId)
                .orElseThrow(() -> new ResourceNotFoundException("Síntoma", sintomaId));

        return presentacionRepository.findBySintomaId(sintomaId)
                .stream()
                .map(productoService::toPresentacionResponse)
                .toList();
    }

    private SintomaResponse toResponse(Sintoma sintoma) {
        return new SintomaResponse(
                sintoma.getId(),
                sintoma.getNombre(),
                sintoma.getDescripcion()
        );
    }
}