package com.ridertapia.proveedores.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.proveedores.model.RecepcionCompra;

@Repository
public interface RecepcionCompraRepository extends JpaRepository<RecepcionCompra, Long> {

    List<RecepcionCompra> findByOrdenCompraIdOrdenCompra(Long idOrdenCompra);
}
