package com.animascotas.animascotas_backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/backup")
public class BackupController {

    private String getDbHost() {
        String host = System.getenv("DB_HOST");
        return (host != null && !host.isEmpty()) ? host : "localhost";
    }

    private String getDbPort() {
        String port = System.getenv("DB_PORT");
        return (port != null && !port.isEmpty()) ? port : "5433";
    }

    private String getPgDumpPath() {
        String host = getDbHost();
        if (host.equals("db")) {
            return "pg_dump";
        }
        return "C:\\Program Files\\PostgreSQL\\16\\bin\\pg_dump.exe";
    }

    private String getPsqlPath() {
        String host = getDbHost();
        if (host.equals("db")) {
            return "psql";
        }
        return "C:\\Program Files\\PostgreSQL\\16\\bin\\psql.exe";
    }

    private String getDbPassword() {
        String pass = System.getenv("SPRING_DATASOURCE_PASSWORD");
        return (pass != null && !pass.isEmpty()) ? pass : "animascotas_pass";
    }

    @GetMapping("/exportar")
    public void exportarBackup(HttpServletResponse response) throws Exception {
        String fecha = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
        response.setContentType("application/octet-stream");
        response.setHeader("Content-Disposition",
                "attachment; filename=animascotas_backup_" + fecha + ".sql");

        ProcessBuilder pb = new ProcessBuilder(
                getPgDumpPath(),
                "-h", getDbHost(),
                "-p", getDbPort(),
                "-U", "animascotas_user",
                "-d", "animascotas",
                "--clean",
                "--if-exists"
        );
        pb.environment().put("PGPASSWORD", getDbPassword());

        Process process = pb.start();
        try (InputStream is = process.getInputStream();
             OutputStream os = response.getOutputStream()) {
            is.transferTo(os);
        }
        process.waitFor();
    }

    @PostMapping("/importar")
    public ResponseEntity<String> importarBackup(@RequestParam("archivo") MultipartFile archivo) throws Exception {
        try {
            ProcessBuilder pb = new ProcessBuilder(
                    getPsqlPath(),
                    "-h", getDbHost(),
                    "-p", getDbPort(),
                    "-U", "animascotas_user",
                    "-d", "animascotas",
                    "--set", "ON_ERROR_STOP=on"
            );
            pb.environment().put("PGPASSWORD", getDbPassword());
            pb.redirectErrorStream(true);

            Process process = pb.start();

            // Leemos la salida en un hilo aparte para no perder el mensaje real
            // de psql cuando el pipe se rompe (proceso muerto antes de tiempo).
            StringBuilder output = new StringBuilder();
            Thread readerThread = new Thread(() -> {
                try (InputStream is = process.getInputStream()) {
                    output.append(new String(is.readAllBytes()));
                } catch (IOException ignored) {
                }
            });
            readerThread.start();

            try (OutputStream os = process.getOutputStream();
                 InputStream is = archivo.getInputStream()) {
                is.transferTo(os);
            } catch (IOException e) {
                // Pipe roto porque psql ya terminó; el hilo de lectura
                // ya habrá capturado el motivo real en 'output'.
            }

            readerThread.join();
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                return ResponseEntity.status(500)
                        .body("Error al importar el backup: " + output.toString().trim());
            }

            return ResponseEntity.ok("Backup importado correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}