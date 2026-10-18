package com.ridertapia.proveedores.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.proveedores.model.ProductoProveedor;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.service.ProductoProveedorService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(ProductoProveedorController.class)
@ActiveProfiles("test")
class ProductoProveedorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductoProveedorService productoProveedorService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private ProductoProveedor productoProveedor;

    @BeforeEach
    void setUp() {
        productoProveedor = new ProductoProveedor(1L, 10L, "AB-MAR7-29", 520000, 7, true, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
    }

    @Test
    void listarProductosProveedor() throws Exception {
        ProductoProveedor otro = new ProductoProveedor(2L, 20L, "AB-PAST-SH", 9500, 3, false, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(productoProveedorService.listarProductosProveedor()).thenReturn(Arrays.asList(productoProveedor, otro));

        mockMvc.perform(get("/api/v1/productos-proveedor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.productoProveedorList[0].idVariante").exists())
                .andExpect(jsonPath("$._embedded.productoProveedorList[1].idVariante").exists())
                .andExpect(jsonPath("$._embedded.productoProveedorList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(productoProveedorService.findById(1L)).thenReturn(Optional.of(productoProveedor));

        mockMvc.perform(get("/api/v1/productos-proveedor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProductoProveedor").value(1))
                .andExpect(jsonPath("$.idVariante").value(10L))
                .andExpect(jsonPath("$.codigoProveedor").value("AB-MAR7-29"))
                .andExpect(jsonPath("$.costoUnitario").value(520000))
                .andExpect(jsonPath("$.plazoEntregaDias").value(7))
                .andExpect(jsonPath("$.preferido").value(true))
                .andExpect(jsonPath("$.proveedor.idProveedor").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.productosProveedor.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(productoProveedorService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/productos-proveedor/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorIdVarianteConResultados() throws Exception {
        when(productoProveedorService.findByIdVariante(10L)).thenReturn(List.of(productoProveedor));

        mockMvc.perform(get("/api/v1/productos-proveedor/idVariante/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.productoProveedorList[0].idProductoProveedor").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdVarianteSinResultados() throws Exception {
        when(productoProveedorService.findByIdVariante(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/productos-proveedor/idVariante/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorProveedorConResultados() throws Exception {
        when(productoProveedorService.findByProveedor(1L)).thenReturn(List.of(productoProveedor));

        mockMvc.perform(get("/api/v1/productos-proveedor/proveedor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.productoProveedorList[0].idProductoProveedor").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorProveedorSinResultados() throws Exception {
        when(productoProveedorService.findByProveedor(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/productos-proveedor/proveedor/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearProductoProveedor() throws Exception {
        when(productoProveedorService.guardarProductoProveedor(any(ProductoProveedor.class))).thenReturn(productoProveedor);

        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoProveedor)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idProductoProveedor").value(1))
                .andExpect(jsonPath("$.costoUnitario").value(520000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.productosProveedor.href").exists());

        verify(productoProveedorService, times(1)).guardarProductoProveedor(any(ProductoProveedor.class));
    }

    @Test
    void crearProductoProveedorConRelacionNoExistente() throws Exception {
        when(productoProveedorService.guardarProductoProveedor(any(ProductoProveedor.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoProveedor)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearProductoProveedorDuplicado() throws Exception {
        when(productoProveedorService.guardarProductoProveedor(any(ProductoProveedor.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoProveedor)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarProductoProveedorExistente() throws Exception {
        ProductoProveedor actualizado = new ProductoProveedor(1L, 10L, "AB-MAR7-29", 505000, 10, true, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(productoProveedorService.actualizarProductoProveedor(eq(1L), any(ProductoProveedor.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/productos-proveedor/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoUnitario").value(505000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.productosProveedor.href").exists());
    }

    @Test
    void actualizarProductoProveedorNoExistente() throws Exception {
        when(productoProveedorService.actualizarProductoProveedor(eq(99L), any(ProductoProveedor.class)))
                .thenThrow(new RuntimeException("ProductoProveedor no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/productos-proveedor/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productoProveedor)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarProductoProveedor() throws Exception {
        doNothing().when(productoProveedorService).eliminarProductoProveedor(1L);

        mockMvc.perform(delete("/api/v1/productos-proveedor/1"))
                .andExpect(status().isNoContent());

        verify(productoProveedorService, times(1)).eliminarProductoProveedor(1L);
    }
}
