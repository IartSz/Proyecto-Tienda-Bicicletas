package com.ridertapia.carrito.model;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "items_carrito")
@Data
@NoArgsConstructor(onConstructor_ = @JsonCreator)
public class ItemCarrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemCarrito;

    @Column(nullable = false)
    private Long idVariante;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false)
    private Integer precioUnitario;

    @Column(nullable = false)
    private LocalDateTime fechaAgregado;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_carrito", nullable = false)
    @JsonIgnoreProperties("items")
    private Carrito carrito;

    // Producto al que pertenece la variante en ms-productos, solo para mostrar (no se guarda)
    @Transient
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long idProducto;

    public ItemCarrito(Long idItemCarrito, Long idVariante, Integer cantidad, Integer precioUnitario,
            LocalDateTime fechaAgregado, Carrito carrito) {
        this.idItemCarrito = idItemCarrito;
        this.idVariante = idVariante;
        this.cantidad = cantidad;
        this.precioUnitario = precioUnitario;
        this.fechaAgregado = fechaAgregado;
        this.carrito = carrito;
    }
}
