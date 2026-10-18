package com.ridertapia.serviciotecnico.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@ExtendWith(MockitoExtension.class)
class HistorialEstadoOrdenServiceTest {

    @Mock
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @InjectMocks
    private HistorialEstadoOrdenService historialEstadoOrdenService;

    private HistorialEstadoOrden historialEstadoOrden;

    @BeforeEach
    void setUp() {
        historialEstadoOrden = new HistorialEstadoOrden(1L, EstadoOrden.RECIBIDA, EstadoOrden.EN_REVISION, LocalDateTime.of(2026, 10, 7, 12, 0), 3L, "Se revisa la bicicleta", new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void guardarHistorialEstadoOrden() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(historialEstadoOrdenRepository.save(historialEstadoOrden)).thenReturn(historialEstadoOrden);

        HistorialEstadoOrden resultado = historialEstadoOrdenService.guardarHistorialEstadoOrden(historialEstadoOrden);

        assertNotNull(resultado);
        assertEquals(EstadoOrden.EN_REVISION, resultado.getEstadoNuevo());
        verify(historialEstadoOrdenRepository, times(1)).save(historialEstadoOrden);
    }

    @Test
    void guardarHistorialEstadoOrdenConOrdenTrabajoNoExistente() {
        historialEstadoOrden.setOrdenTrabajo(new OrdenTrabajo(99L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> historialEstadoOrdenService.guardarHistorialEstadoOrden(historialEstadoOrden));

        assertEquals("OrdenTrabajo no encontrada con id: 99", ex.getMessage());
        verify(historialEstadoOrdenRepository, never()).save(any(HistorialEstadoOrden.class));
    }

    @Test
    void listarHistorialEstadosOrden() {
        HistorialEstadoOrden otro = new HistorialEstadoOrden(2L, EstadoOrden.EN_REVISION, EstadoOrden.EN_REPARACION, LocalDateTime.of(2026, 10, 8, 9, 0), 3L, null, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(historialEstadoOrdenRepository.findAll()).thenReturn(Arrays.asList(historialEstadoOrden, otro));

        List<HistorialEstadoOrden> resultado = historialEstadoOrdenService.listarHistorialEstadosOrden();

        assertEquals(2, resultado.size());
        verify(historialEstadoOrdenRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(historialEstadoOrdenRepository.findById(1L)).thenReturn(Optional.of(historialEstadoOrden));

        Optional<HistorialEstadoOrden> resultado = historialEstadoOrdenService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(EstadoOrden.EN_REVISION, resultado.get().getEstadoNuevo());
        verify(historialEstadoOrdenRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(historialEstadoOrdenRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<HistorialEstadoOrden> resultado = historialEstadoOrdenService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(historialEstadoOrdenRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenTrabajoConResultados() {
        when(historialEstadoOrdenRepository.findByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(List.of(historialEstadoOrden));

        List<HistorialEstadoOrden> resultado = historialEstadoOrdenService.findByOrdenTrabajo(1L);

        assertEquals(1, resultado.size());
        verify(historialEstadoOrdenRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(1L);
    }

    @Test
    void findByOrdenTrabajoSinResultados() {
        when(historialEstadoOrdenRepository.findByOrdenTrabajoIdOrdenTrabajo(99L)).thenReturn(List.of());

        List<HistorialEstadoOrden> resultado = historialEstadoOrdenService.findByOrdenTrabajo(99L);

        assertTrue(resultado.isEmpty());
        verify(historialEstadoOrdenRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(99L);
    }

    @Test
    void actualizarHistorialEstadoOrdenExistente() {
        HistorialEstadoOrden datos = new HistorialEstadoOrden(null, EstadoOrden.EN_REPARACION, EstadoOrden.LISTA, LocalDateTime.of(2026, 10, 8, 17, 0), 3L, "Lista para retiro", new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(historialEstadoOrdenRepository.findById(1L)).thenReturn(Optional.of(historialEstadoOrden));
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(historialEstadoOrdenRepository.save(any(HistorialEstadoOrden.class))).thenAnswer(inv -> inv.getArgument(0));

        HistorialEstadoOrden resultado = historialEstadoOrdenService.actualizarHistorialEstadoOrden(1L, datos);

        assertEquals(1L, resultado.getIdHistorialEstadoOrden());
        assertEquals(EstadoOrden.LISTA, resultado.getEstadoNuevo());
        verify(historialEstadoOrdenRepository, times(1)).findById(1L);
        verify(historialEstadoOrdenRepository, times(1)).save(historialEstadoOrden);
    }

    @Test
    void actualizarHistorialEstadoOrdenNoExistente() {
        when(historialEstadoOrdenRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> historialEstadoOrdenService.actualizarHistorialEstadoOrden(99L, historialEstadoOrden));

        assertEquals("HistorialEstadoOrden no encontrado con id: 99", ex.getMessage());
        verify(historialEstadoOrdenRepository, times(1)).findById(99L);
        verify(historialEstadoOrdenRepository, never()).save(any(HistorialEstadoOrden.class));
    }

    @Test
    void eliminarHistorialEstadoOrden() {
        historialEstadoOrdenService.eliminarHistorialEstadoOrden(1L);

        verify(historialEstadoOrdenRepository, times(1)).deleteById(1L);
    }
}
