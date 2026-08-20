package com.animascotas.animascotas_backend.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.web.bind.annotation.*;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/qz")
public class SignatureController {

    @GetMapping("/cert")
    public String obtenerCertificado() throws Exception {
        try (InputStream is = new ClassPathResource("qz-certificate.pem").getInputStream()) {
            return new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    @PostMapping("/sign")
    public Map<String, String> firmar(@RequestBody Map<String, String> body) throws Exception {
        String toSign = body.get("request");
        if (toSign == null || toSign.isBlank()) {
            throw new IllegalArgumentException("El campo 'request' es obligatorio");
        }

        PrivateKey privateKey = cargarLlavePrivada();

        Signature signature = Signature.getInstance("SHA512withRSA");
        signature.initSign(privateKey);
        signature.update(toSign.getBytes(StandardCharsets.UTF_8));
        byte[] firmaBytes = signature.sign();

        return Map.of("signature", Base64.getEncoder().encodeToString(firmaBytes));
    }

    private PrivateKey cargarLlavePrivada() throws Exception {
        String llavePem;
        try (InputStream is = new ClassPathResource("qz-private-key.pem").getInputStream()) {
            llavePem = new String(is.readAllBytes(), StandardCharsets.UTF_8);
        }

        String llaveLimpia = llavePem
                .replace("-----BEGIN PRIVATE KEY-----", "")
                .replace("-----END PRIVATE KEY-----", "")
                .replaceAll("\\s", "");

        byte[] llaveBytes = Base64.getDecoder().decode(llaveLimpia);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(llaveBytes);
        return KeyFactory.getInstance("RSA").generatePrivate(keySpec);
    }
}