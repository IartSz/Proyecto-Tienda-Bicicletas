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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;

@ExtendWith(MockitoExtension.class)
class BicicletaServiceTest {

    @Mock
    private BicicletaRepository bicicletaRepository;

    @InjectMocks
    private BicicletaService bicicletaService;

    private Bicicleta bicicleta;

    @BeforeEach
    void setUp() {
        bicicleta = new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5");
    }

    @Test
    void guardarBicicleta() {
        when(bicicletaRepository.save(bicicleta)).thenReturn(bicicleta);

        Bicicleta resultado = bicicletaService.guardarBicicleta(bicicleta);

        assertNotNull(resultado);
        assertEquals("Rojo", resultado.getColor());
        verify(bicicletaRepository, times(1)).save(bicicleta);
    }

    @Test
    void listarBicicletas() {
        Bicicleta otro = new Bicicleta(2L, "Specialized", "Allez", TipoBicicleta.RUTA, "700c", "Negro", "WSB654321", "12345678-5");
        when(bicicletaRepository.findAll()).thenReturn(Arrays.asList(bicicleta, otro));

        List<Bicicleta> resultado = bicicletaService.listarBicicletas();

        assertEquals(2, resultado.size());
        verify(bicicletaRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(bicicleta));

        Optional<Bicicleta> resultado = bicicletaService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals("Rojo", resultado.get().getColor());
        verify(bicicletaRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(bicicletaRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Bicicleta> resultado = bicicletaService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(bicicletaRepository, times(1)).findById(99L);
    }

    @Test
    void findByRutClienteConResultados() {
        when(bicicletaRepository.findByRutCliente("12345678-5")).thenReturn(List.of(bicicleta));

        List<Bicicleta> resultado = bicicletaService.findByRutCliente("12345678-5");

        assertEquals(1, resultado.size());
        verify(bicicletaRepository, times(1)).findByRutCliente("12345678-5");
    }

    @Test
    void findByRutClienteSinResultados() {
        when(bicicletaRepository.findByRutCliente("no-existe")).thenReturn(List.of());

        List<Bicicleta> resultado = bicicletaService.findByRutCliente("no-existe");

        assertTrue(resultado.isEmpty());
        verify(bicicletaRepository, times(1)).findByRutCliente("no-existe");
    }

    @Test
    void actualizarBicicletaExistente() {
        Bicicleta datos = new Bicicleta(null, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Azul", "WTU123456", "12345678-5");
        when(bicicletaRepository.findById(1L)).thenReturn(Optional.of(bicicleta));
        when(bicicletaRepository.save(any(Bicicleta.class))).thenAnswer(inv -> inv.getArgument(0));

        Bicicleta resultado = bicicletaService.actualizarBicicleta(1L, datos);

        assertEquals(1L, resultado.getIdBicicleta());
        assertEquals("Azul", resultado.getColor());
        verify(bicicletaRepository, times(1)).findById(1L);
        verify(bicicletaRepository, times(1)).save(bicicleta);
    }

    @Test
    void actualizarBicicletaNoExistente() {
        when(bicicletaRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> bicicletaService.actualizarBicicleta(99L, bicicleta));

        assertEquals("Bicicleta no encontrada con id: 99", ex.getMessage());
        verify(bicicletaRepository, times(1)).findById(99L);
        verify(bicicletaRepository, never()).save(any(Bicicleta.class));
    }

    @Test
    void eliminarBicicleta() {
        bicicletaService.eliminarBicicleta(1L);

        verify(bicicletaRepository, times(1)).deleteById(1L);
    }
}
