package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.CalificacionServicio;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.repository.CalificacionServicioRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@Service
public class CalificacionServicioService {

    @Autowired
    private CalificacionServicioRepository calificacionServicioRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    // HU-46: solo se califica un servicio entregado y una sola vez por orden
    public CalificacionServicio guardarCalificacionServicio(CalificacionServicio calificacionServicio) {
        calificacionServicio.setOrdenTrabajo(resolverOrdenTrabajo(calificacionServicio.getOrdenTrabajo()));
        validarPuntuacion(calificacionServicio.getPuntuacion());
        OrdenTrabajo ordenTrabajo = calificacionServicio.getOrdenTrabajo();
        if (ordenTrabajo.getEstado() != EstadoOrden.ENTREGADA) {
            throw new IllegalStateException("Solo se puede calificar un servicio entregado");
        }
        if (calificacionServicioRepository.existsByOrdenTrabajoIdOrdenTrabajo(ordenTrabajo.getIdOrdenTrabajo())) {
            throw new IllegalStateException("Esta orden ya fue calificada");
        }
        return calificacionServicioRepository.save(calificacionServicio);
    }

    public List<CalificacionServicio> listarCalificacionesServicio() {
        return calificacionServicioRepository.findAll();
    }

    public Optional<CalificacionServicio> findById(Long id) {
        return calificacionServicioRepository.findById(id);
    }

    public List<CalificacionServicio> findByOrdenTrabajo(Long idOrdenTrabajo) {
        return calificacionServicioRepository.findByOrdenTrabajoIdOrdenTrabajo(idOrdenTrabajo);
    }

    public CalificacionServicio actualizarCalificacionServicio(Long id, CalificacionServicio datos) {
        CalificacionServicio calificacionServicioActual = calificacionServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("CalificacionServicio no encontrada con id: " + id));
        calificacionServicioActual.setPuntuacion(datos.getPuntuacion());
        calificacionServicioActual.setComentario(datos.getComentario());
        calificacionServicioActual.setFechaCalificacion(datos.getFechaCalificacion());
        calificacionServicioActual.setOrdenTrabajo(resolverOrdenTrabajo(datos.getOrdenTrabajo()));
        validarPuntuacion(calificacionServicioActual.getPuntuacion());
        return calificacionServicioRepository.save(calificacionServicioActual);
    }

    public void eliminarCalificacionServicio(Long id) {
        calificacionServicioRepository.deleteById(id);
    }

    private OrdenTrabajo resolverOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        if (ordenTrabajo == null || ordenTrabajo.getIdOrdenTrabajo() == null) {
            throw new RuntimeException("OrdenTrabajo no encontrada con id: null");
        }
        return ordenTrabajoRepository.findById(ordenTrabajo.getIdOrdenTrabajo())
                .orElseThrow(() -> new RuntimeException("OrdenTrabajo no encontrada con id: " + ordenTrabajo.getIdOrdenTrabajo()));
    }

    private void validarPuntuacion(Integer puntuacion) {
        if (puntuacion == null || puntuacion < 1 || puntuacion > 5) {
            throw new IllegalArgumentException("La puntuación debe estar entre 1 y 5");
        }
    }
}
