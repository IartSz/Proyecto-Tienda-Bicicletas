package com.ridertapia.serviciotecnico.service;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@Service
public class SolicitudServicioService {

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.clientes.url}")
    private String clientesUrl;

    public SolicitudServicio guardarSolicitudServicio(SolicitudServicio solicitudServicio) {
        solicitudServicio.setTipoServicio(resolverTipoServicio(solicitudServicio.getTipoServicio()));
        // La solicitud del cliente parte pendiente
        if (solicitudServicio.getEstado() == null) {
            solicitudServicio.setEstado(EstadoSolicitud.PENDIENTE);
        }
        validarCliente(solicitudServicio.getRutCliente());
        return solicitudServicioRepository.save(solicitudServicio);
    }

    public List<SolicitudServicio> listarSolicitudesServicio() {
        return solicitudServicioRepository.findAll();
    }

    public Optional<SolicitudServicio> findById(Long id) {
        return solicitudServicioRepository.findById(id);
    }

    public List<SolicitudServicio> findByTelefonoContacto(String telefonoContacto) {
        return solicitudServicioRepository.findByTelefonoContacto(telefonoContacto);
    }

    public SolicitudServicio actualizarSolicitudServicio(Long id, SolicitudServicio datos) {
        SolicitudServicio solicitudServicioActual = solicitudServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SolicitudServicio no encontrada con id: " + id));
        solicitudServicioActual.setNombreContacto(datos.getNombreContacto());
        solicitudServicioActual.setTelefonoContacto(datos.getTelefonoContacto());
        solicitudServicioActual.setEmailContacto(datos.getEmailContacto());
        solicitudServicioActual.setRutCliente(datos.getRutCliente());
        solicitudServicioActual.setDescripcionFalla(datos.getDescripcionFalla());
        solicitudServicioActual.setFechaSolicitud(datos.getFechaSolicitud());
        solicitudServicioActual.setFechaPreferida(datos.getFechaPreferida());
        solicitudServicioActual.setEstado(datos.getEstado());
        solicitudServicioActual.setTipoServicio(resolverTipoServicio(datos.getTipoServicio()));
        return solicitudServicioRepository.save(solicitudServicioActual);
    }

    public void eliminarSolicitudServicio(Long id) {
        solicitudServicioRepository.deleteById(id);
    }

    private TipoServicio resolverTipoServicio(TipoServicio tipoServicio) {
        if (tipoServicio == null || tipoServicio.getIdTipoServicio() == null) {
            throw new RuntimeException("TipoServicio no encontrado con id: null");
        }
        return tipoServicioRepository.findById(tipoServicio.getIdTipoServicio())
                .orElseThrow(() -> new RuntimeException("TipoServicio no encontrado con id: " + tipoServicio.getIdTipoServicio()));
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
