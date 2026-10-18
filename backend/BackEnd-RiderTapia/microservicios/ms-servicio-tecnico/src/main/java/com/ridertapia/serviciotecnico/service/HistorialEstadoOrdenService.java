package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@Service
public class HistorialEstadoOrdenService {

    @Autowired
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    public HistorialEstadoOrden guardarHistorialEstadoOrden(HistorialEstadoOrden historialEstadoOrden) {
        historialEstadoOrden.setOrdenTrabajo(resolverOrdenTrabajo(historialEstadoOrden.getOrdenTrabajo()));
        return historialEstadoOrdenRepository.save(historialEstadoOrden);
    }

    public List<HistorialEstadoOrden> listarHistorialEstadosOrden() {
        return historialEstadoOrdenRepository.findAll();
    }

    public Optional<HistorialEstadoOrden> findById(Long id) {
        return historialEstadoOrdenRepository.findById(id);
    }

    public List<HistorialEstadoOrden> findByOrdenTrabajo(Long idOrdenTrabajo) {
        return historialEstadoOrdenRepository.findByOrdenTrabajoIdOrdenTrabajo(idOrdenTrabajo);
    }

    public HistorialEstadoOrden actualizarHistorialEstadoOrden(Long id, HistorialEstadoOrden datos) {
        HistorialEstadoOrden historialEstadoOrdenActual = historialEstadoOrdenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("HistorialEstadoOrden no encontrado con id: " + id));
        historialEstadoOrdenActual.setEstadoAnterior(datos.getEstadoAnterior());
        historialEstadoOrdenActual.setEstadoNuevo(datos.getEstadoNuevo());
        historialEstadoOrdenActual.setFechaCambio(datos.getFechaCambio());
        historialEstadoOrdenActual.setIdEmpleado(datos.getIdEmpleado());
        historialEstadoOrdenActual.setComentario(datos.getComentario());
        historialEstadoOrdenActual.setOrdenTrabajo(resolverOrdenTrabajo(datos.getOrdenTrabajo()));
        return historialEstadoOrdenRepository.save(historialEstadoOrdenActual);
    }

    public void eliminarHistorialEstadoOrden(Long id) {
        historialEstadoOrdenRepository.deleteById(id);
    }

    private OrdenTrabajo resolverOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        if (ordenTrabajo == null || ordenTrabajo.getIdOrdenTrabajo() == null) {
            throw new RuntimeException("OrdenTrabajo no encontrada con id: null");
        }
        return ordenTrabajoRepository.findById(ordenTrabajo.getIdOrdenTrabajo())
                .orElseThrow(() -> new RuntimeException("OrdenTrabajo no encontrada con id: " + ordenTrabajo.getIdOrdenTrabajo()));
    }
}
