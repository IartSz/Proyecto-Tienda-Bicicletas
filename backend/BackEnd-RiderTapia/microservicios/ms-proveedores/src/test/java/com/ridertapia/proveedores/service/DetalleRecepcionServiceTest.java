package com.ridertapia.proveedores.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.DetalleRecepcion;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.DetalleRecepcionRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

@ExtendWith(MockitoExtension.class)
class DetalleRecepcionServiceTest {

    @Mock
    private DetalleRecepcionRepository detalleRecepcionRepository;

    @Mock
    private RecepcionCompraRepository recepcionCompraRepository;

    @Mock
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Mock
    private OrdenCompraRepository ordenCompraRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private DetalleRecepcionService detalleRecepcionService;

    private static final String ITEMS_URL = "http://localhost:9008/api/v1/items-inventario";

    private static final String INGRESOS_URL = "http://localhost:9008/api/v1/ingresos";

    private DetalleRecepcion detalleRecepcion;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(detalleRecepcionService, "itemsInventarioUrl", ITEMS_URL);
        ReflectionTestUtils.setField(detalleRecepcionService, "ingresosUrl", INGRESOS_URL);
        detalleRecepcion = new DetalleRecepcion(1L, 1, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
    }

    @Test
    void guardarDetalleRecepcion() {
        DetalleOrdenCompra detalleOrden = new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(detalleOrden));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/10"), Map.class)).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 10, "stockDisponible", 3, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 500000, "idProveedores", List.of(1))));
        when(detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(1L)).thenReturn(List.of(detalleOrden));
        when(detalleRecepcionRepository.save(detalleRecepcion)).thenReturn(detalleRecepcion);

        DetalleRecepcion resultado = detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion);

        assertNotNull(resultado);
        assertEquals(1, resultado.getCantidadRecibida());
        assertEquals(1, detalleOrden.getCantidadRecibida());
        verify(detalleRecepcionRepository, times(1)).save(detalleRecepcion);
        ArgumentCaptor<OrdenCompra> orden = ArgumentCaptor.forClass(OrdenCompra.class);
        verify(ordenCompraRepository, times(1)).save(orden.capture());
        assertEquals(EstadoOrdenCompra.RECIBIDA_PARCIAL, orden.getValue().getEstado());
        ArgumentCaptor<Map> itemActualizado = ArgumentCaptor.forClass(Map.class);
        verify(restTemplate, times(1)).put(eq(URI.create(ITEMS_URL + "/5")), itemActualizado.capture());
        assertEquals(4, itemActualizado.getValue().get("stockDisponible"));
        verify(restTemplate, times(1)).postForEntity(eq(URI.create(INGRESOS_URL)), any(Map.class), eq(String.class));
    }

    @Test
    void guardarDetalleRecepcionConRecepcionCompraNoExistente() {
        detalleRecepcion.setRecepcionCompra(new RecepcionCompra(99L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(recepcionCompraRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion));

        assertEquals("RecepcionCompra no encontrada con id: 99", ex.getMessage());
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
    }

    @Test
    void listarDetallesRecepcion() {
        DetalleRecepcion otro = new DetalleRecepcion(2L, 1, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleRecepcionRepository.findAll()).thenReturn(Arrays.asList(detalleRecepcion, otro));

        List<DetalleRecepcion> resultado = detalleRecepcionService.listarDetallesRecepcion();

        assertEquals(2, resultado.size());
        verify(detalleRecepcionRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(detalleRecepcionRepository.findById(1L)).thenReturn(Optional.of(detalleRecepcion));

        Optional<DetalleRecepcion> resultado = detalleRecepcionService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(1, resultado.get().getCantidadRecibida());
        verify(detalleRecepcionRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(detalleRecepcionRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<DetalleRecepcion> resultado = detalleRecepcionService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(detalleRecepcionRepository, times(1)).findById(99L);
    }

    @Test
    void findByRecepcionCompraConResultados() {
        when(detalleRecepcionRepository.findByRecepcionCompraIdRecepcionCompra(1L)).thenReturn(List.of(detalleRecepcion));

        List<DetalleRecepcion> resultado = detalleRecepcionService.findByRecepcionCompra(1L);

        assertEquals(1, resultado.size());
        verify(detalleRecepcionRepository, times(1)).findByRecepcionCompraIdRecepcionCompra(1L);
    }

    @Test
    void findByRecepcionCompraSinResultados() {
        when(detalleRecepcionRepository.findByRecepcionCompraIdRecepcionCompra(99L)).thenReturn(List.of());

        List<DetalleRecepcion> resultado = detalleRecepcionService.findByRecepcionCompra(99L);

        assertTrue(resultado.isEmpty());
        verify(detalleRecepcionRepository, times(1)).findByRecepcionCompraIdRecepcionCompra(99L);
    }

    @Test
    void actualizarDetalleRecepcionExistente() {
        DetalleRecepcion datos = new DetalleRecepcion(null, 2, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleRecepcionRepository.findById(1L)).thenReturn(Optional.of(detalleRecepcion));
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleRecepcionRepository.save(any(DetalleRecepcion.class))).thenAnswer(inv -> inv.getArgument(0));

        DetalleRecepcion resultado = detalleRecepcionService.actualizarDetalleRecepcion(1L, datos);

        assertEquals(1L, resultado.getIdDetalleRecepcion());
        assertEquals(2, resultado.getCantidadRecibida());
        verify(detalleRecepcionRepository, times(1)).findById(1L);
        verify(detalleRecepcionRepository, times(1)).save(detalleRecepcion);
    }

    @Test
    void actualizarDetalleRecepcionNoExistente() {
        when(detalleRecepcionRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> detalleRecepcionService.actualizarDetalleRecepcion(99L, detalleRecepcion));

        assertEquals("DetalleRecepcion no encontrado con id: 99", ex.getMessage());
        verify(detalleRecepcionRepository, times(1)).findById(99L);
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
    }

    @Test
    void eliminarDetalleRecepcion() {
        detalleRecepcionService.eliminarDetalleRecepcion(1L);

        verify(detalleRecepcionRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarDetalleRecepcionCompletaLaOrden() {
        detalleRecepcion.setCantidadRecibida(2);
        DetalleOrdenCompra detalleOrden = new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(detalleOrden));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/10"), Map.class)).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 10, "stockDisponible", 3, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 500000, "idProveedores", List.of(1))));
        when(detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(1L)).thenReturn(List.of(detalleOrden));
        when(detalleRecepcionRepository.save(detalleRecepcion)).thenReturn(detalleRecepcion);

        detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion);

        assertEquals(2, detalleOrden.getCantidadRecibida());
        ArgumentCaptor<OrdenCompra> orden = ArgumentCaptor.forClass(OrdenCompra.class);
        verify(ordenCompraRepository, times(1)).save(orden.capture());
        assertEquals(EstadoOrdenCompra.RECIBIDA, orden.getValue().getEstado());
    }

    @Test
    void guardarDetalleRecepcionMayorAlPendiente() {
        detalleRecepcion.setCantidadRecibida(3);
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion));

        assertEquals("Se está recibiendo más de lo pendiente. Pendiente: 2", ex.getMessage());
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
        verify(restTemplate, never()).put(any(URI.class), any());
    }

    @Test
    void guardarDetalleRecepcionConCantidadNoValida() {
        detalleRecepcion.setCantidadRecibida(0);
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion));

        assertEquals("La cantidad recibida debe ser mayor a 0", ex.getMessage());
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
    }

    @Test
    void guardarDetalleRecepcionDeOtraOrden() {
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(2L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion));

        assertEquals("El producto no pertenece a la orden de compra recepcionada", ex.getMessage());
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
    }

    @Test
    void guardarDetalleRecepcionSinInventario() {
        when(recepcionCompraRepository.findById(1L)).thenReturn(Optional.of(new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(detalleOrdenCompraRepository.findById(1L)).thenReturn(Optional.of(new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)))));
        when(restTemplate.getForObject(URI.create(ITEMS_URL + "/idVariante/10"), Map.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion));

        assertEquals("Inventario no encontrado para la variante con id: 10", ex.getMessage());
        verify(detalleRecepcionRepository, never()).save(any(DetalleRecepcion.class));
    }
}
