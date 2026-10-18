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

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.service.DetalleOrdenCompraService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(DetalleOrdenCompraController.class)
@ActiveProfiles("test")
class DetalleOrdenCompraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DetalleOrdenCompraService detalleOrdenCompraService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private DetalleOrdenCompra detalleOrdenCompra;

    @BeforeEach
    void setUp() {
        detalleOrdenCompra = new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
    }

    @Test
    void listarDetallesOrdenCompra() throws Exception {
        DetalleOrdenCompra otro = new DetalleOrdenCompra(2L, 20L, 10, 0, 9500, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(detalleOrdenCompraService.listarDetallesOrdenCompra()).thenReturn(Arrays.asList(detalleOrdenCompra, otro));

        mockMvc.perform(get("/api/v1/detalles-orden-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList[0].idVariante").exists())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList[1].idVariante").exists())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(detalleOrdenCompraService.findById(1L)).thenReturn(Optional.of(detalleOrdenCompra));

        mockMvc.perform(get("/api/v1/detalles-orden-compra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDetalleOrdenCompra").value(1))
                .andExpect(jsonPath("$.idVariante").value(10L))
                .andExpect(jsonPath("$.cantidadSolicitada").value(2))
                .andExpect(jsonPath("$.cantidadRecibida").value(0))
                .andExpect(jsonPath("$.costoUnitario").value(520000))
                .andExpect(jsonPath("$.ordenCompra.idOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesOrdenCompra.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(detalleOrdenCompraService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/detalles-orden-compra/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenCompraConResultados() throws Exception {
        when(detalleOrdenCompraService.findByOrdenCompra(1L)).thenReturn(List.of(detalleOrdenCompra));

        mockMvc.perform(get("/api/v1/detalles-orden-compra/ordenCompra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList[0].idDetalleOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenCompraSinResultados() throws Exception {
        when(detalleOrdenCompraService.findByOrdenCompra(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/detalles-orden-compra/ordenCompra/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearDetalleOrdenCompra() throws Exception {
        when(detalleOrdenCompraService.guardarDetalleOrdenCompra(any(DetalleOrdenCompra.class))).thenReturn(detalleOrdenCompra);

        mockMvc.perform(post("/api/v1/detalles-orden-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleOrdenCompra)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDetalleOrdenCompra").value(1))
                .andExpect(jsonPath("$.costoUnitario").value(520000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesOrdenCompra.href").exists());

        verify(detalleOrdenCompraService, times(1)).guardarDetalleOrdenCompra(any(DetalleOrdenCompra.class));
    }

    @Test
    void crearDetalleOrdenCompraConRelacionNoExistente() throws Exception {
        when(detalleOrdenCompraService.guardarDetalleOrdenCompra(any(DetalleOrdenCompra.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/detalles-orden-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleOrdenCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void actualizarDetalleOrdenCompraExistente() throws Exception {
        DetalleOrdenCompra actualizado = new DetalleOrdenCompra(1L, 10L, 2, 0, 505000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(detalleOrdenCompraService.actualizarDetalleOrdenCompra(eq(1L), any(DetalleOrdenCompra.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/detalles-orden-compra/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoUnitario").value(505000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesOrdenCompra.href").exists());
    }

    @Test
    void actualizarDetalleOrdenCompraNoExistente() throws Exception {
        when(detalleOrdenCompraService.actualizarDetalleOrdenCompra(eq(99L), any(DetalleOrdenCompra.class)))
                .thenThrow(new RuntimeException("DetalleOrdenCompra no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/detalles-orden-compra/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleOrdenCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarDetalleOrdenCompra() throws Exception {
        doNothing().when(detalleOrdenCompraService).eliminarDetalleOrdenCompra(1L);

        mockMvc.perform(delete("/api/v1/detalles-orden-compra/1"))
                .andExpect(status().isNoContent());

        verify(detalleOrdenCompraService, times(1)).eliminarDetalleOrdenCompra(1L);
    }

    @Test
    void eliminarDetalleOrdenCompraEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(detalleOrdenCompraService).eliminarDetalleOrdenCompra(1L);

        mockMvc.perform(delete("/api/v1/detalles-orden-compra/1"))
                .andExpect(status().isConflict());
    }
}
