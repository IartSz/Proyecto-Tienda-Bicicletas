package com.ridertapia.proveedores.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

@Service
public class RecepcionCompraService {

    @Autowired
    private RecepcionCompraRepository recepcionCompraRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    public RecepcionCompra guardarRecepcionCompra(RecepcionCompra recepcionCompra) {
        recepcionCompra.setOrdenCompra(resolverOrdenCompra(recepcionCompra.getOrdenCompra()));
        // Solo se recibe mercadería de una orden enviada o recibida en parte
        EstadoOrdenCompra estado = recepcionCompra.getOrdenCompra().getEstado();
        if (estado != EstadoOrdenCompra.ENVIADA && estado != EstadoOrdenCompra.RECIBIDA_PARCIAL) {
            throw new IllegalStateException("Solo se puede recepcionar una orden enviada");
        }
        return recepcionCompraRepository.save(recepcionCompra);
    }

    public List<RecepcionCompra> listarRecepcionesCompra() {
        return recepcionCompraRepository.findAll();
    }

    public Optional<RecepcionCompra> findById(Long id) {
        return recepcionCompraRepository.findById(id);
    }

    public List<RecepcionCompra> findByOrdenCompra(Long idOrdenCompra) {
        return recepcionCompraRepository.findByOrdenCompraIdOrdenCompra(idOrdenCompra);
    }

    public RecepcionCompra actualizarRecepcionCompra(Long id, RecepcionCompra datos) {
        RecepcionCompra recepcionCompraActual = recepcionCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RecepcionCompra no encontrada con id: " + id));
        recepcionCompraActual.setFechaRecepcion(datos.getFechaRecepcion());
        recepcionCompraActual.setTipoDocumento(datos.getTipoDocumento());
        recepcionCompraActual.setNumeroDocumento(datos.getNumeroDocumento());
        recepcionCompraActual.setObservacion(datos.getObservacion());
        recepcionCompraActual.setIdEmpleado(datos.getIdEmpleado());
        recepcionCompraActual.setOrdenCompra(resolverOrdenCompra(datos.getOrdenCompra()));
        return recepcionCompraRepository.save(recepcionCompraActual);
    }

    public void eliminarRecepcionCompra(Long id) {
        recepcionCompraRepository.deleteById(id);
    }

    private OrdenCompra resolverOrdenCompra(OrdenCompra ordenCompra) {
        if (ordenCompra == null || ordenCompra.getIdOrdenCompra() == null) {
            throw new RuntimeException("OrdenCompra no encontrada con id: null");
        }
        return ordenCompraRepository.findById(ordenCompra.getIdOrdenCompra())
                .orElseThrow(() -> new RuntimeException("OrdenCompra no encontrada con id: " + ordenCompra.getIdOrdenCompra()));
    }
}
