package com.ridertapia.carrito.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "carritos")
@Data
@NoArgsConstructor(onConstructor_ = @JsonCreator)
public class Carrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCarrito;

    @Column(nullable = true, length = 12)
    private String rutCliente;

    @Column(nullable = true, length = 100)
    private String tokenSesion;

    @Column(nullable = false)
    private LocalDateTime fechaCreacion;

    @Column(nullable = false)
    private LocalDateTime fechaActualizacion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoCarrito estado;

    @Column(nullable = false)
    private Integer subtotal;

    @Column(nullable = false)
    private Integer descuento;

    @Column(nullable = false)
    private Integer total;

    @Column(nullable = true)
    private Long idCupon;

    // Productos que lleva el carrito. Se muestran en la respuesta y se pueden enviar al crearlo
    @OneToMany(mappedBy = "carrito", fetch = FetchType.EAGER)
    @JsonIgnoreProperties("carrito")
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private List<ItemCarrito> items = new ArrayList<>();

    public Carrito(Long idCarrito, String rutCliente, String tokenSesion, LocalDateTime fechaCreacion,
            LocalDateTime fechaActualizacion, EstadoCarrito estado, Integer subtotal, Integer descuento,
            Integer total, Long idCupon) {
        this.idCarrito = idCarrito;
        this.rutCliente = rutCliente;
        this.tokenSesion = tokenSesion;
        this.fechaCreacion = fechaCreacion;
        this.fechaActualizacion = fechaActualizacion;
        this.estado = estado;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.total = total;
        this.idCupon = idCupon;
    }
}
