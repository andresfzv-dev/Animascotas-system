package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.Cliente;
import com.animascotas.animascotas_backend.domain.entity.Mascota;
import com.animascotas.animascotas_backend.domain.entity.Vacuna;
import com.animascotas.animascotas_backend.dto.request.MascotaRequest;
import com.animascotas.animascotas_backend.dto.request.VacunaRequest;
import com.animascotas.animascotas_backend.dto.response.MascotaResponse;
import com.animascotas.animascotas_backend.dto.response.VacunaResponse;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.ClienteRepository;
import com.animascotas.animascotas_backend.repository.MascotaRepository;
import com.animascotas.animascotas_backend.repository.VacunaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MascotaService {

    private final MascotaRepository mascotaRepository;
    private final VacunaRepository vacunaRepository;
    private final ClienteRepository clienteRepository;

    public List<MascotaResponse> listarPorCliente(String clienteId) {
        return mascotaRepository.findByClienteId(clienteId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<VacunaResponse> listarRecordatorios() {
        LocalDate hoy = LocalDate.now();
        LocalDate limite = hoy.plusDays(30);
        return vacunaRepository.findProximasAVencer(hoy, limite)
                .stream()
                .map(v -> toVacunaResponse(v, hoy))
                .toList();
    }

    @Transactional
    public MascotaResponse crear(MascotaRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente", request.getClienteId()));

        Mascota mascota = new Mascota();
        mascota.setCliente(cliente);
        mascota.setNombre(request.getNombre());
        mascota.setEspecie(request.getEspecie());
        mascota.setRaza(request.getRaza());
        mascota.setFechaNacimiento(request.getFechaNacimiento());

        return toResponse(mascotaRepository.save(mascota));
    }

    @Transactional
    public VacunaResponse registrarVacuna(String mascotaId, VacunaRequest request) {
        Mascota mascota = mascotaRepository.findById(mascotaId)
                .orElseThrow(() -> new ResourceNotFoundException("Mascota", mascotaId));

        Vacuna vacuna = new Vacuna();
        vacuna.setMascota(mascota);
        vacuna.setNombre(request.getNombre());
        vacuna.setInformacion(request.getInformacion());
        vacuna.setFechaAplicacion(request.getFechaAplicacion());
        vacuna.setFechaProximaDosis(request.getFechaProximaDosis());
        vacuna.setPrecio(request.getPrecio());

        return toVacunaResponse(vacunaRepository.save(vacuna), LocalDate.now());
    }

    private MascotaResponse toResponse(Mascota mascota) {
        return new MascotaResponse(
                mascota.getId(),
                mascota.getNombre(),
                mascota.getEspecie(),
                mascota.getRaza(),
                mascota.getFechaNacimiento(),
                mascota.getCliente().getNombre()
        );
    }

    private VacunaResponse toVacunaResponse(Vacuna vacuna, LocalDate hoy) {
        LocalDate limite = hoy.plusDays(30);
        boolean proximaAVencer = !vacuna.getFechaProximaDosis().isAfter(limite);

        return new VacunaResponse(
                vacuna.getId(),
                vacuna.getNombre(),
                vacuna.getInformacion(),
                vacuna.getFechaAplicacion(),
                vacuna.getFechaProximaDosis(),
                vacuna.getMascota().getNombre(),
                vacuna.getMascota().getCliente().getNombre(),
                proximaAVencer,
                vacuna.getPrecio()
        );
    }

    public List<VacunaResponse> listarVacunasPorMascota(String mascotaId) {
        LocalDate hoy = LocalDate.now();
        return vacunaRepository.findByMascotaId(mascotaId)
                .stream()
                .sorted((a, b) -> b.getFechaAplicacion().compareTo(a.getFechaAplicacion()))
                .map(v -> toVacunaResponse(v, hoy))
                .toList();
    }
}