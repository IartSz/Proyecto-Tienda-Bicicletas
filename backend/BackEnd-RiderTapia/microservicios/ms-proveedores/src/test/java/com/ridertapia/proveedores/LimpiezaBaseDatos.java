package com.ridertapia.proveedores;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.DetalleRecepcionRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProductoProveedorRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

/**
 * Deja la base H2 vacía antes de cada test de integración.
 * Borra en orden (primero los registros que dependen de otros) para no romper las claves foráneas.
 */
@Component
public class LimpiezaBaseDatos {

    @Autowired
    private DetalleRecepcionRepository detalleRecepcionRepository;

    @Autowired
    private RecepcionCompraRepository recepcionCompraRepository;

    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private ProductoProveedorRepository productoProveedorRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    public void limpiar() {
        detalleRecepcionRepository.deleteAll();
        recepcionCompraRepository.deleteAll();
        detalleOrdenCompraRepository.deleteAll();
        ordenCompraRepository.deleteAll();
        productoProveedorRepository.deleteAll();
        proveedorRepository.deleteAll();
    }
}
