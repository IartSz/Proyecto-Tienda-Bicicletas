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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.RepuestoUtilizadoRepository;

@ExtendWith(MockitoExtension.class)
class RepuestoUtilizadoServiceTest {

    @Mock
    private RepuestoUtilizadoRepository repuestoUtilizadoRepository;

    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private RepuestoUtilizadoService repuestoUtilizadoService;

    private static final String ITEMS_URL = "http://localhost:9008/api/v1/items-inventario";

    private static final String MOVIMIENTOS_URL = "http://localhost:9008/api/v1/movimientos";

    private RepuestoUtilizado repuestoUtilizado;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(repuestoUtilizadoService, "itemsInventarioUrl", ITEMS_URL);
        ReflectionTestUtils.setField(repuestoUtilizadoService, "movimientosUrl", MOVIMIENTOS_URL);
        repuestoUtilizado = new RepuestoUtilizado(1L, 20L, 1, 15990, LocalDateTime.of(2026, 10, 8, 10, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void guardarRepuestoUtilizado() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/20"), Map.class)).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 20, "stockDisponible", 10, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 14000, "idProveedores", List.of(1))));
        when(repuestoUtilizadoRepository.save(repuestoUtilizado)).thenReturn(repuestoUtilizado);

        RepuestoUtilizado resultado = repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado);

        assertNotNull(resultado);
        assertEquals(1, resultado.getCantidad());
        verify(repuestoUtilizadoRepository, times(1)).save(repuestoUtilizado);
        ArgumentCaptor<Map> itemActualizado = ArgumentCaptor.forClass(Map.class);
        verify(restTemplate, times(1)).put(eq(URI.create(ITEMS_URL + "/5")), itemActualizado.capture());
        assertEquals(9, itemActualizado.getValue().get("stockDisponible"));
        verify(restTemplate, times(1)).postForEntity(eq(URI.create(MOVIMIENTOS_URL)), any(Map.class), eq(String.class));
    }

    @Test
    void guardarRepuestoUtilizadoConOrdenTrabajoNoExistente() {
        repuestoUtilizado.setOrdenTrabajo(new OrdenTrabajo(99L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado));

        assertEquals("OrdenTrabajo no encontrada con id: 99", ex.getMessage());
        verify(repuestoUtilizadoRepository, never()).save(any(RepuestoUtilizado.class));
    }

    @Test
    void listarRepuestosUtilizados() {
        RepuestoUtilizado otro = new RepuestoUtilizado(2L, 21L, 2, 4990, LocalDateTime.of(2026, 10, 8, 10, 30), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(repuestoUtilizadoRepository.findAll()).thenReturn(Arrays.asList(repuestoUtilizado, otro));

        List<RepuestoUtilizado> resultado = repuestoUtilizadoService.listarRepuestosUtilizados();

        assertEquals(2, resultado.size());
        verify(repuestoUtilizadoRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(repuestoUtilizadoRepository.findById(1L)).thenReturn(Optional.of(repuestoUtilizado));

        Optional<RepuestoUtilizado> resultado = repuestoUtilizadoService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(1, resultado.get().getCantidad());
        verify(repuestoUtilizadoRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(repuestoUtilizadoRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<RepuestoUtilizado> resultado = repuestoUtilizadoService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(repuestoUtilizadoRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenTrabajoConResultados() {
        when(repuestoUtilizadoRepository.findByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(List.of(repuestoUtilizado));

        List<RepuestoUtilizado> resultado = repuestoUtilizadoService.findByOrdenTrabajo(1L);

        assertEquals(1, resultado.size());
        verify(repuestoUtilizadoRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(1L);
    }

    @Test
    void findByOrdenTrabajoSinResultados() {
        when(repuestoUtilizadoRepository.findByOrdenTrabajoIdOrdenTrabajo(99L)).thenReturn(List.of());

        List<RepuestoUtilizado> resultado = repuestoUtilizadoService.findByOrdenTrabajo(99L);

        assertTrue(resultado.isEmpty());
        verify(repuestoUtilizadoRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(99L);
    }

    @Test
    void actualizarRepuestoUtilizadoExistente() {
        RepuestoUtilizado datos = new RepuestoUtilizado(null, 20L, 2, 15990, LocalDateTime.of(2026, 10, 8, 11, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(repuestoUtilizadoRepository.findById(1L)).thenReturn(Optional.of(repuestoUtilizado));
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(repuestoUtilizadoRepository.save(any(RepuestoUtilizado.class))).thenAnswer(inv -> inv.getArgument(0));

        RepuestoUtilizado resultado = repuestoUtilizadoService.actualizarRepuestoUtilizado(1L, datos);

        assertEquals(1L, resultado.getIdRepuestoUtilizado());
        assertEquals(2, resultado.getCantidad());
        verify(repuestoUtilizadoRepository, times(1)).findById(1L);
        verify(repuestoUtilizadoRepository, times(1)).save(repuestoUtilizado);
    }

    @Test
    void actualizarRepuestoUtilizadoNoExistente() {
        when(repuestoUtilizadoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> repuestoUtilizadoService.actualizarRepuestoUtilizado(99L, repuestoUtilizado));

        assertEquals("RepuestoUtilizado no encontrado con id: 99", ex.getMessage());
        verify(repuestoUtilizadoRepository, times(1)).findById(99L);
        verify(repuestoUtilizadoRepository, never()).save(any(RepuestoUtilizado.class));
    }

    @Test
    void eliminarRepuestoUtilizado() {
        repuestoUtilizadoService.eliminarRepuestoUtilizado(1L);

        verify(repuestoUtilizadoRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarRepuestoUtilizadoSinStockSuficiente() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/20"), Map.class)).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 20, "stockDisponible", 0, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 14000, "idProveedores", List.of(1))));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado));

        assertEquals("Stock insuficiente. Disponible: 0", ex.getMessage());
        verify(repuestoUtilizadoRepository, never()).save(any(RepuestoUtilizado.class));
        verify(restTemplate, never()).put(any(URI.class), any());
    }

    @Test
    void guardarRepuestoUtilizadoSinInventario() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/20"), Map.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado));

        assertEquals("Inventario no encontrado para la variante con id: 20", ex.getMessage());
        verify(repuestoUtilizadoRepository, never()).save(any(RepuestoUtilizado.class));
    }

    @Test
    void guardarRepuestoUtilizadoConCantidadNoValida() {
        repuestoUtilizado.setCantidad(0);
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado));

        assertEquals("La cantidad debe ser mayor a 0", ex.getMessage());
        verify(restTemplate, never()).getForObject(any(URI.class), eq(Map.class));
    }
}
