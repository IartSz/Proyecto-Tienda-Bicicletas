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

import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

@ExtendWith(MockitoExtension.class)
class RecepcionCompraServiceTest {

    @Mock
    private RecepcionCompraRepository recepcionCompraRepository;

    @Mock
    private OrdenCompraRepository ordenCompraRepository;

    @InjectMocks
    private RecepcionCompraService recepcionCompraService;

    private RecepcionCompra recepcionCompra;

    @BeforeEach
    void setUp() {
        recepcionCompra = new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
    }

    @Test
    void guardarRecepcionCompra() {
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(recepcionCompraRepository.save(recepcionCompra)).thenReturn(recepcionCompra);

        RecepcionCompra resultado = recepcionCompraService.guardarRecepcionCompra(recepcionCompra);

        assertNotNull(resultado);
        assertEquals("FAC-88123", resultado.getNumeroDocumento());
        verify(recepcionCompraRepository, times(1)).save(recepcionCompra);
    }

    @Test
    void guardarRecepcionCompraConOrdenCompraNoExistente() {
        recepcionCompra.setOrdenCompra(new OrdenCompra(99L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(ordenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> recepcionCompraService.guardarRecepcionCompra(recepcionCompra));

        assertEquals("OrdenCompra no encontrada con id: 99", ex.getMessage());
        verify(recepcionCompraRepository, never()).save(any(RecepcionCompra.class));
    }

    @Test
    void listarRecepcionesCompra() {
        RecepcionCompra otro = new RecepcionCompra(2L, LocalDateTime.of(2026, 10, 16, 9, 30), TipoDocumentoRecepcion.GUIA_DESPACHO, "GD-4410", null, 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraRepository.findAll()).thenReturn(Arrays.asList(recepcionCompra, otro));

        List<RecepcionCompra> resultado = recepcionCompraService.listarRecepcionesCompra();

        assertEquals(2, resultado.size());
        verify(recepcionCompraRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(recepcionCompra));

        Optional<RecepcionCompra> resultado = recepcionCompraService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals("FAC-88123", resultado.get().getNumeroDocumento());
        verify(recepcionCompraRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(recepcionCompraRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<RecepcionCompra> resultado = recepcionCompraService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(recepcionCompraRepository, times(1)).findById(99L);
    }

    @Test
    void findByOrdenCompraConResultados() {
        when(recepcionCompraRepository.findByOrdenCompraIdOrdenCompra(1L)).thenReturn(List.of(recepcionCompra));

        List<RecepcionCompra> resultado = recepcionCompraService.findByOrdenCompra(1L);

        assertEquals(1, resultado.size());
        verify(recepcionCompraRepository, times(1)).findByOrdenCompraIdOrdenCompra(1L);
    }

    @Test
    void findByOrdenCompraSinResultados() {
        when(recepcionCompraRepository.findByOrdenCompraIdOrdenCompra(99L)).thenReturn(List.of());

        List<RecepcionCompra> resultado = recepcionCompraService.findByOrdenCompra(99L);

        assertTrue(resultado.isEmpty());
        verify(recepcionCompraRepository, times(1)).findByOrdenCompraIdOrdenCompra(99L);
    }

    @Test
    void actualizarRecepcionCompraExistente() {
        RecepcionCompra datos = new RecepcionCompra(null, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88124", "Factura corregida", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(recepcionCompra));
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(recepcionCompraRepository.save(any(RecepcionCompra.class))).thenAnswer(inv -> inv.getArgument(0));

        RecepcionCompra resultado = recepcionCompraService.actualizarRecepcionCompra(1L, datos);

        assertEquals(1L, resultado.getIdRecepcionCompra());
        assertEquals("FAC-88124", resultado.getNumeroDocumento());
        verify(recepcionCompraRepository, times(1)).findById(1L);
        verify(recepcionCompraRepository, times(1)).save(recepcionCompra);
    }

    @Test
    void actualizarRecepcionCompraNoExistente() {
        when(recepcionCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> recepcionCompraService.actualizarRecepcionCompra(99L, recepcionCompra));

        assertEquals("RecepcionCompra no encontrada con id: 99", ex.getMessage());
        verify(recepcionCompraRepository, times(1)).findById(99L);
        verify(recepcionCompraRepository, never()).save(any(RecepcionCompra.class));
    }

    @Test
    void eliminarRecepcionCompra() {
        recepcionCompraService.eliminarRecepcionCompra(1L);

        verify(recepcionCompraRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarRecepcionCompraDeOrdenEnBorrador() {
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.BORRADOR, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> recepcionCompraService.guardarRecepcionCompra(recepcionCompra));

        assertEquals("Solo se puede recepcionar una orden enviada", ex.getMessage());
        verify(recepcionCompraRepository, never()).save(any(RecepcionCompra.class));
    }
}
