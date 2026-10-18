package com.ridertapia.serviciotecnico.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ordenes_trabajo")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdenTrabajo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrdenTrabajo;

    @Column(nullable = true, unique = true, length = 20)
    private String codigo;

    @Column(nullable = false)
    private LocalDateTime fechaIngreso;

    @Column(nullable = false)
    private LocalDate fechaEstimadaEntrega;

    @Column(nullable = true)
    private LocalDateTime fechaEntrega;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoOrden estado;

    @Column(nullable = false, length = 100)
    private String nombreCliente;

    @Column(nullable = false, length = 15)
    private String telefonoCliente;

    @Column(nullable = true, length = 100)
    private String emailCliente;

    @Column(nullable = true, length = 12)
    private String rutCliente;

    @Column(nullable = true, length = 1000)
    private String diagnostico;

    @Column(nullable = false)
    private Integer costoManoObra;

    @Column(nullable = false)
    private Long idEmpleado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_bicicleta", nullable = false)
    private Bicicleta bicicleta;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo_servicio", nullable = false)
    private TipoServicio tipoServicio;

    @ManyToOne
    @JoinColumn(name = "id_solicitud_servicio")
    private SolicitudServicio solicitudServicio;
}
