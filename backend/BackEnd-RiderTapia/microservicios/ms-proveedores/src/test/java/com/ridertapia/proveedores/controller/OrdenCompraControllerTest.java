package com.ridertapia.proveedores.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.service.OrdenCompraService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(OrdenCompraController.class)
@ActiveProfiles("test")
class OrdenCompraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrdenCompraService ordenCompraService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private OrdenCompra ordenCompra;

    @BeforeEach
    void setUp() {
        ordenCompra = new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
    }

    @Test
    void listarOrdenesCompra() throws Exception {
        OrdenCompra otro = new OrdenCompra(2L, "OC-00002", LocalDateTime.of(2026, 10, 8, 10, 0), null, EstadoOrdenCompra.BORRADOR, 95000, 18050, 113050, null, 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(ordenCompraService.listarOrdenesCompra()).thenReturn(Arrays.asList(ordenCompra, otro));

        mockMvc.perform(get("/api/v1/ordenes-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.ordenCompraList[0].numero").exists())
                .andExpect(jsonPath("$._embedded.ordenCompraList[1].numero").exists())
                .andExpect(jsonPath("$._embedded.ordenCompraList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(ordenCompraService.findById(1L)).thenReturn(Optional.of(ordenCompra));

        mockMvc.perform(get("/api/v1/ordenes-compra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idOrdenCompra").value(1))
                .andExpect(jsonPath("$.numero").value("OC-00001"))
                .andExpect(jsonPath("$.fechaEmision").exists())
                .andExpect(jsonPath("$.fechaEntregaEsperada").exists())
                .andExpect(jsonPath("$.estado").value("ENVIADA"))
                .andExpect(jsonPath("$.montoNeto").value(1040000))
                .andExpect(jsonPath("$.iva").value(197600))
                .andExpect(jsonPath("$.total").value(1237600))
                .andExpect(jsonPath("$.observacion").value("Reposición de bicicletas Marlin 7"))
                .andExpect(jsonPath("$.idEmpleado").value(1L))
                .andExpect(jsonPath("$.proveedor.idProveedor").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesCompra.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(ordenCompraService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/ordenes-compra/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorProveedorConResultados() throws Exception {
        when(ordenCompraService.findByProveedor(1L)).thenReturn(List.of(ordenCompra));

        mockMvc.perform(get("/api/v1/ordenes-compra/proveedor/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.ordenCompraList[0].idOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorProveedorSinResultados() throws Exception {
        when(ordenCompraService.findByProveedor(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/ordenes-compra/proveedor/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorEstadoConResultados() throws Exception {
        when(ordenCompraService.findByEstado(EstadoOrdenCompra.ENVIADA)).thenReturn(List.of(ordenCompra));

        mockMvc.perform(get("/api/v1/ordenes-compra/estado/ENVIADA"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.ordenCompraList[0].idOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearOrdenCompra() throws Exception {
        when(ordenCompraService.guardarOrdenCompra(any(OrdenCompra.class))).thenReturn(ordenCompra);

        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenCompra)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idOrdenCompra").value(1))
                .andExpect(jsonPath("$.total").value(1237600))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesCompra.href").exists());

        verify(ordenCompraService, times(1)).guardarOrdenCompra(any(OrdenCompra.class));
    }

    @Test
    void crearOrdenCompraConRelacionNoExistente() throws Exception {
        when(ordenCompraService.guardarOrdenCompra(any(OrdenCompra.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearOrdenCompraDuplicado() throws Exception {
        when(ordenCompraService.guardarOrdenCompra(any(OrdenCompra.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenCompra)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarOrdenCompraExistente() throws Exception {
        OrdenCompra actualizado = new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 16), EstadoOrdenCompra.ENVIADA, 1010000, 191900, 1201900, "Reposición con precio ajustado", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(ordenCompraService.actualizarOrdenCompra(eq(1L), any(OrdenCompra.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/ordenes-compra/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1201900))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesCompra.href").exists());
    }

    @Test
    void actualizarOrdenCompraNoExistente() throws Exception {
        when(ordenCompraService.actualizarOrdenCompra(eq(99L), any(OrdenCompra.class)))
                .thenThrow(new RuntimeException("OrdenCompra no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/ordenes-compra/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarOrdenCompra() throws Exception {
        doNothing().when(ordenCompraService).eliminarOrdenCompra(1L);

        mockMvc.perform(delete("/api/v1/ordenes-compra/1"))
                .andExpect(status().isNoContent());

        verify(ordenCompraService, times(1)).eliminarOrdenCompra(1L);
    }

    @Test
    void eliminarOrdenCompraEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(ordenCompraService).eliminarOrdenCompra(1L);

        mockMvc.perform(delete("/api/v1/ordenes-compra/1"))
                .andExpect(status().isConflict());
    }
}
