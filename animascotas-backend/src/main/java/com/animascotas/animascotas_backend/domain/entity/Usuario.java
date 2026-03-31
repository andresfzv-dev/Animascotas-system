package com.animascotas.animascotas_backend.domain.entity;

import com.animascotas.animascotas_backend.domain.enums.Rol;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private String id;

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Rol rol;

    @Column(nullable = false)
    private Boolean activo;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "usuario_modulos", joinColumns = @JoinColumn(name = "usuario_id"))
    @Column(name = "modulo")
    @Builder.Default
    private List<String> modulos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.creadoEn = LocalDateTime.now();
    }

    public List<String> getModulos() {
        if (modulos == null) {
            modulos = new ArrayList<>();
        }
        return modulos;
    }
}