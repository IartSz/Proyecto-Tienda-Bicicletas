package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@Service
public class NotificacionTallerService {

    @Autowired
    private NotificacionTallerRepository notificacionTallerRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    public NotificacionTaller guardarNotificacionTaller(NotificacionTaller notificacionTaller) {
        notificacionTaller.setOrdenTrabajo(resolverOrdenTrabajo(notificacionTaller.getOrdenTrabajo()));
        return notificacionTallerRepository.save(notificacionTaller);
    }

    public List<NotificacionTaller> listarNotificacionesTaller() {
        return notificacionTallerRepository.findAll();
    }

    public Optional<NotificacionTaller> findById(Long id) {
        return notificacionTallerRepository.findById(id);
    }

    public List<NotificacionTaller> findByOrdenTrabajo(Long idOrdenTrabajo) {
        return notificacionTallerRepository.findByOrdenTrabajoIdOrdenTrabajo(idOrdenTrabajo);
    }

    public NotificacionTaller actualizarNotificacionTaller(Long id, NotificacionTaller datos) {
        NotificacionTaller notificacionTallerActual = notificacionTallerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NotificacionTaller no encontrada con id: " + id));
        notificacionTallerActual.setTipo(datos.getTipo());
        notificacionTallerActual.setDestinatario(datos.getDestinatario());
        notificacionTallerActual.setMensaje(datos.getMensaje());
        notificacionTallerActual.setFechaEnvio(datos.getFechaEnvio());
        notificacionTallerActual.setEnviada(datos.getEnviada());
        notificacionTallerActual.setOrdenTrabajo(resolverOrdenTrabajo(datos.getOrdenTrabajo()));
        return notificacionTallerRepository.save(notificacionTallerActual);
    }

    public void eliminarNotificacionTaller(Long id) {
        notificacionTallerRepository.deleteById(id);
    }

    private OrdenTrabajo resolverOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        if (ordenTrabajo == null || ordenTrabajo.getIdOrdenTrabajo() == null) {
            throw new RuntimeException("OrdenTrabajo no encontrada con id: null");
        }
        return ordenTrabajoRepository.findById(ordenTrabajo.getIdOrdenTrabajo())
                .orElseThrow(() -> new RuntimeException("OrdenTrabajo no encontrada con id: " + ordenTrabajo.getIdOrdenTrabajo()));
    }
}
