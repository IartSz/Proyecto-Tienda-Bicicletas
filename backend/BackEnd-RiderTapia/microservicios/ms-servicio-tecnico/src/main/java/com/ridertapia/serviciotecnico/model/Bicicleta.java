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
@Table(name = "bicicletas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Bicicleta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idBicicleta;

    @Column(nullable = false, length = 50)
    private String marca;

    @Column(nullable = false, length = 80)
    private String modelo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TipoBicicleta tipo;

    @Column(nullable = false, length = 10)
    private String aro;

    @Column(nullable = false, length = 30)
    private String color;

    @Column(nullable = true, unique = true, length = 40)
    private String numeroSerie;

    @Column(nullable = true, length = 12)
    private String rutCliente;
}
