package com.ridertapia.proveedores.model;

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
@Table(name = "recepciones_compra")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecepcionCompra {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idRecepcionCompra;

    @Column(nullable = false)
    private LocalDateTime fechaRecepcion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoDocumentoRecepcion tipoDocumento;

    @Column(nullable = false, length = 30)
    private String numeroDocumento;

    @Column(nullable = true, length = 255)
    private String observacion;

    @Column(nullable = false)
    private Long idEmpleado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_orden_compra", nullable = false)
    private OrdenCompra ordenCompra;
}
