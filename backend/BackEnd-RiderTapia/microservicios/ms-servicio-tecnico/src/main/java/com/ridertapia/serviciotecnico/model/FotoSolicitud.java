package com.ridertapia.serviciotecnico.model;

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
@Table(name = "fotos_solicitud")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FotoSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idFotoSolicitud;

    @Column(nullable = false, length = 255)
    private String url;

    @Column(nullable = false, length = 10)
    private String formato;

    @Column(nullable = false)
    private Integer tamanoKb;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_solicitud_servicio", nullable = false)
    private SolicitudServicio solicitudServicio;
}
