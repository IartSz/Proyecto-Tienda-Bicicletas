package com.ridertapia.serviciotecnico.controller;

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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.OrdenTrabajoService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(OrdenTrabajoController.class)
@ActiveProfiles("test")
class OrdenTrabajoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrdenTrabajoService ordenTrabajoService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private OrdenTrabajo ordenTrabajo;

    @BeforeEach
    void setUp() {
        ordenTrabajo = new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
    }

    @Test
    void listarOrdenesTrabajo() throws Exception {
        OrdenTrabajo otro = new OrdenTrabajo(2L, "OT-00002", LocalDateTime.of(2026, 10, 7, 11, 0), LocalDate.of(2026, 10, 10), null, EstadoOrden.RECIBIDA, "Ana Soto", "933334444", null, null, null, 45000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        when(ordenTrabajoService.listarOrdenesTrabajo()).thenReturn(Arrays.asList(ordenTrabajo, otro));

        mockMvc.perform(get("/api/v1/ordenes-trabajo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.ordenTrabajoList[0].codigo").exists())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList[1].codigo").exists())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(ordenTrabajoService.findById(1L)).thenReturn(Optional.of(ordenTrabajo));

        mockMvc.perform(get("/api/v1/ordenes-trabajo/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$.codigo").value("OT-00001"))
                .andExpect(jsonPath("$.fechaIngreso").exists())
                .andExpect(jsonPath("$.fechaEstimadaEntrega").exists())
                .andExpect(jsonPath("$.estado").value("RECIBIDA"))
                .andExpect(jsonPath("$.nombreCliente").value("Juan Pérez"))
                .andExpect(jsonPath("$.telefonoCliente").value("912345678"))
                .andExpect(jsonPath("$.emailCliente").value("juan@correo.cl"))
                .andExpect(jsonPath("$.rutCliente").value("12345678-5"))
                .andExpect(jsonPath("$.diagnostico").value("Pastillas traseras gastadas"))
                .andExpect(jsonPath("$.costoManoObra").value(25000))
                .andExpect(jsonPath("$.idEmpleado").value(3L))
                .andExpect(jsonPath("$.bicicleta.idBicicleta").value(1))
                .andExpect(jsonPath("$.tipoServicio.idTipoServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesTrabajo.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(ordenTrabajoService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/ordenes-trabajo/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorTelefonoClienteConResultados() throws Exception {
        when(ordenTrabajoService.findByTelefonoCliente("912345678")).thenReturn(List.of(ordenTrabajo));

        mockMvc.perform(get("/api/v1/ordenes-trabajo/telefonoCliente/912345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.ordenTrabajoList[0].idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorTelefonoClienteSinResultados() throws Exception {
        when(ordenTrabajoService.findByTelefonoCliente("no-existe")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/ordenes-trabajo/telefonoCliente/no-existe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearOrdenTrabajo() throws Exception {
        when(ordenTrabajoService.guardarOrdenTrabajo(any(OrdenTrabajo.class))).thenReturn(ordenTrabajo);

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenTrabajo)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$.costoManoObra").value(25000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesTrabajo.href").exists());

        verify(ordenTrabajoService, times(1)).guardarOrdenTrabajo(any(OrdenTrabajo.class));
    }

    @Test
    void crearOrdenTrabajoConRelacionNoExistente() throws Exception {
        when(ordenTrabajoService.guardarOrdenTrabajo(any(OrdenTrabajo.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenTrabajo)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearOrdenTrabajoDuplicado() throws Exception {
        when(ordenTrabajoService.guardarOrdenTrabajo(any(OrdenTrabajo.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenTrabajo)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarOrdenTrabajoExistente() throws Exception {
        OrdenTrabajo actualizado = new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.EN_REPARACION, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas y cable de cambio cortado", 30000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null);
        when(ordenTrabajoService.actualizarOrdenTrabajo(eq(1L), any(OrdenTrabajo.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/ordenes-trabajo/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.costoManoObra").value(30000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesTrabajo.href").exists());
    }

    @Test
    void actualizarOrdenTrabajoNoExistente() throws Exception {
        when(ordenTrabajoService.actualizarOrdenTrabajo(eq(99L), any(OrdenTrabajo.class)))
                .thenThrow(new RuntimeException("OrdenTrabajo no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/ordenes-trabajo/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ordenTrabajo)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarOrdenTrabajo() throws Exception {
        doNothing().when(ordenTrabajoService).eliminarOrdenTrabajo(1L);

        mockMvc.perform(delete("/api/v1/ordenes-trabajo/1"))
                .andExpect(status().isNoContent());

        verify(ordenTrabajoService, times(1)).eliminarOrdenTrabajo(1L);
    }

    @Test
    void eliminarOrdenTrabajoEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(ordenTrabajoService).eliminarOrdenTrabajo(1L);

        mockMvc.perform(delete("/api/v1/ordenes-trabajo/1"))
                .andExpect(status().isConflict());
    }
}
