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
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@ExtendWith(MockitoExtension.class)
class OrdenCompraServiceTest {

    @Mock
    private OrdenCompraRepository ordenCompraRepository;

    @Mock
    private ProveedorRepository proveedorRepository;

    @InjectMocks
    private OrdenCompraService ordenCompraService;

    private OrdenCompra ordenCompra;

    @BeforeEach
    void setUp() {
        ordenCompra = new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
    }

    @Test
    void guardarOrdenCompra() {
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(ordenCompraRepository.save(ordenCompra)).thenReturn(ordenCompra);

        OrdenCompra resultado = ordenCompraService.guardarOrdenCompra(ordenCompra);

        assertNotNull(resultado);
        assertEquals(1237600, resultado.getTotal());
        verify(ordenCompraRepository, times(1)).save(ordenCompra);
    }

    @Test
    void guardarOrdenCompraConProveedorNoExistente() {
        ordenCompra.setProveedor(new Proveedor(99L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> ordenCompraService.guardarOrdenCompra(ordenCompra));

        assertEquals("Proveedor no encontrado con id: 99", ex.getMessage());
        verify(ordenCompraRepository, never()).save(any(OrdenCompra.class));
    }

    @Test
    void listarOrdenesCompra() {
        OrdenCompra otro = new OrdenCompra(2L, "OC-00002", LocalDateTime.of(2026, 10, 8, 10, 0), null, EstadoOrdenCompra.BORRADOR, 95000, 18050, 113050, null, 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(ordenCompraRepository.findAll()).thenReturn(Arrays.asList(ordenCompra, otro));

        List<OrdenCompra> resultado = ordenCompraService.listarOrdenesCompra();

        assertEquals(2, resultado.size());
        verify(ordenCompraRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(ordenCompra));

        Optional<OrdenCompra> resultado = ordenCompraService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(1237600, resultado.get().getTotal());
        verify(ordenCompraRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(ordenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<OrdenCompra> resultado = ordenCompraService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(ordenCompraRepository, times(1)).findById(99L);
    }

    @Test
    void findByProveedorConResultados() {
        when(ordenCompraRepository.findByProveedorIdProveedor(1L)).thenReturn(List.of(ordenCompra));

        List<OrdenCompra> resultado = ordenCompraService.findByProveedor(1L);

        assertEquals(1, resultado.size());
        verify(ordenCompraRepository, times(1)).findByProveedorIdProveedor(1L);
    }

    @Test
    void findByProveedorSinResultados() {
        when(ordenCompraRepository.findByProveedorIdProveedor(99L)).thenReturn(List.of());

        List<OrdenCompra> resultado = ordenCompraService.findByProveedor(99L);

        assertTrue(resultado.isEmpty());
        verify(ordenCompraRepository, times(1)).findByProveedorIdProveedor(99L);
    }

    @Test
    void findByEstadoConResultados() {
        when(ordenCompraRepository.findByEstado(EstadoOrdenCompra.ENVIADA)).thenReturn(List.of(ordenCompra));

        List<OrdenCompra> resultado = ordenCompraService.findByEstado(EstadoOrdenCompra.ENVIADA);

        assertEquals(1, resultado.size());
        verify(ordenCompraRepository, times(1)).findByEstado(EstadoOrdenCompra.ENVIADA);
    }

    @Test
    void actualizarOrdenCompraExistente() {
        OrdenCompra datos = new OrdenCompra(null, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 16), EstadoOrdenCompra.ENVIADA, 1010000, 191900, 1201900, "Reposición con precio ajustado", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(ordenCompraRepository.findById(1L)).thenReturn(Optional.of(ordenCompra));
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(ordenCompraRepository.save(any(OrdenCompra.class))).thenAnswer(inv -> inv.getArgument(0));

        OrdenCompra resultado = ordenCompraService.actualizarOrdenCompra(1L, datos);

        assertEquals(1L, resultado.getIdOrdenCompra());
        assertEquals(1201900, resultado.getTotal());
        verify(ordenCompraRepository, times(1)).findById(1L);
        verify(ordenCompraRepository, times(1)).save(ordenCompra);
    }

    @Test
    void actualizarOrdenCompraNoExistente() {
        when(ordenCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> ordenCompraService.actualizarOrdenCompra(99L, ordenCompra));

        assertEquals("OrdenCompra no encontrada con id: 99", ex.getMessage());
        verify(ordenCompraRepository, times(1)).findById(99L);
        verify(ordenCompraRepository, never()).save(any(OrdenCompra.class));
    }

    @Test
    void eliminarOrdenCompra() {
        ordenCompraService.eliminarOrdenCompra(1L);

        verify(ordenCompraRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarOrdenCompraGeneraNumeroYCalculaIva() {
        ordenCompra.setIdOrdenCompra(null);
        ordenCompra.setNumero(null);
        ordenCompra.setEstado(null);
        ordenCompra.setMontoNeto(100000);
        ordenCompra.setIva(null);
        ordenCompra.setTotal(null);
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(ordenCompraRepository.save(any(OrdenCompra.class))).thenAnswer(inv -> {
            OrdenCompra o = inv.getArgument(0);
            o.setIdOrdenCompra(4L);
            return o;
        });

        OrdenCompra resultado = ordenCompraService.guardarOrdenCompra(ordenCompra);

        assertEquals("OC-00004", resultado.getNumero());
        assertEquals(EstadoOrdenCompra.BORRADOR, resultado.getEstado());
        assertEquals(19000, resultado.getIva());
        assertEquals(119000, resultado.getTotal());
        verify(ordenCompraRepository, times(2)).save(any(OrdenCompra.class));
    }
}
