package com.ridertapia.proveedores.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;

@Service
public class DetalleOrdenCompraService {

    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    public DetalleOrdenCompra guardarDetalleOrdenCompra(DetalleOrdenCompra detalleOrdenCompra) {
        detalleOrdenCompra.setOrdenCompra(resolverOrdenCompra(detalleOrdenCompra.getOrdenCompra()));
        // Al crear el detalle todavía no llega nada
        if (detalleOrdenCompra.getCantidadRecibida() == null) {
            detalleOrdenCompra.setCantidadRecibida(0);
        }
        return detalleOrdenCompraRepository.save(detalleOrdenCompra);
    }

    public List<DetalleOrdenCompra> listarDetallesOrdenCompra() {
        return detalleOrdenCompraRepository.findAll();
    }

    public Optional<DetalleOrdenCompra> findById(Long id) {
        return detalleOrdenCompraRepository.findById(id);
    }

    public List<DetalleOrdenCompra> findByOrdenCompra(Long idOrdenCompra) {
        return detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(idOrdenCompra);
    }

    public DetalleOrdenCompra actualizarDetalleOrdenCompra(Long id, DetalleOrdenCompra datos) {
        DetalleOrdenCompra detalleOrdenCompraActual = detalleOrdenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DetalleOrdenCompra no encontrado con id: " + id));
        detalleOrdenCompraActual.setIdVariante(datos.getIdVariante());
        detalleOrdenCompraActual.setCantidadSolicitada(datos.getCantidadSolicitada());
        detalleOrdenCompraActual.setCantidadRecibida(datos.getCantidadRecibida());
        detalleOrdenCompraActual.setCostoUnitario(datos.getCostoUnitario());
        detalleOrdenCompraActual.setOrdenCompra(resolverOrdenCompra(datos.getOrdenCompra()));
        return detalleOrdenCompraRepository.save(detalleOrdenCompraActual);
    }

    public void eliminarDetalleOrdenCompra(Long id) {
        detalleOrdenCompraRepository.deleteById(id);
    }

    private OrdenCompra resolverOrdenCompra(OrdenCompra ordenCompra) {
        if (ordenCompra == null || ordenCompra.getIdOrdenCompra() == null) {
            throw new RuntimeException("OrdenCompra no encontrada con id: null");
        }
        return ordenCompraRepository.findById(ordenCompra.getIdOrdenCompra())
                .orElseThrow(() -> new RuntimeException("OrdenCompra no encontrada con id: " + ordenCompra.getIdOrdenCompra()));
    }
}
