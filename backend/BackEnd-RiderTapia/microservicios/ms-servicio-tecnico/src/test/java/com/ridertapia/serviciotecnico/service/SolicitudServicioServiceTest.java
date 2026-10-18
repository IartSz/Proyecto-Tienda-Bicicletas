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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@ExtendWith(MockitoExtension.class)
class SolicitudServicioServiceTest {

    @Mock
    private SolicitudServicioRepository solicitudServicioRepository;

    @Mock
    private TipoServicioRepository tipoServicioRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private SolicitudServicioService solicitudServicioService;

    private static final String CLIENTES_URL = "http://localhost:9002/api/v1/clientes";

    private SolicitudServicio solicitudServicio;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(solicitudServicioService, "clientesUrl", CLIENTES_URL);
        solicitudServicio = new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
    }

    @Test
    void guardarSolicitudServicio() {
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(restTemplate.getForEntity(URI.create(CLIENTES_URL + "/12345678-5"), String.class))
                .thenReturn(ResponseEntity.ok("{}"));
        when(solicitudServicioRepository.save(solicitudServicio)).thenReturn(solicitudServicio);

        SolicitudServicio resultado = solicitudServicioService.guardarSolicitudServicio(solicitudServicio);

        assertNotNull(resultado);
        assertEquals(EstadoSolicitud.PENDIENTE, resultado.getEstado());
        verify(solicitudServicioRepository, times(1)).save(solicitudServicio);
    }

    @Test
    void guardarSolicitudServicioConTipoServicioNoExistente() {
        solicitudServicio.setTipoServicio(new TipoServicio(99L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(tipoServicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> solicitudServicioService.guardarSolicitudServicio(solicitudServicio));

        assertEquals("TipoServicio no encontrado con id: 99", ex.getMessage());
        verify(solicitudServicioRepository, never()).save(any(SolicitudServicio.class));
    }

    @Test
    void listarSolicitudesServicio() {
        SolicitudServicio otro = new SolicitudServicio(2L, "Ana Soto", "933334444", null, null, "Los cambios saltan en los piñones chicos", LocalDateTime.of(2026, 10, 6, 12, 0), null, EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(solicitudServicioRepository.findAll()).thenReturn(Arrays.asList(solicitudServicio, otro));

        List<SolicitudServicio> resultado = solicitudServicioService.listarSolicitudesServicio();

        assertEquals(2, resultado.size());
        verify(solicitudServicioRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(solicitudServicio));

        Optional<SolicitudServicio> resultado = solicitudServicioService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(EstadoSolicitud.PENDIENTE, resultado.get().getEstado());
        verify(solicitudServicioRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(solicitudServicioRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<SolicitudServicio> resultado = solicitudServicioService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(solicitudServicioRepository, times(1)).findById(99L);
    }

    @Test
    void findByTelefonoContactoConResultados() {
        when(solicitudServicioRepository.findByTelefonoContacto("912345678")).thenReturn(List.of(solicitudServicio));

        List<SolicitudServicio> resultado = solicitudServicioService.findByTelefonoContacto("912345678");

        assertEquals(1, resultado.size());
        verify(solicitudServicioRepository, times(1)).findByTelefonoContacto("912345678");
    }

    @Test
    void findByTelefonoContactoSinResultados() {
        when(solicitudServicioRepository.findByTelefonoContacto("no-existe")).thenReturn(List.of());

        List<SolicitudServicio> resultado = solicitudServicioService.findByTelefonoContacto("no-existe");

        assertTrue(resultado.isEmpty());
        verify(solicitudServicioRepository, times(1)).findByTelefonoContacto("no-existe");
    }

    @Test
    void actualizarSolicitudServicioExistente() {
        SolicitudServicio datos = new SolicitudServicio(null, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien y suena la dirección", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 10), EstadoSolicitud.AGENDADA, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(solicitudServicio));
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(solicitudServicioRepository.save(any(SolicitudServicio.class))).thenAnswer(inv -> inv.getArgument(0));

        SolicitudServicio resultado = solicitudServicioService.actualizarSolicitudServicio(1L, datos);

        assertEquals(1L, resultado.getIdSolicitudServicio());
        assertEquals(EstadoSolicitud.AGENDADA, resultado.getEstado());
        verify(solicitudServicioRepository, times(1)).findById(1L);
        verify(solicitudServicioRepository, times(1)).save(solicitudServicio);
    }

    @Test
    void actualizarSolicitudServicioNoExistente() {
        when(solicitudServicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> solicitudServicioService.actualizarSolicitudServicio(99L, solicitudServicio));

        assertEquals("SolicitudServicio no encontrada con id: 99", ex.getMessage());
        verify(solicitudServicioRepository, times(1)).findById(99L);
        verify(solicitudServicioRepository, never()).save(any(SolicitudServicio.class));
    }

    @Test
    void eliminarSolicitudServicio() {
        solicitudServicioService.eliminarSolicitudServicio(1L);

        verify(solicitudServicioRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarSolicitudServicioConClienteNoExistente() {
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(restTemplate.getForEntity(URI.create(CLIENTES_URL + "/12345678-5"), String.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> solicitudServicioService.guardarSolicitudServicio(solicitudServicio));

        assertEquals("Cliente no encontrado con rut: 12345678-5", ex.getMessage());
        verify(solicitudServicioRepository, never()).save(any(SolicitudServicio.class));
    }

    @Test
    void guardarSolicitudServicioSinRutYSinEstado() {
        solicitudServicio.setRutCliente(null);
        solicitudServicio.setEstado(null);
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(solicitudServicioRepository.save(solicitudServicio)).thenReturn(solicitudServicio);

        SolicitudServicio resultado = solicitudServicioService.guardarSolicitudServicio(solicitudServicio);

        assertEquals(EstadoSolicitud.PENDIENTE, resultado.getEstado());
        verify(restTemplate, never()).getForEntity(any(URI.class), eq(String.class));
    }
}
