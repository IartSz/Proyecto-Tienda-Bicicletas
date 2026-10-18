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
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;

@ExtendWith(MockitoExtension.class)
class NotificacionTallerServiceTest {

    @Mock
    private NotificacionTallerRepository notificacionTallerRepository;

    @Mock
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @InjectMocks
    private NotificacionTallerService notificacionTallerService;

    private NotificacionTaller notificacionTaller;

    @BeforeEach
    void setUp() {
        notificacionTaller = new NotificacionTaller(1L, "BICICLETA_LISTA", "juan@correo.cl", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 5), true, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void guardarNotificacionTaller() {
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(notificacionTallerRepository.save(notificacionTaller)).thenReturn(notificacionTaller);

        NotificacionTaller resultado = notificacionTallerService.guardarNotificacionTaller(notificacionTaller);

        assertNotNull(resultado);
        assertEquals("juan@correo.cl", resultado.getDestinatario());
        verify(notificacionTallerRepository, times(1)).save(notificacionTaller);
    }

    @Test
    void guardarNotificacionTallerConOrdenTrabajoNoExistente() {
        notificacionTaller.setOrdenTrabajo(new OrdenTrabajo(99L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(ordenTrabajoRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> notificacionTallerService.guardarNotificacionTaller(notificacionTaller));

        assertEquals("OrdenTrabajo no encontrada con id: 99", ex.getMessage());
        verify(notificacionTallerRepository, never()).save(any(NotificacionTaller.class));
    }

    @Test
    void listarNotificacionesTaller() {
        NotificacionTaller otro = new NotificacionTaller(2L, "CAMBIO_ESTADO", "juan@correo.cl", "Tu bicicleta está en reparación. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 9, 5), true, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(notificacionTallerRepository.findAll()).thenReturn(Arrays.asList(notificacionTaller, otro));

        List<NotificacionTaller> resultado = notificacionTallerService.listarNotificacionesTaller();

        assertEquals(2, resultado.size());
        verify(notificacionTallerRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(notificacionTallerRepository.findById(1L)).thenReturn(Optional.of(notificacionTaller));

        Optional<NotificacionTaller> resultado = notificacionTallerService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals("juan@correo.cl", resultado.get().getDestinatario());
        verify(notificacionTallerRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(notificacionTallerRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<NotificacionTaller> resultado = notificacionTallerService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(notificacionTallerRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenTrabajoConResultados() {
        when(notificacionTallerRepository.findByOrdenTrabajoIdOrdenTrabajo(1L)).thenReturn(List.of(notificacionTaller));

        List<NotificacionTaller> resultado = notificacionTallerService.findByOrdenTrabajo(1L);

        assertEquals(1, resultado.size());
        verify(notificacionTallerRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(1L);
    }

    @Test
    void findByOrdenTrabajoSinResultados() {
        when(notificacionTallerRepository.findByOrdenTrabajoIdOrdenTrabajo(99L)).thenReturn(List.of());

        List<NotificacionTaller> resultado = notificacionTallerService.findByOrdenTrabajo(99L);

        assertTrue(resultado.isEmpty());
        verify(notificacionTallerRepository, times(1)).findByOrdenTrabajoIdOrdenTrabajo(99L);
    }

    @Test
    void actualizarNotificacionTallerExistente() {
        NotificacionTaller datos = new NotificacionTaller(null, "BICICLETA_LISTA", "912345678", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 10), false, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(notificacionTallerRepository.findById(1L)).thenReturn(Optional.of(notificacionTaller));
        when(ordenTrabajoRepository.findById(1L)).thenReturn(Optional.of(new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null)));
        when(notificacionTallerRepository.save(any(NotificacionTaller.class))).thenAnswer(inv -> inv.getArgument(0));

        NotificacionTaller resultado = notificacionTallerService.actualizarNotificacionTaller(1L, datos);

        assertEquals(1L, resultado.getIdNotificacionTaller());
        assertEquals("912345678", resultado.getDestinatario());
        verify(notificacionTallerRepository, times(1)).findById(1L);
        verify(notificacionTallerRepository, times(1)).save(notificacionTaller);
    }

    @Test
    void actualizarNotificacionTallerNoExistente() {
        when(notificacionTallerRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> notificacionTallerService.actualizarNotificacionTaller(99L, notificacionTaller));

        assertEquals("NotificacionTaller no encontrada con id: 99", ex.getMessage());
        verify(notificacionTallerRepository, times(1)).findById(99L);
        verify(notificacionTallerRepository, never()).save(any(NotificacionTaller.class));
    }

    @Test
    void eliminarNotificacionTaller() {
        notificacionTallerService.eliminarNotificacionTaller(1L);

        verify(notificacionTallerRepository, times(1)).deleteById(1L);
    }
}
