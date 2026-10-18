package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.FotoSolicitud;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.repository.FotoSolicitudRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;

@Service
public class FotoSolicitudService {

    @Autowired
    private FotoSolicitudRepository fotoSolicitudRepository;

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    // Formatos y tamaño máximo permitidos para las fotos (HU-40)
    private static final Set<String> FORMATOS_PERMITIDOS = Set.of("jpg", "jpeg", "png", "webp");

    private static final int TAMANO_MAXIMO_KB = 5120;

    public FotoSolicitud guardarFotoSolicitud(FotoSolicitud fotoSolicitud) {
        fotoSolicitud.setSolicitudServicio(resolverSolicitudServicio(fotoSolicitud.getSolicitudServicio()));
        validarFoto(fotoSolicitud);
        return fotoSolicitudRepository.save(fotoSolicitud);
    }

    public List<FotoSolicitud> listarFotosSolicitud() {
        return fotoSolicitudRepository.findAll();
    }

    public Optional<FotoSolicitud> findById(Long id) {
        return fotoSolicitudRepository.findById(id);
    }

    public List<FotoSolicitud> findBySolicitudServicio(Long idSolicitudServicio) {
        return fotoSolicitudRepository.findBySolicitudServicioIdSolicitudServicio(idSolicitudServicio);
    }

    public FotoSolicitud actualizarFotoSolicitud(Long id, FotoSolicitud datos) {
        FotoSolicitud fotoSolicitudActual = fotoSolicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("FotoSolicitud no encontrada con id: " + id));
        fotoSolicitudActual.setUrl(datos.getUrl());
        fotoSolicitudActual.setFormato(datos.getFormato());
        fotoSolicitudActual.setTamanoKb(datos.getTamanoKb());
        fotoSolicitudActual.setSolicitudServicio(resolverSolicitudServicio(datos.getSolicitudServicio()));
        validarFoto(fotoSolicitudActual);
        return fotoSolicitudRepository.save(fotoSolicitudActual);
    }

    public void eliminarFotoSolicitud(Long id) {
        fotoSolicitudRepository.deleteById(id);
    }

    private SolicitudServicio resolverSolicitudServicio(SolicitudServicio solicitudServicio) {
        if (solicitudServicio == null || solicitudServicio.getIdSolicitudServicio() == null) {
            throw new RuntimeException("SolicitudServicio no encontrada con id: null");
        }
        return solicitudServicioRepository.findById(solicitudServicio.getIdSolicitudServicio())
                .orElseThrow(() -> new RuntimeException("SolicitudServicio no encontrada con id: " + solicitudServicio.getIdSolicitudServicio()));
    }

    private void validarFoto(FotoSolicitud fotoSolicitud) {
        String formato = fotoSolicitud.getFormato() == null ? "" : fotoSolicitud.getFormato().toLowerCase();
        if (!FORMATOS_PERMITIDOS.contains(formato)) {
            throw new IllegalArgumentException("Formato no permitido. Usa jpg, jpeg, png o webp");
        }
        if (fotoSolicitud.getTamanoKb() == null || fotoSolicitud.getTamanoKb() > TAMANO_MAXIMO_KB) {
            throw new IllegalArgumentException("La imagen no puede superar los 5 MB");
        }
    }
}
