package com.ridertapia.proveedores.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.proveedores.model.ProductoProveedor;

@Repository
public interface ProductoProveedorRepository extends JpaRepository<ProductoProveedor, Long> {

    List<ProductoProveedor> findByIdVariante(Long idVariante);

    List<ProductoProveedor> findByProveedorIdProveedor(Long idProveedor);
}
