package com.ridertapia.serviciotecnico.service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@Service
public class OrdenTrabajoService {

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    @Autowired
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Autowired
    private NotificacionTallerRepository notificacionTallerRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.clientes.url}")
    private String clientesUrl;

    // HU-41 y HU-42: la orden recibe un código único y parte en estado RECIBIDA
    public OrdenTrabajo guardarOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        validarCliente(ordenTrabajo.getRutCliente());
        ordenTrabajo.setBicicleta(resolverBicicleta(ordenTrabajo.getBicicleta()));
        ordenTrabajo.setTipoServicio(resolverTipoServicio(ordenTrabajo.getTipoServicio()));
        ordenTrabajo.setSolicitudServicio(resolverSolicitudServicio(ordenTrabajo.getSolicitudServicio()));
        if (ordenTrabajo.getEstado() == null) {
            ordenTrabajo.setEstado(EstadoOrden.RECIBIDA);
        }
        OrdenTrabajo nueva = ordenTrabajoRepository.save(ordenTrabajo);
        if (nueva.getCodigo() == null) {
            nueva.setCodigo(String.format("OT-%05d", nueva.getIdOrdenTrabajo()));
            nueva = ordenTrabajoRepository.save(nueva);
        }
        registrarCambioEstado(nueva, null);
        return nueva;
    }

    public List<OrdenTrabajo> listarOrdenesTrabajo() {
        return ordenTrabajoRepository.findAll();
    }

    public Optional<OrdenTrabajo> findById(Long id) {
        return ordenTrabajoRepository.findById(id);
    }

    public List<OrdenTrabajo> findByTelefonoCliente(String telefonoCliente) {
        return ordenTrabajoRepository.findByTelefonoCliente(telefonoCliente);
    }

    // HU-43: cada cambio de estado queda en el historial con su fecha
    public OrdenTrabajo actualizarOrdenTrabajo(Long id, OrdenTrabajo datos) {
        OrdenTrabajo ordenTrabajoActual = ordenTrabajoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrdenTrabajo no encontrada con id: " + id));
        EstadoOrden estadoAnterior = ordenTrabajoActual.getEstado();
        if (datos.getCodigo() != null) {
            ordenTrabajoActual.setCodigo(datos.getCodigo());
        }
        ordenTrabajoActual.setFechaIngreso(datos.getFechaIngreso());
        ordenTrabajoActual.setFechaEstimadaEntrega(datos.getFechaEstimadaEntrega());
        ordenTrabajoActual.setFechaEntrega(datos.getFechaEntrega());
        ordenTrabajoActual.setEstado(datos.getEstado());
        ordenTrabajoActual.setNombreCliente(datos.getNombreCliente());
        ordenTrabajoActual.setTelefonoCliente(datos.getTelefonoCliente());
        ordenTrabajoActual.setEmailCliente(datos.getEmailCliente());
        ordenTrabajoActual.setRutCliente(datos.getRutCliente());
        ordenTrabajoActual.setDiagnostico(datos.getDiagnostico());
        ordenTrabajoActual.setCostoManoObra(datos.getCostoManoObra());
        ordenTrabajoActual.setIdEmpleado(datos.getIdEmpleado());
        ordenTrabajoActual.setBicicleta(resolverBicicleta(datos.getBicicleta()));
        ordenTrabajoActual.setTipoServicio(resolverTipoServicio(datos.getTipoServicio()));
        ordenTrabajoActual.setSolicitudServicio(resolverSolicitudServicio(datos.getSolicitudServicio()));
        // Al entregar la bicicleta se guarda la fecha de entrega si no viene
        if (datos.getEstado() == EstadoOrden.ENTREGADA && ordenTrabajoActual.getFechaEntrega() == null) {
            ordenTrabajoActual.setFechaEntrega(LocalDateTime.now());
        }
        OrdenTrabajo actualizada = ordenTrabajoRepository.save(ordenTrabajoActual);
        if (estadoAnterior != actualizada.getEstado()) {
            registrarCambioEstado(actualizada, estadoAnterior);
        }
        return actualizada;
    }

    public void eliminarOrdenTrabajo(Long id) {
        ordenTrabajoRepository.deleteById(id);
    }

    private Bicicleta resolverBicicleta(Bicicleta bicicleta) {
        if (bicicleta == null || bicicleta.getIdBicicleta() == null) {
            throw new RuntimeException("Bicicleta no encontrada con id: null");
        }
        return bicicletaRepository.findById(bicicleta.getIdBicicleta())
                .orElseThrow(() -> new RuntimeException("Bicicleta no encontrada con id: " + bicicleta.getIdBicicleta()));
    }

    private TipoServicio resolverTipoServicio(TipoServicio tipoServicio) {
        if (tipoServicio == null || tipoServicio.getIdTipoServicio() == null) {
            throw new RuntimeException("TipoServicio no encontrado con id: null");
        }
        return tipoServicioRepository.findById(tipoServicio.getIdTipoServicio())
                .orElseThrow(() -> new RuntimeException("TipoServicio no encontrado con id: " + tipoServicio.getIdTipoServicio()));
    }

    private SolicitudServicio resolverSolicitudServicio(SolicitudServicio solicitudServicio) {
        if (solicitudServicio == null || solicitudServicio.getIdSolicitudServicio() == null) {
            return null;
        }
        return solicitudServicioRepository.findById(solicitudServicio.getIdSolicitudServicio())
                .orElseThrow(() -> new RuntimeException("SolicitudServicio no encontrada con id: " + solicitudServicio.getIdSolicitudServicio()));
    }

    // Guarda el cambio en el historial y, si la bicicleta quedó lista, avisa al cliente (HU-45)
    private void registrarCambioEstado(OrdenTrabajo ordenTrabajo, EstadoOrden estadoAnterior) {
        historialEstadoOrdenRepository.save(new HistorialEstadoOrden(null, estadoAnterior, ordenTrabajo.getEstado(),
                LocalDateTime.now(), ordenTrabajo.getIdEmpleado(), null, ordenTrabajo));
        if (ordenTrabajo.getEstado() == EstadoOrden.LISTA) {
            String destinatario = ordenTrabajo.getEmailCliente() != null
                    ? ordenTrabajo.getEmailCliente()
                    : ordenTrabajo.getTelefonoCliente();
            notificacionTallerRepository.save(new NotificacionTaller(null, "BICICLETA_LISTA", destinatario,
                    "Tu bicicleta ya está lista para retiro. Orden " + ordenTrabajo.getCodigo(),
                    LocalDateTime.now(), true, ordenTrabajo));
        }
    }

    // Consulta a ms-cliente: GET /api/v1/clientes/{rut}. Los clientes sin cuenta (sin RUT) no se validan
    private void validarCliente(String rutCliente) {
        if (rutCliente == null) {
            return;
        }
        try {
            restTemplate.getForEntity(URI.create(clientesUrl + "/" + rutCliente), String.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("Cliente no encontrado con rut: " + rutCliente);
        }
    }
}
