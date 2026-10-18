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
@Table(name = "solicitudes_servicio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSolicitudServicio;

    @Column(nullable = false, length = 100)
    private String nombreContacto;

    @Column(nullable = false, length = 15)
    private String telefonoContacto;

    @Column(nullable = true, length = 100)
    private String emailContacto;

    @Column(nullable = true, length = 12)
    private String rutCliente;

    @Column(nullable = false, length = 1000)
    private String descripcionFalla;

    @Column(nullable = false)
    private LocalDateTime fechaSolicitud;

    @Column(nullable = true)
    private LocalDate fechaPreferida;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoSolicitud estado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_tipo_servicio", nullable = false)
    private TipoServicio tipoServicio;
}
