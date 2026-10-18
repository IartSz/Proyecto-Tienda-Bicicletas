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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.DetalleRecepcion;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.service.DetalleRecepcionService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(DetalleRecepcionController.class)
@ActiveProfiles("test")
class DetalleRecepcionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DetalleRecepcionService detalleRecepcionService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private DetalleRecepcion detalleRecepcion;

    @BeforeEach
    void setUp() {
        detalleRecepcion = new DetalleRecepcion(1L, 1, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
    }

    @Test
    void listarDetallesRecepcion() throws Exception {
        DetalleRecepcion otro = new DetalleRecepcion(2L, 1, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleRecepcionService.listarDetallesRecepcion()).thenReturn(Arrays.asList(detalleRecepcion, otro));

        mockMvc.perform(get("/api/v1/detalles-recepcion"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.detalleRecepcionList[0].cantidadRecibida").exists())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList[1].cantidadRecibida").exists())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(detalleRecepcionService.findById(1L)).thenReturn(Optional.of(detalleRecepcion));

        mockMvc.perform(get("/api/v1/detalles-recepcion/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDetalleRecepcion").value(1))
                .andExpect(jsonPath("$.cantidadRecibida").value(1))
                .andExpect(jsonPath("$.recepcionCompra.idRecepcionCompra").value(1))
                .andExpect(jsonPath("$.detalleOrdenCompra.idDetalleOrdenCompra").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesRecepcion.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(detalleRecepcionService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/detalles-recepcion/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorRecepcionCompraConResultados() throws Exception {
        when(detalleRecepcionService.findByRecepcionCompra(1L)).thenReturn(List.of(detalleRecepcion));

        mockMvc.perform(get("/api/v1/detalles-recepcion/recepcionCompra/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.detalleRecepcionList[0].idDetalleRecepcion").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorRecepcionCompraSinResultados() throws Exception {
        when(detalleRecepcionService.findByRecepcionCompra(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/detalles-recepcion/recepcionCompra/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearDetalleRecepcion() throws Exception {
        when(detalleRecepcionService.guardarDetalleRecepcion(any(DetalleRecepcion.class))).thenReturn(detalleRecepcion);

        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleRecepcion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDetalleRecepcion").value(1))
                .andExpect(jsonPath("$.cantidadRecibida").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesRecepcion.href").exists());

        verify(detalleRecepcionService, times(1)).guardarDetalleRecepcion(any(DetalleRecepcion.class));
    }

    @Test
    void crearDetalleRecepcionConRelacionNoExistente() throws Exception {
        when(detalleRecepcionService.guardarDetalleRecepcion(any(DetalleRecepcion.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleRecepcion)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearDetalleRecepcionMayorAlPendiente() throws Exception {
        when(detalleRecepcionService.guardarDetalleRecepcion(any(DetalleRecepcion.class)))
                .thenThrow(new IllegalStateException("Más de lo pendiente o de otra orden"));

        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleRecepcion)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearDetalleRecepcionConCantidadNoValida() throws Exception {
        when(detalleRecepcionService.guardarDetalleRecepcion(any(DetalleRecepcion.class)))
                .thenThrow(new IllegalArgumentException("Cantidad no válida"));

        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleRecepcion)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void actualizarDetalleRecepcionExistente() throws Exception {
        DetalleRecepcion actualizado = new DetalleRecepcion(1L, 2, new RecepcionCompra(1L, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))), new DetalleOrdenCompra(1L, 10L, 2, 0, 520000, new OrdenCompra(1L, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true))));
        when(detalleRecepcionService.actualizarDetalleRecepcion(eq(1L), any(DetalleRecepcion.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/detalles-recepcion/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidadRecibida").value(2))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesRecepcion.href").exists());
    }

    @Test
    void actualizarDetalleRecepcionNoExistente() throws Exception {
        when(detalleRecepcionService.actualizarDetalleRecepcion(eq(99L), any(DetalleRecepcion.class)))
                .thenThrow(new RuntimeException("DetalleRecepcion no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/detalles-recepcion/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detalleRecepcion)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarDetalleRecepcion() throws Exception {
        doNothing().when(detalleRecepcionService).eliminarDetalleRecepcion(1L);

        mockMvc.perform(delete("/api/v1/detalles-recepcion/1"))
                .andExpect(status().isNoContent());

        verify(detalleRecepcionService, times(1)).eliminarDetalleRecepcion(1L);
    }
}
