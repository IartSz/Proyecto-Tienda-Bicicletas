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

import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.FotoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.FotoSolicitudRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;

@ExtendWith(MockitoExtension.class)
class FotoSolicitudServiceTest {

    @Mock
    private FotoSolicitudRepository fotoSolicitudRepository;

    @Mock
    private SolicitudServicioRepository solicitudServicioRepository;

    @InjectMocks
    private FotoSolicitudService fotoSolicitudService;

    private FotoSolicitud fotoSolicitud;

    @BeforeEach
    void setUp() {
        fotoSolicitud = new FotoSolicitud(1L, "https://ridertapia.cl/fotos/solicitud-1-a.jpg", "jpg", 850, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
    }

    @Test
    void guardarFotoSolicitud() {
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true))));
        when(fotoSolicitudRepository.save(fotoSolicitud)).thenReturn(fotoSolicitud);

        FotoSolicitud resultado = fotoSolicitudService.guardarFotoSolicitud(fotoSolicitud);

        assertNotNull(resultado);
        assertEquals(850, resultado.getTamanoKb());
        verify(fotoSolicitudRepository, times(1)).save(fotoSolicitud);
    }

    @Test
    void guardarFotoSolicitudConSolicitudServicioNoExistente() {
        fotoSolicitud.setSolicitudServicio(new SolicitudServicio(99L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(solicitudServicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> fotoSolicitudService.guardarFotoSolicitud(fotoSolicitud));

        assertEquals("SolicitudServicio no encontrada con id: 99", ex.getMessage());
        verify(fotoSolicitudRepository, never()).save(any(FotoSolicitud.class));
    }

    @Test
    void listarFotosSolicitud() {
        FotoSolicitud otro = new FotoSolicitud(2L, "https://ridertapia.cl/fotos/solicitud-1-b.png", "png", 1200, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(fotoSolicitudRepository.findAll()).thenReturn(Arrays.asList(fotoSolicitud, otro));

        List<FotoSolicitud> resultado = fotoSolicitudService.listarFotosSolicitud();

        assertEquals(2, resultado.size());
        verify(fotoSolicitudRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(fotoSolicitudRepository.findById(1L)).thenReturn(Optional.of(fotoSolicitud));

        Optional<FotoSolicitud> resultado = fotoSolicitudService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(850, resultado.get().getTamanoKb());
        verify(fotoSolicitudRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(fotoSolicitudRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<FotoSolicitud> resultado = fotoSolicitudService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(fotoSolicitudRepository, times(1)).findById(99L);
    }

    @Test
    void findBySolicitudServicioConResultados() {
        when(fotoSolicitudRepository.findBySolicitudServicioIdSolicitudServicio(1L)).thenReturn(List.of(fotoSolicitud));

        List<FotoSolicitud> resultado = fotoSolicitudService.findBySolicitudServicio(1L);

        assertEquals(1, resultado.size());
        verify(fotoSolicitudRepository, times(1)).findBySolicitudServicioIdSolicitudServicio(1L);
    }

    @Test
    void findBySolicitudServicioSinResultados() {
        when(fotoSolicitudRepository.findBySolicitudServicioIdSolicitudServicio(99L)).thenReturn(List.of());

        List<FotoSolicitud> resultado = fotoSolicitudService.findBySolicitudServicio(99L);

        assertTrue(resultado.isEmpty());
        verify(fotoSolicitudRepository, times(1)).findBySolicitudServicioIdSolicitudServicio(99L);
    }

    @Test
    void actualizarFotoSolicitudExistente() {
        FotoSolicitud datos = new FotoSolicitud(null, "https://ridertapia.cl/fotos/solicitud-1-c.webp", "webp", 640, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(fotoSolicitudRepository.findById(1L)).thenReturn(Optional.of(fotoSolicitud));
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true))));
        when(fotoSolicitudRepository.save(any(FotoSolicitud.class))).thenAnswer(inv -> inv.getArgument(0));

        FotoSolicitud resultado = fotoSolicitudService.actualizarFotoSolicitud(1L, datos);

        assertEquals(1L, resultado.getIdFotoSolicitud());
        assertEquals(640, resultado.getTamanoKb());
        verify(fotoSolicitudRepository, times(1)).findById(1L);
        verify(fotoSolicitudRepository, times(1)).save(fotoSolicitud);
    }

    @Test
    void actualizarFotoSolicitudNoExistente() {
        when(fotoSolicitudRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> fotoSolicitudService.actualizarFotoSolicitud(99L, fotoSolicitud));

        assertEquals("FotoSolicitud no encontrada con id: 99", ex.getMessage());
        verify(fotoSolicitudRepository, times(1)).findById(99L);
        verify(fotoSolicitudRepository, never()).save(any(FotoSolicitud.class));
    }

    @Test
    void eliminarFotoSolicitud() {
        fotoSolicitudService.eliminarFotoSolicitud(1L);

        verify(fotoSolicitudRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarFotoSolicitudConFormatoNoPermitido() {
        fotoSolicitud.setFormato("gif");
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true))));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> fotoSolicitudService.guardarFotoSolicitud(fotoSolicitud));

        assertEquals("Formato no permitido. Usa jpg, jpeg, png o webp", ex.getMessage());
        verify(fotoSolicitudRepository, never()).save(any(FotoSolicitud.class));
    }

    @Test
    void guardarFotoSolicitudMuyGrande() {
        fotoSolicitud.setTamanoKb(6000);
        when(solicitudServicioRepository.findById(1L)).thenReturn(Optional.of(new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true))));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> fotoSolicitudService.guardarFotoSolicitud(fotoSolicitud));

        assertEquals("La imagen no puede superar los 5 MB", ex.getMessage());
        verify(fotoSolicitudRepository, never()).save(any(FotoSolicitud.class));
    }
}
