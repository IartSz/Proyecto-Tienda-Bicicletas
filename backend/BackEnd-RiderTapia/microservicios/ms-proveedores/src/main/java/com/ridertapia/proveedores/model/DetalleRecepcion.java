package com.ridertapia.proveedores.model;

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
@Table(name = "detalles_recepcion")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetalleRecepcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalleRecepcion;

    @Column(nullable = false)
    private Integer cantidadRecibida;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_recepcion_compra", nullable = false)
    private RecepcionCompra recepcionCompra;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_detalle_orden_compra", nullable = false)
    private DetalleOrdenCompra detalleOrdenCompra;
}
