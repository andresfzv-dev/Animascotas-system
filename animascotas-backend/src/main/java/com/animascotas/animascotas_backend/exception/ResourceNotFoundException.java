package com.animascotas.animascotas_backend.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String resource, String id) {
        super(String.format("%s con id '%s' no encontrado", resource, id), HttpStatus.NOT_FOUND);
    }
}
