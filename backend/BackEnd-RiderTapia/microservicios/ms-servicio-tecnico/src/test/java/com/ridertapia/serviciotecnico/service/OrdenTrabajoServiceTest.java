package com.ridertapia.serviciotecnico.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@ExtendWith(MockitoExtension.class)
class OrdenTrabajoServiceTest {

    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Mock
    private BicicletaRepository bicicletaRepository;

    @Mock
    private TipoServicioRepository tipoServicioRepository;

    @Mock
    private SolicitudServicioRepository solicitudServicioRepository;

    @Mock
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Mock
    private NotificacionTallerRepository notificacionTallerRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private OrdenTrabajoService ordenTrabajoService;

    private static final String CLIENTES_URL = "http://localhost:9002/api/v1/clientes";

    private OrdenTrabajo ordenTrabajo;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(ordenTrabajoService, "clientesUrl", CLIENTES_URL);
        ordenTrabajo = new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
    }

    @Test
    void guardarOrdenTrabajo() {
        when(restTemplate.getForEntity(URI.create(CLIENTES_URL + "/12345678-5"), String.class))
                .thenReturn(ResponseEntity.ok("{}"));
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(ordenTrabajo)).thenReturn(ordenTrabajo);

        OrdenTrabajo resultado = ordenTrabajoService.guardarOrdenTrabajo(ordenTrabajo);

        assertNotNull(resultado);
        assertEquals(25000, resultado.getCostoManoObra());
        assertEquals("OT-00001", resultado.getCodigo());
        verify(ordenTrabajoRepository, times(1)).save(ordenTrabajo);
        verify(historialEstadoOrdenRepository, times(1)).save(any(HistorialEstadoOrden.class));
        verify(notificacionTallerRepository, never()).save(any(NotificacionTaller.class));
    }

    @Test
    void guardarOrdenTrabajoConBicicletaNoExistente() {
        ordenTrabajo.setBicicleta(new Bicicleta(99L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"));
        when(bicicletaRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> ordenTrabajoService.guardarOrdenTrabajo(ordenTrabajo));

        assertEquals("Bicicleta no encontrada con id: 99", ex.getMessage());
        verify(ordenTrabajoRepository, never()).save(any(OrdenTrabajo.class));
    }

    @Test
    void listarOrdenesTrabajo() {
        OrdenTrabajo otro = new OrdenTrabajo(2L, "OT-00002", LocalDateTime.of(2026, 10, 7, 11, 0), LocalDate.of(2026, 10, 10), null, EstadoOrden.RECIBIDA, "Ana Soto", "933334444", null, null, null, 45000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        when(ordenTrabajoRepository.findAll()).thenReturn(Arrays.asList(ordenTrabajo, otro));

        List<OrdenTrabajo> resultado = ordenTrabajoService.listarOrdenesTrabajo();

        assertEquals(2, resultado.size());
        verify(ordenTrabajoRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(ordenTrabajo));

        Optional<OrdenTrabajo> resultado = ordenTrabajoService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(25000, resultado.get().getCostoManoObra());
        verify(ordenTrabajoRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<OrdenTrabajo> resultado = ordenTrabajoService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(ordenTrabajoRepository, times(1)).findById(99L);
    }

    @Test
    void findByTelefonoClienteConResultados() {
        when(ordenTrabajoRepository.findByTelefonoCliente("912345678")).thenReturn(List.of(ordenTrabajo));

        List<OrdenTrabajo> resultado = ordenTrabajoService.findByTelefonoCliente("912345678");

        assertEquals(1, resultado.size());
        verify(ordenTrabajoRepository, times(1)).findByTelefonoCliente("912345678");
    }

    @Test
    void findByTelefonoClienteSinResultados() {
        when(ordenTrabajoRepository.findByTelefonoCliente("no-existe")).thenReturn(List.of());

        List<OrdenTrabajo> resultado = ordenTrabajoService.findByTelefonoCliente("no-existe");

        assertTrue(resultado.isEmpty());
        verify(ordenTrabajoRepository, times(1)).findByTelefonoCliente("no-existe");
    }

    @Test
    void actualizarOrdenTrabajoExistente() {
        OrdenTrabajo datos = new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.EN_REPARACION, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas y cable de cambio cortado", 30000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(ordenTrabajo));
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        OrdenTrabajo resultado = ordenTrabajoService.actualizarOrdenTrabajo(1L, datos);

        assertEquals(1L, resultado.getIdOrdenTrabajo());
        assertEquals(30000, resultado.getCostoManoObra());
        verify(ordenTrabajoRepository, times(1)).findById(1L);
        verify(ordenTrabajoRepository, times(1)).save(ordenTrabajo);
    }

    @Test
    void actualizarOrdenTrabajoNoExistente() {
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> ordenTrabajoService.actualizarOrdenTrabajo(99L, ordenTrabajo));

        assertEquals("OrdenTrabajo no encontrada con id: 99", ex.getMessage());
        verify(ordenTrabajoRepository, times(1)).findById(99L);
        verify(ordenTrabajoRepository, never()).save(any(OrdenTrabajo.class));
    }

    @Test
    void eliminarOrdenTrabajo() {
        ordenTrabajoService.eliminarOrdenTrabajo(1L);

        verify(ordenTrabajoRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarOrdenTrabajoGeneraCodigoYEstadoInicial() {
        ordenTrabajo.setIdOrdenTrabajo(null);
        ordenTrabajo.setCodigo(null);
        ordenTrabajo.setEstado(null);
        ordenTrabajo.setRutCliente(null);
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> {
            OrdenTrabajo o = inv.getArgument(0);
            o.setIdOrdenTrabajo(7L);
            return o;
        });

        OrdenTrabajo resultado = ordenTrabajoService.guardarOrdenTrabajo(ordenTrabajo);

        assertEquals("OT-00007", resultado.getCodigo());
        assertEquals(EstadoOrden.RECIBIDA, resultado.getEstado());
        verify(ordenTrabajoRepository, times(2)).save(any(OrdenTrabajo.class));
        verify(restTemplate, never()).getForEntity(any(URI.class), eq(String.class));
    }

    @Test
    void guardarOrdenTrabajoConClienteNoExistente() {
        when(restTemplate.getForEntity(URI.create(CLIENTES_URL + "/12345678-5"), String.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> ordenTrabajoService.guardarOrdenTrabajo(ordenTrabajo));

        assertEquals("Cliente no encontrado con rut: 12345678-5", ex.getMessage());
        verify(ordenTrabajoRepository, never()).save(any(OrdenTrabajo.class));
    }

    @Test
    void actualizarOrdenTrabajoAListaNotificaAlCliente() {
        OrdenTrabajo datos = new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        datos.setEstado(EstadoOrden.LISTA);
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(ordenTrabajo));
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        ordenTrabajoService.actualizarOrdenTrabajo(1L, datos);

        ArgumentCaptor<HistorialEstadoOrden> historial = ArgumentCaptor.forClass(HistorialEstadoOrden.class);
        verify(historialEstadoOrdenRepository, times(1)).save(historial.capture());
        assertEquals(EstadoOrden.RECIBIDA, historial.getValue().getEstadoAnterior());
        assertEquals(EstadoOrden.LISTA, historial.getValue().getEstadoNuevo());
        ArgumentCaptor<NotificacionTaller> notificacion = ArgumentCaptor.forClass(NotificacionTaller.class);
        verify(notificacionTallerRepository, times(1)).save(notificacion.capture());
        assertEquals("BICICLETA_LISTA", notificacion.getValue().getTipo());
        assertEquals("juan@correo.cl", notificacion.getValue().getDestinatario());
    }

    @Test
    void actualizarOrdenTrabajoSinCambioDeEstado() {
        OrdenTrabajo datos = new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        datos.setDiagnostico("Además se ajusta la dirección");
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(ordenTrabajo));
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        OrdenTrabajo resultado = ordenTrabajoService.actualizarOrdenTrabajo(1L, datos);

        assertEquals("Además se ajusta la dirección", resultado.getDiagnostico());
        verify(historialEstadoOrdenRepository, never()).save(any(HistorialEstadoOrden.class));
        verify(notificacionTallerRepository, never()).save(any(NotificacionTaller.class));
    }

    @Test
    void actualizarOrdenTrabajoAEntregadaGuardaFechaEntrega() {
        OrdenTrabajo datos = new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        datos.setEstado(EstadoOrden.ENTREGADA);
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(ordenTrabajo));
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5")));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(ordenTrabajoRepository.save(any(OrdenTrabajo.class))).thenAnswer(inv -> inv.getArgument(0));

        OrdenTrabajo resultado = ordenTrabajoService.actualizarOrdenTrabajo(1L, datos);

        assertNotNull(resultado.getFechaEntrega());
        verify(historialEstadoOrdenRepository, times(1)).save(any(HistorialEstadoOrden.class));
        verify(notificacionTallerRepository, never()).save(any(NotificacionTaller.class));
    }
}
