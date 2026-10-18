package com.ridertapia.proveedores.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "productos_proveedor", uniqueConstraints = @UniqueConstraint(columnNames = {"id_proveedor", "id_variante"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoProveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProductoProveedor;

    @Column(nullable = false)
    private Long idVariante;

    @Column(nullable = true, length = 40)
    private String codigoProveedor;

    @Column(nullable = false)
    private Integer costoUnitario;

    @Column(nullable = false)
    private Integer plazoEntregaDias;

    @Column(nullable = false)
    private Boolean preferido;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;
}
