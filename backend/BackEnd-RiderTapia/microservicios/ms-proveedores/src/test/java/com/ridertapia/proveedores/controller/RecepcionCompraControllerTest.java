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
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.service.RecepcionCompraService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(RecepcionCompraController.class)
@ActiveProfiles("test")
class RecepcionCompraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecepcionCompraService recepcionCompraService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private RecepcionCompra recepcionCompra;

    @BeforeEach
    void setUp() {
        recepcionCompra = new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
    }

    @Test
    void listarRecepcionesCompra() throws Exception {
        RecepcionCompra otro = new RecepcionCompra(2L, LocalDateTime.of(2026, 10, 16, 9, 30), TipoDocumentoRecepcion.GUIA_DESPACHO, "GD-4410", null, 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraService.listarRecepcionesCompra()).thenReturn(Arrays.asList(recepcionCompra, otro));

        mockMvc.perform(get("/api/v1/recepciones-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.recepcionCompraList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.recepcionCompraList[0].fechaRecepcion").exists())
                .andExpect(jsonPath("$._embedded.recepcionCompraList[1].fechaRecepcion").exists())
                .andExpect(jsonPath("$._embedded.recepcionCompraList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(recepcionCompraService.findById(1L)).thenReturn(Optional.of(recepcionCompra));

        mockMvc.perform(get("/api/v1/recepciones-compra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRecepcionCompra").value(1))
                .andExpect(jsonPath("$.fechaRecepcion").exists())
                .andExpect(jsonPath("$.tipoDocumento").value("FACTURA"))
                .andExpect(jsonPath("$.numeroDocumento").value("FAC-88123"))
                .andExpect(jsonPath("$.observacion").value("Llegó todo en buen estado"))
                .andExpect(jsonPath("$.idEmpleado").value(2L))
                .andExpect(jsonPath("$.ordenCompra.idOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.recepcionesCompra.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(recepcionCompraService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/recepciones-compra/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenCompraConResultados() throws Exception {
        when(recepcionCompraService.findByOrdenCompra(1L)).thenReturn(List.of(recepcionCompra));

        mockMvc.perform(get("/api/v1/recepciones-compra/ordenCompra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.recepcionCompraList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.recepcionCompraList[0].idRecepcionCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenCompraSinResultados() throws Exception {
        when(recepcionCompraService.findByOrdenCompra(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/recepciones-compra/ordenCompra/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearRecepcionCompra() throws Exception {
        when(recepcionCompraService.guardarRecepcionCompra(any(RecepcionCompra.class))).thenReturn(recepcionCompra);

        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recepcionCompra)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRecepcionCompra").value(1))
                .andExpect(jsonPath("$.numeroDocumento").value("FAC-88123"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.recepcionesCompra.href").exists());

        verify(recepcionCompraService, times(1)).guardarRecepcionCompra(any(RecepcionCompra.class));
    }

    @Test
    void crearRecepcionCompraConRelacionNoExistente() throws Exception {
        when(recepcionCompraService.guardarRecepcionCompra(any(RecepcionCompra.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recepcionCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearRecepcionCompraDeOrdenNoEnviada() throws Exception {
        when(recepcionCompraService.guardarRecepcionCompra(any(RecepcionCompra.class)))
                .thenThrow(new IllegalStateException("La orden no está enviada"));

        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recepcionCompra)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarRecepcionCompraExistente() throws Exception {
        RecepcionCompra actualizado = new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88124", "Factura corregida", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true)));
        when(recepcionCompraService.actualizarRecepcionCompra(eq(1L), any(RecepcionCompra.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/recepciones-compra/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.numeroDocumento").value("FAC-88124"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.recepcionesCompra.href").exists());
    }

    @Test
    void actualizarRecepcionCompraNoExistente() throws Exception {
        when(recepcionCompraService.actualizarRecepcionCompra(eq(99L), any(RecepcionCompra.class)))
                .thenThrow(new RuntimeException("RecepcionCompra no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/recepciones-compra/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(recepcionCompra)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarRecepcionCompra() throws Exception {
        doNothing().when(recepcionCompraService).eliminarRecepcionCompra(1L);

        mockMvc.perform(delete("/api/v1/recepciones-compra/1"))
                .andExpect(status().isNoContent());

        verify(recepcionCompraService, times(1)).eliminarRecepcionCompra(1L);
    }

    @Test
    void eliminarRecepcionCompraEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(recepcionCompraService).eliminarRecepcionCompra(1L);

        mockMvc.perform(delete("/api/v1/recepciones-compra/1"))
                .andExpect(status().isConflict());
    }
}
