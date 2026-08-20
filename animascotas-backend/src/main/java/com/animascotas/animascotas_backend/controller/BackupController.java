package com.animascotas.animascotas_backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;

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
            return "pg_dump"; // En Docker, pg_dump está en el PATH
        }
        return "C:\\Program Files\\PostgreSQL\\17\\bin\\pg_dump.exe";
    }

    private String getPsqlPath() {
        String host = getDbHost();
        if (host.equals("db")) {
            return "psql"; // En Docker, psql está en el PATH
        }
        return "C:\\Program Files\\PostgreSQL\\17\\bin\\psql.exe";
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
                    "--set", "ON_ERROR_STOP=off"
            );
            pb.environment().put("PGPASSWORD", getDbPassword());
            pb.redirectErrorStream(true);

            Process process = pb.start();
            try (OutputStream os = process.getOutputStream();
                 InputStream is = archivo.getInputStream()) {
                is.transferTo(os);
            }

            String output = new String(process.getInputStream().readAllBytes());
            int exitCode = process.waitFor();
            System.out.println("psql output: " + output);
            System.out.println("psql exit code: " + exitCode);

            return ResponseEntity.ok("Backup importado correctamente");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }
}