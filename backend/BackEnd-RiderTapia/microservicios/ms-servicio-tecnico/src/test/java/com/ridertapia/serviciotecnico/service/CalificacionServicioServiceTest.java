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
import com.ridertapia.serviciotecnico.model.CalificacionServicio;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.CalificacionServicioRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@ExtendWith(MockitoExtension.class)
class CalificacionServicioServiceTest {

    @Mock
    private CalificacionServicioRepository calificacionServicioRepository;

    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @InjectMocks
    private CalificacionServicioService calificacionServicioService;

    private CalificacionServicio calificacionServicio;

    @BeforeEach
    void setUp() {
        calificacionServicio = new CalificacionServicio(1L, 5, "Excelente atención, quedó como nueva", LocalDateTime.of(2026, 10, 10, 12, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void guardarCalificacionServicio() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.ENTREGADA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(calificacionServicioRepository.existsByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(false);
        when(calificacionServicioRepository.save(calificacionServicio)).thenReturn(calificacionServicio);

        CalificacionServicio resultado = calificacionServicioService.guardarCalificacionServicio(calificacionServicio);

        assertNotNull(resultado);
        assertEquals(5, resultado.getPuntuacion());
        verify(calificacionServicioRepository, times(1)).save(calificacionServicio);
    }

    @Test
    void guardarCalificacionServicioConOrdenTrabajoNoExistente() {
        calificacionServicio.setOrdenTrabajo(new OrdenTrabajo(99L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> calificacionServicioService.guardarCalificacionServicio(calificacionServicio));

        assertEquals("OrdenTrabajo no encontrada con id: 99", ex.getMessage());
        verify(calificacionServicioRepository, never()).save(any(CalificacionServicio.class));
    }

    @Test
    void listarCalificacionesServicio() {
        CalificacionServicio otro = new CalificacionServicio(2L, 4, null, LocalDateTime.of(2026, 10, 10, 13, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(calificacionServicioRepository.findAll()).thenReturn(Arrays.asList(calificacionServicio, otro));

        List<CalificacionServicio> resultado = calificacionServicioService.listarCalificacionesServicio();

        assertEquals(2, resultado.size());
        verify(calificacionServicioRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(calificacionServicioRepository.findById(1L)).thenReturn(Optional.of(calificacionServicio));

        Optional<CalificacionServicio> resultado = calificacionServicioService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(5, resultado.get().getPuntuacion());
        verify(calificacionServicioRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(calificacionServicioRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<CalificacionServicio> resultado = calificacionServicioService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(calificacionServicioRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenTrabajoConResultados() {
        when(calificacionServicioRepository.findByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(List.of(calificacionServicio));

        List<CalificacionServicio> resultado = calificacionServicioService.findByOrdenTrabajo(1L);

        assertEquals(1, resultado.size());
        verify(calificacionServicioRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(1L);
    }

    @Test
    void findByOrdenTrabajoSinResultados() {
        when(calificacionServicioRepository.findByOrdenTrabajoIdOrdenTrabajo(99L)).thenReturn(List.of());

        List<CalificacionServicio> resultado = calificacionServicioService.findByOrdenTrabajo(99L);

        assertTrue(resultado.isEmpty());
        verify(calificacionServicioRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(99L);
    }

    @Test
    void actualizarCalificacionServicioExistente() {
        CalificacionServicio datos = new CalificacionServicio(null, 3, "Se demoró un día más de lo indicado", LocalDateTime.of(2026, 10, 10, 12, 30), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(calificacionServicioRepository.findById(1L)).thenReturn(Optional.of(calificacionServicio));
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(calificacionServicioRepository.save(any(CalificacionServicio.class))).thenAnswer(inv -> inv.getArgument(0));

        CalificacionServicio resultado = calificacionServicioService.actualizarCalificacionServicio(1L, datos);

        assertEquals(1L, resultado.getIdCalificacionServicio());
        assertEquals(3, resultado.getPuntuacion());
        verify(calificacionServicioRepository, times(1)).findById(1L);
        verify(calificacionServicioRepository, times(1)).save(calificacionServicio);
    }

    @Test
    void actualizarCalificacionServicioNoExistente() {
        when(calificacionServicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> calificacionServicioService.actualizarCalificacionServicio(99L, calificacionServicio));

        assertEquals("CalificacionServicio no encontrada con id: 99", ex.getMessage());
        verify(calificacionServicioRepository, times(1)).findById(99L);
        verify(calificacionServicioRepository, never()).save(any(CalificacionServicio.class));
    }

    @Test
    void eliminarCalificacionServicio() {
        calificacionServicioService.eliminarCalificacionServicio(1L);

        verify(calificacionServicioRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarCalificacionServicioConOrdenNoEntregada() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> calificacionServicioService.guardarCalificacionServicio(calificacionServicio));

        assertEquals("Solo se puede calificar un servicio entregado", ex.getMessage());
        verify(calificacionServicioRepository, never()).save(any(CalificacionServicio.class));
    }

    @Test
    void guardarCalificacionServicioYaCalificada() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.ENTREGADA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(calificacionServicioRepository.existsByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> calificacionServicioService.guardarCalificacionServicio(calificacionServicio));

        assertEquals("Esta orden ya fue calificada", ex.getMessage());
        verify(calificacionServicioRepository, never()).save(any(CalificacionServicio.class));
    }

    @Test
    void guardarCalificacionServicioConPuntuacionFueraDeRango() {
        calificacionServicio.setPuntuacion(6);
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.ENTREGADA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> calificacionServicioService.guardarCalificacionServicio(calificacionServicio));

        assertEquals("La puntuación debe estar entre 1 y 5", ex.getMessage());
        verify(calificacionServicioRepository, never()).save(any(CalificacionServicio.class));
    }
}
