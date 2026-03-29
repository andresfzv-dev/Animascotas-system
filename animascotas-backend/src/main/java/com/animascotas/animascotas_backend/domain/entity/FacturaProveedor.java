package com.animascotas.animascotas_backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "facturas_proveedor")
@Getter
@Setter
@NoArgsConstructor
public class FacturaProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(updatable = false, nullable = false)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proveedor_id", nullable = false)
    private Proveedor proveedor;

    @Column(nullable = false, unique = true, length = 50)
    private String numeroFactura;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal saldoPendiente;

    @Column(nullable = false)
    private LocalDate fecha;

    @Column(nullable = false)
    private LocalDate fechaVencimiento;

    @Column(nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @OneToMany(mappedBy = "factura", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AbonoProveedor> abonos = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.creadoEn = LocalDateTime.now();
        this.saldoPendiente = this.total;
    }
}