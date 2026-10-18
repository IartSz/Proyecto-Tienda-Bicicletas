package com.ridertapia.proveedores.service;

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

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;

@ExtendWith(MockitoExtension.class)
class DetalleOrdenCompraServiceTest {

    @Mock
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Mock
    private OrdenCompraRepository ordenCompraRepository;

    @InjectMocks
    private DetalleOrdenCompraService detalleOrdenCompraService;

    private DetalleOrdenCompra detalleOrdenCompra;

    @BeforeEach
    void setUp() {
        detalleOrdenCompra = new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
    }

    @Test
    void guardarDetalleOrdenCompra() {
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleOrdenCompraRepository.save(detalleOrdenCompra)).thenReturn(detalleOrdenCompra);

        DetalleOrdenCompra resultado = detalleOrdenCompraService.guardarDetalleOrdenCompra(detalleOrdenCompra);

        assertNotNull(resultado);
        assertEquals(520000, resultado.getCostoUnitario());
        verify(detalleOrdenCompraRepository, times(1)).save(detalleOrdenCompra);
    }

    @Test
    void guardarDetalleOrdenCompraConOrdenCompraNoExistente() {
        detalleOrdenCompra.setOrdenCompra(new OrdenCompra(99L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(ordenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> detalleOrdenCompraService.guardarDetalleOrdenCompra(detalleOrdenCompra));

        assertEquals("OrdenCompra no encontrada con id: 99", ex.getMessage());
        verify(detalleOrdenCompraRepository, never()).save(any(DetalleOrdenCompra.class));
    }

    @Test
    void listarDetallesOrdenCompra() {
        DetalleOrdenCompra otro = new DetalleOrdenCompra(2L, 20L, 10, 0, 9500, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(detalleOrdenCompraRepository.findAll()).thenReturn(Arrays.asList(detalleOrdenCompra, otro));

        List<DetalleOrdenCompra> resultado = detalleOrdenCompraService.listarDetallesOrdenCompra();

        assertEquals(2, resultado.size());
        verify(detalleOrdenCompraRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(detalleOrdenCompra));

        Optional<DetalleOrdenCompra> resultado = detalleOrdenCompraService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(520000, resultado.get().getCostoUnitario());
        verify(detalleOrdenCompraRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(detalleOrdenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<DetalleOrdenCompra> resultado = detalleOrdenCompraService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(detalleOrdenCompraRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenCompraConResultados() {
        when(detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(1L)).thenReturn(List.of(detalleOrdenCompra));

        List<DetalleOrdenCompra> resultado = detalleOrdenCompraService.findByOrdenCompra(1L);

        assertEquals(1, resultado.size());
        verify(detalleOrdenCompraRepository, times(1)).findByOrdenCompraIdOrdenCompra(1L);
    }

    @Test
    void findByOrdenCompraSinResultados() {
        when(detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(99L)).thenReturn(List.of());

        List<DetalleOrdenCompra> resultado = detalleOrdenCompraService.findByOrdenCompra(99L);

        assertTrue(resultado.isEmpty());
        verify(detalleOrdenCompraRepository, times(1)).findByOrdenCompraIdOrdenCompra(99L);
    }

    @Test
    void actualizarDetalleOrdenCompraExistente() {
        DetalleOrdenCompra datos = new DetalleOrdenCompra(null, 10L, 2, 0, 505000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(detalleOrdenCompra));
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleOrdenCompraRepository.save(any(DetalleOrdenCompra.class))).thenAnswer(inv -> inv.getArgument(0));

        DetalleOrdenCompra resultado = detalleOrdenCompraService.actualizarDetalleOrdenCompra(1L, datos);

        assertEquals(1L, resultado.getIdDetalleOrdenCompra());
        assertEquals(505000, resultado.getCostoUnitario());
        verify(detalleOrdenCompraRepository, times(1)).findById(1L);
        verify(detalleOrdenCompraRepository, times(1)).save(detalleOrdenCompra);
    }

    @Test
    void actualizarDetalleOrdenCompraNoExistente() {
        when(detalleOrdenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> detalleOrdenCompraService.actualizarDetalleOrdenCompra(99L, detalleOrdenCompra));

        assertEquals("DetalleOrdenCompra no encontrado con id: 99", ex.getMessage());
        verify(detalleOrdenCompraRepository, times(1)).findById(99L);
        verify(detalleOrdenCompraRepository, never()).save(any(DetalleOrdenCompra.class));
    }

    @Test
    void eliminarDetalleOrdenCompra() {
        detalleOrdenCompraService.eliminarDetalleOrdenCompra(1L);

        verify(detalleOrdenCompraRepository, times(1)).deleteById(1L);
    }
}
