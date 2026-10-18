package com.ridertapia.serviciotecnico;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.CalificacionServicioRepository;
import com.ridertapia.serviciotecnico.repository.FotoSolicitudRepository;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.RepuestoUtilizadoRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

/**
 * Deja la base H2 vacía antes de cada test de integración.
 * Borra en orden (primero los registros que dependen de otros) para no romper las claves foráneas.
 */
@Component
public class LimpiezaBaseDatos {

    @Autowired
    private CalificacionServicioRepository calificacionServicioRepository;

    @Autowired
    private NotificacionTallerRepository notificacionTallerRepository;

    @Autowired
    private RepuestoUtilizadoRepository repuestoUtilizadoRepository;

    @Autowired
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private FotoSolicitudRepository fotoSolicitudRepository;

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    public void limpiar() {
        calificacionServicioRepository.deleteAll();
        notificacionTallerRepository.deleteAll();
        repuestoUtilizadoRepository.deleteAll();
        historialEstadoOrdenRepository.deleteAll();
        ordenTrabajoRepository.deleteAll();
        fotoSolicitudRepository.deleteAll();
        solicitudServicioRepository.deleteAll();
        bicicletaRepository.deleteAll();
        tipoServicioRepository.deleteAll();
    }
}
