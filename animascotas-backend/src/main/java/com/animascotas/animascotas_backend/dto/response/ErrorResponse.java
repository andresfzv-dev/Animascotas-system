package com.animascotas.animascotas_backend.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class ErrorResponse {

    private final int status;
    private final String message;
    private final List<String> errors;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private final LocalDateTime timestamp;

    public ErrorResponse(int status, String message, List<String> errors) {
        this.status = status;
        this.message = message;
        this.errors = errors;
        this.timestamp = LocalDateTime.now();
    }

    public ErrorResponse(int status, String message) {
        this(status, message, null);
    }
}