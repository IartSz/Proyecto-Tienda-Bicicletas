package com.ridertapia.serviciotecnico.model;

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
@Table(name = "historial_estados_orden")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistorialEstadoOrden {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idHistorialEstadoOrden;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 30)
    private EstadoOrden estadoAnterior;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoOrden estadoNuevo;

    @Column(nullable = false)
    private LocalDateTime fechaCambio;

    @Column(nullable = true)
    private Long idEmpleado;

    @Column(nullable = true, length = 255)
    private String comentario;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_orden_trabajo", nullable = false)
    private OrdenTrabajo ordenTrabajo;
}
