package com.animascotas.animascotas_backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "presentaciones")
@Getter
@Setter
@NoArgsConstructor
public class Presentacion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(nullable = false, length = 100)
    private String variante;

    @Column(nullable = false, columnDefinition = "boolean default true")
    private Boolean activo = true;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioProveedor;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal porcentajeGanancia;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioVenta;

    @Column(unique = true, length = 50)
    private String codigoBarras;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer stockMinimo = 1;

    @ManyToMany
    @JoinTable(
            name = "medicamento_sintoma",
            joinColumns = @JoinColumn(name = "presentacion_id"),
            inverseJoinColumns = @JoinColumn(name = "sintoma_id")
    )
    private List<Sintoma> sintomas = new ArrayList<>();
}