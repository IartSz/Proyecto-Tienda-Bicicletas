package com.ridertapia.proveedores.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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

import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@ExtendWith(MockitoExtension.class)
class ProveedorServiceTest {

    @Mock
    private ProveedorRepository proveedorRepository;

    @InjectMocks
    private ProveedorService proveedorService;

    private Proveedor proveedor;

    @BeforeEach
    void setUp() {
        proveedor = new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true);
    }

    @Test
    void guardarProveedor() {
        when(proveedorRepository.save(proveedor)).thenReturn(proveedor);

        Proveedor resultado = proveedorService.guardarProveedor(proveedor);

        assertNotNull(resultado);
        assertEquals("223456789", resultado.getTelefono());
        verify(proveedorRepository, times(1)).save(proveedor);
    }

    @Test
    void listarProveedores() {
        Proveedor otro = new Proveedor(2L, "77987654-3", "Importadora Ruedas del Sur Ltda.", null, null, "contacto@ruedasdelsur.cl", "412345678", "Calle Colo Colo 456", "Concepción", null, true);
        when(proveedorRepository.findAll()).thenReturn(Arrays.asList(proveedor, otro));

        List<Proveedor> resultado = proveedorService.listarProveedores();

        assertEquals(2, resultado.size());
        verify(proveedorRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(proveedor));

        Optional<Proveedor> resultado = proveedorService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals("223456789", resultado.get().getTelefono());
        verify(proveedorRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Proveedor> resultado = proveedorService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(proveedorRepository, times(1)).findById(99L);
    }

    @Test
    void findByRutExistente() {
        when(proveedorRepository.findByRut("76123456-7")).thenReturn(Optional.of(proveedor));

        Proveedor resultado = proveedorService.findByRut("76123456-7");

        assertNotNull(resultado);
        assertEquals(1L, resultado.getIdProveedor());
        verify(proveedorRepository, times(1)).findByRut("76123456-7");
    }

    @Test
    void findByRutNoExistente() {
        when(proveedorRepository.findByRut("no-existe")).thenReturn(Optional.empty());

        Proveedor resultado = proveedorService.findByRut("no-existe");

        assertNull(resultado);
        verify(proveedorRepository, times(1)).findByRut("no-existe");
    }

    @Test
    void actualizarProveedorExistente() {
        Proveedor datos = new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "229998877", "Av. Vicuña Mackenna 1500", "Santiago", "Pedro Rojas", false);
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(proveedor));
        when(proveedorRepository.save(any(Proveedor.class))).thenAnswer(inv -> inv.getArgument(0));

        Proveedor resultado = proveedorService.actualizarProveedor(1L, datos);

        assertEquals(1L, resultado.getIdProveedor());
        assertEquals("229998877", resultado.getTelefono());
        verify(proveedorRepository, times(1)).findById(1L);
        verify(proveedorRepository, times(1)).save(proveedor);
    }

    @Test
    void actualizarProveedorNoExistente() {
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> proveedorService.actualizarProveedor(99L, proveedor));

        assertEquals("Proveedor no encontrado con id: 99", ex.getMessage());
        verify(proveedorRepository, times(1)).findById(99L);
        verify(proveedorRepository, never()).save(any(Proveedor.class));
    }

    @Test
    void eliminarProveedor() {
        proveedorService.eliminarProveedor(1L);

        verify(proveedorRepository, times(1)).deleteById(1L);
    }
}
