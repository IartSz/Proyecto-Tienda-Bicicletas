package com.ridertapia.serviciotecnico.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
@Table(name = "calificaciones_servicio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CalificacionServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCalificacionServicio;

    @Column(nullable = false)
    private Integer puntuacion;

    @Column(nullable = true, length = 500)
    private String comentario;

    @Column(nullable = false)
    private LocalDateTime fechaCalificacion;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_orden_trabajo", nullable = false, unique = true)
    private OrdenTrabajo ordenTrabajo;
}
