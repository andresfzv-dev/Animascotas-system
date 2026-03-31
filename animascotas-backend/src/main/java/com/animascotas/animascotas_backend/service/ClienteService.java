package com.animascotas.animascotas_backend.service;

import com.animascotas.animascotas_backend.domain.entity.AbonoCliente;
import com.animascotas.animascotas_backend.domain.entity.Cliente;
import com.animascotas.animascotas_backend.domain.entity.CreditoCliente;
import com.animascotas.animascotas_backend.dto.request.AbonoRequest;
import com.animascotas.animascotas_backend.dto.request.ClienteRequest;
import com.animascotas.animascotas_backend.dto.response.AbonoClienteResponse;
import com.animascotas.animascotas_backend.dto.response.ClienteResponse;
import com.animascotas.animascotas_backend.dto.response.CreditoResponse;
import com.animascotas.animascotas_backend.exception.BusinessException;
import com.animascotas.animascotas_backend.exception.ResourceNotFoundException;
import com.animascotas.animascotas_backend.repository.AbonoClienteRepository;
import com.animascotas.animascotas_backend.repository.ClienteRepository;
import com.animascotas.animascotas_backend.repository.CreditoClienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final CreditoClienteRepository creditoRepository;
    private final AbonoClienteRepository abonoClienteRepository;

    public List<ClienteResponse> listarActivos() {
        return clienteRepository.findByActivoTrue()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ClienteResponse> buscarPorNombre(String nombre) {
        return clienteRepository.buscarPorNombre(nombre)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ClienteResponse buscarPorId(String id) {
        return toResponse(findClienteOrThrow(id));
    }

    @Transactional
    public ClienteResponse crear(ClienteRequest request) {
        if (request.getTelefono() != null
                && clienteRepository.existsByTelefono(request.getTelefono())) {
            throw new BusinessException(
                    "Ya existe un cliente con el teléfono: " + request.getTelefono());
        }

        Cliente cliente = new Cliente();
        cliente.setNombre(request.getNombre());
        cliente.setTelefono(request.getTelefono());
        cliente.setActivo(true);

        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public ClienteResponse actualizar(String id, ClienteRequest request) {
        Cliente cliente = findClienteOrThrow(id);

        if (request.getTelefono() != null
                && !request.getTelefono().equals(cliente.getTelefono())
                && clienteRepository.existsByTelefono(request.getTelefono())) {
            throw new BusinessException(
                    "Ya existe un cliente con el teléfono: " + request.getTelefono());
        }

        cliente.setNombre(request.getNombre());
        cliente.setTelefono(request.getTelefono());

        return toResponse(clienteRepository.save(cliente));
    }

    @Transactional
    public void desactivar(String id) {
        Cliente cliente = findClienteOrThrow(id);
        cliente.setActivo(false);
        clienteRepository.save(cliente);
    }

    public CreditoResponse consultarCredito(String clienteId) {
        Cliente cliente = findClienteOrThrow(clienteId);
        CreditoCliente credito = creditoRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new BusinessException(
                        "El cliente no tiene crédito registrado"));
        return toCreditoResponse(credito, cliente);
    }

    @Transactional
    public CreditoResponse registrarDeuda(String clienteId, BigDecimal monto) {
        Cliente cliente = findClienteOrThrow(clienteId);

        CreditoCliente credito = creditoRepository.findByClienteId(clienteId)
                .orElseGet(() -> {
                    CreditoCliente nuevo = new CreditoCliente();
                    nuevo.setCliente(cliente);
                    return nuevo;
                });

        credito.setDeudaTotal(credito.getDeudaTotal().add(monto));
        credito.setSaldoPendiente(credito.getSaldoPendiente().add(monto));

        return toCreditoResponse(creditoRepository.save(credito), cliente);
    }

    @Transactional
    public CreditoResponse registrarAbono(String clienteId, AbonoRequest request) {
        Cliente cliente = findClienteOrThrow(clienteId);
        CreditoCliente credito = creditoRepository.findByClienteId(clienteId)
                .orElseThrow(() -> new BusinessException(
                        "El cliente no tiene crédito registrado"));

        if (request.getMonto().compareTo(credito.getSaldoPendiente()) > 0) {
            throw new BusinessException(
                    "El abono supera el saldo pendiente: "
                            + credito.getSaldoPendiente());
        }

        credito.setSaldoPendiente(
                credito.getSaldoPendiente().subtract(request.getMonto()));

        AbonoCliente abono = new AbonoCliente();
        abono.setCredito(credito);
        abono.setMonto(request.getMonto());
        abonoClienteRepository.save(abono);

        return toCreditoResponse(creditoRepository.save(credito), cliente);
    }

    private Cliente findClienteOrThrow(String id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente", id));
    }

    private ClienteResponse toResponse(Cliente cliente) {
        return new ClienteResponse(
                cliente.getId(),
                cliente.getNombre(),
                cliente.getTelefono(),
                cliente.getActivo()
        );
    }

    private CreditoResponse toCreditoResponse(CreditoCliente credito, Cliente cliente) {
        return new CreditoResponse(
                credito.getId(),
                cliente.getNombre(),
                credito.getDeudaTotal(),
                credito.getSaldoPendiente()
        );
    }

    @Transactional
    public void eliminar(String id) {
        Cliente cliente = findClienteOrThrow(id);
        clienteRepository.delete(cliente);
    }

    public List<AbonoClienteResponse> listarAbonosPorCliente(String clienteId) {
        return abonoClienteRepository.findByClienteId(clienteId)
                .stream()
                .map(a -> new AbonoClienteResponse(
                        a.getId(),
                        a.getMonto(),
                        a.getFecha()
                ))
                .toList();
    }

    public BigDecimal totalCreditosPendientes() {
        return creditoRepository.findAll()
                .stream()
                .map(CreditoCliente::getSaldoPendiente)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}