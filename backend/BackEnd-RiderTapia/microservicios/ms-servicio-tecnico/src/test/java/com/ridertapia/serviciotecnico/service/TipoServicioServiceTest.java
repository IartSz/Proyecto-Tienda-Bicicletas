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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@ExtendWith(MockitoExtension.class)
class TipoServicioServiceTest {

    @Mock
    private TipoServicioRepository tipoServicioRepository;

    @InjectMocks
    private TipoServicioService tipoServicioService;

    private TipoServicio tipoServicio;

    @BeforeEach
    void setUp() {
        tipoServicio = new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true);
    }

    @Test
    void guardarTipoServicio() {
        when(tipoServicioRepository.save(tipoServicio)).thenReturn(tipoServicio);

        TipoServicio resultado = tipoServicioService.guardarTipoServicio(tipoServicio);

        assertNotNull(resultado);
        assertEquals(25000, resultado.getPrecio());
        verify(tipoServicioRepository, times(1)).save(tipoServicio);
    }

    @Test
    void listarTiposServicio() {
        TipoServicio otro = new TipoServicio(2L, "Mantención mediana", NivelServicio.MEDIANO, "Básica más limpieza de transmisión", "Todo lo de la básica, limpieza profunda de transmisión y centrado de ruedas", 45000, 2, true);
        when(tipoServicioRepository.findAll()).thenReturn(Arrays.asList(tipoServicio, otro));

        List<TipoServicio> resultado = tipoServicioService.listarTiposServicio();

        assertEquals(2, resultado.size());
        verify(tipoServicioRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(tipoServicio));

        Optional<TipoServicio> resultado = tipoServicioService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(25000, resultado.get().getPrecio());
        verify(tipoServicioRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(tipoServicioRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<TipoServicio> resultado = tipoServicioService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(tipoServicioRepository, times(1)).findById(99L);
    }

    @Test
    void findByNivelConResultados() {
        when(tipoServicioRepository.findByNivel(NivelServicio.BASICO)).thenReturn(List.of(tipoServicio));

        List<TipoServicio> resultado = tipoServicioService.findByNivel(NivelServicio.BASICO);

        assertEquals(1, resultado.size());
        verify(tipoServicioRepository, times(1)).findByNivel(NivelServicio.BASICO);
    }

    @Test
    void actualizarTipoServicioExistente() {
        TipoServicio datos = new TipoServicio(null, "Mantención full", NivelServicio.FULL, "Desarme completo de la bicicleta", "Desarme completo, limpieza y engrase de rodamientos y purga de frenos", 90000, 4, true);
        when(tipoServicioRepository.findById(1L)).thenReturn(Optional.of(tipoServicio));
        when(tipoServicioRepository.save(any(TipoServicio.class))).thenAnswer(inv -> inv.getArgument(0));

        TipoServicio resultado = tipoServicioService.actualizarTipoServicio(1L, datos);

        assertEquals(1L, resultado.getIdTipoServicio());
        assertEquals(90000, resultado.getPrecio());
        verify(tipoServicioRepository, times(1)).findById(1L);
        verify(tipoServicioRepository, times(1)).save(tipoServicio);
    }

    @Test
    void actualizarTipoServicioNoExistente() {
        when(tipoServicioRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> tipoServicioService.actualizarTipoServicio(99L, tipoServicio));

        assertEquals("TipoServicio no encontrado con id: 99", ex.getMessage());
        verify(tipoServicioRepository, times(1)).findById(99L);
        verify(tipoServicioRepository, never()).save(any(TipoServicio.class));
    }

    @Test
    void eliminarTipoServicio() {
        tipoServicioService.eliminarTipoServicio(1L);

        verify(tipoServicioRepository, times(1)).deleteById(1L);
    }
}
