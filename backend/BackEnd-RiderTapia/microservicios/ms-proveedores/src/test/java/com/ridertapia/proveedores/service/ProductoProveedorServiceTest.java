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

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.proveedores.model.ProductoProveedor;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProductoProveedorRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@ExtendWith(MockitoExtension.class)
class ProductoProveedorServiceTest {

    @Mock
    private ProductoProveedorRepository productoProveedorRepository;

    @Mock
    private ProveedorRepository proveedorRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private ProductoProveedorService productoProveedorService;

    private static final String VARIANTES_URL = "http://localhost:9005/api/v1/variantes";

    private ProductoProveedor productoProveedor;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(productoProveedorService, "varianteUrl", VARIANTES_URL);
        productoProveedor = new ProductoProveedor(1L, 10L, "AB-MAR7-29", 520000, 7, true, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
    }

    @Test
    void guardarProductoProveedor() {
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(restTemplate.getForEntity(URI.create(VARIANTES_URL + "/10"), String.class))
                .thenReturn(ResponseEntity.ok("{}"));
        when(productoProveedorRepository.save(productoProveedor)).thenReturn(productoProveedor);

        ProductoProveedor resultado = productoProveedorService.guardarProductoProveedor(productoProveedor);

        assertNotNull(resultado);
        assertEquals(520000, resultado.getCostoUnitario());
        verify(productoProveedorRepository, times(1)).save(productoProveedor);
    }

    @Test
    void guardarProductoProveedorConProveedorNoExistente() {
        productoProveedor.setProveedor(new Proveedor(99L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(proveedorRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productoProveedorService.guardarProductoProveedor(productoProveedor));

        assertEquals("Proveedor no encontrado con id: 99", ex.getMessage());
        verify(productoProveedorRepository, never()).save(any(ProductoProveedor.class));
    }

    @Test
    void listarProductosProveedor() {
        ProductoProveedor otro = new ProductoProveedor(2L, 20L, "AB-PAST-SH", 9500, 3, false, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(productoProveedorRepository.findAll()).thenReturn(Arrays.asList(productoProveedor, otro));

        List<ProductoProveedor> resultado = productoProveedorService.listarProductosProveedor();

        assertEquals(2, resultado.size());
        verify(productoProveedorRepository, times(1)).findAll();
    }

    @Test
    void findByIdExistente() {
        when(productoProveedorRepository.findById(1L)).thenReturn(Optional.of(productoProveedor));

        Optional<ProductoProveedor> resultado = productoProveedorService.findById(1L);

        assertTrue(resultado.isPresent());
        assertEquals(520000, resultado.get().getCostoUnitario());
        verify(productoProveedorRepository, times(1)).findById(1L);
    }

    @Test
    void findByIdNoExistente() {
        when(productoProveedorRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<ProductoProveedor> resultado = productoProveedorService.findById(99L);

        assertTrue(resultado.isEmpty());
        verify(productoProveedorRepository, times(1)).findById(99L);
    }

    @Test
    void findByIdVarianteConResultados() {
        when(productoProveedorRepository.findByIdVariante(10L)).thenReturn(List.of(productoProveedor));

        List<ProductoProveedor> resultado = productoProveedorService.findByIdVariante(10L);

        assertEquals(1, resultado.size());
        verify(productoProveedorRepository, times(1)).findByIdVariante(10L);
    }

    @Test
    void findByIdVarianteSinResultados() {
        when(productoProveedorRepository.findByIdVariante(99L)).thenReturn(List.of());

        List<ProductoProveedor> resultado = productoProveedorService.findByIdVariante(99L);

        assertTrue(resultado.isEmpty());
        verify(productoProveedorRepository, times(1)).findByIdVariante(99L);
    }

    @Test
    void findByProveedorConResultados() {
        when(productoProveedorRepository.findByProveedorIdProveedor(1L)).thenReturn(List.of(productoProveedor));

        List<ProductoProveedor> resultado = productoProveedorService.findByProveedor(1L);

        assertEquals(1, resultado.size());
        verify(productoProveedorRepository, times(1)).findByProveedorIdProveedor(1L);
    }

    @Test
    void findByProveedorSinResultados() {
        when(productoProveedorRepository.findByProveedorIdProveedor(99L)).thenReturn(List.of());

        List<ProductoProveedor> resultado = productoProveedorService.findByProveedor(99L);

        assertTrue(resultado.isEmpty());
        verify(productoProveedorRepository, times(1)).findByProveedorIdProveedor(99L);
    }

    @Test
    void actualizarProductoProveedorExistente() {
        ProductoProveedor datos = new ProductoProveedor(null, 10L, "AB-MAR7-29", 505000, 10, true, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(productoProveedorRepository.findById(1L)).thenReturn(Optional.of(productoProveedor));
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(productoProveedorRepository.save(any(ProductoProveedor.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductoProveedor resultado = productoProveedorService.actualizarProductoProveedor(1L, datos);

        assertEquals(1L, resultado.getIdProductoProveedor());
        assertEquals(505000, resultado.getCostoUnitario());
        verify(productoProveedorRepository, times(1)).findById(1L);
        verify(productoProveedorRepository, times(1)).save(productoProveedor);
    }

    @Test
    void actualizarProductoProveedorNoExistente() {
        when(productoProveedorRepository.findById(99L)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> productoProveedorService.actualizarProductoProveedor(99L, productoProveedor));

        assertEquals("ProductoProveedor no encontrado con id: 99", ex.getMessage());
        verify(productoProveedorRepository, times(1)).findById(99L);
        verify(productoProveedorRepository, never()).save(any(ProductoProveedor.class));
    }

    @Test
    void eliminarProductoProveedor() {
        productoProveedorService.eliminarProductoProveedor(1L);

        verify(productoProveedorRepository, times(1)).deleteById(1L);
    }

    @Test
    void guardarProductoProveedorConVarianteNoExistente() {
        when(proveedorRepository.findById(1L)).thenReturn(Optional.of(new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(restTemplate.getForEntity(URI.create(VARIANTES_URL + "/10"), String.class))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> productoProveedorService.guardarProductoProveedor(productoProveedor));

        assertEquals("Variante no encontrada con id: 10", ex.getMessage());
        verify(productoProveedorRepository, never()).save(any(ProductoProveedor.class));
    }
}
