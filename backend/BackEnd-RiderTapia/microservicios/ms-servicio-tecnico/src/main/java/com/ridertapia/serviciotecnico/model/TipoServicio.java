package com.ridertapia.serviciotecnico.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tipos_servicio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TipoServicio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idTipoServicio;

    @Column(nullable = false, unique = true, length = 60)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NivelServicio nivel;

    @Column(nullable = false, length = 255)
    private String descripcion;

    @Column(nullable = false, length = 500)
    private String incluye;

    @Column(nullable = false)
    private Integer precio;

    @Column(nullable = false)
    private Integer diasEstimados;

    @Column(nullable = false)
    private Boolean activo;
}
