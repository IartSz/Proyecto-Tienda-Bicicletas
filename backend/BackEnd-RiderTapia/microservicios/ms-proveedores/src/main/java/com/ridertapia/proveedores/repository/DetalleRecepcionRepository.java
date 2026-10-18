package com.ridertapia.proveedores.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.proveedores.model.DetalleRecepcion;

@Repository
public interface DetalleRecepcionRepository extends JpaRepository<DetalleRecepcion, Long> {

    List<DetalleRecepcion> findByRecepcionCompraIdRecepcionCompra(Long idRecepcionCompra);
}
