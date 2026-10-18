package com.ridertapia.serviciotecnico.controller;

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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.HistorialEstadoOrdenService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(HistorialEstadoOrdenController.class)
@ActiveProfiles("test")
class HistorialEstadoOrdenControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private HistorialEstadoOrdenService historialEstadoOrdenService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private HistorialEstadoOrden historialEstadoOrden;

    @BeforeEach
    void setUp() {
        historialEstadoOrden = new HistorialEstadoOrden(1L, EstadoOrden.RECIBIDA, EstadoOrden.EN_REVISION, LocalDateTime.of(2026, 10, 7, 12, 0), 3L, "Se revisa la bicicleta", new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void listarHistorialEstadosOrden() throws Exception {
        HistorialEstadoOrden otro = new HistorialEstadoOrden(2L, EstadoOrden.EN_REVISION, EstadoOrden.EN_REPARACION, LocalDateTime.of(2026, 10, 8, 9, 0), 3L, null, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(historialEstadoOrdenService.listarHistorialEstadosOrden()).thenReturn(Arrays.asList(historialEstadoOrden, otro));

        mockMvc.perform(get("/api/v1/historial-estados-orden"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList[0].estadoAnterior").exists())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList[1].estadoAnterior").exists())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(historialEstadoOrdenService.findById(1L)).thenReturn(Optional.of(historialEstadoOrden));

        mockMvc.perform(get("/api/v1/historial-estados-orden/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idHistorialEstadoOrden").value(1))
                .andExpect(jsonPath("$.estadoAnterior").value("RECIBIDA"))
                .andExpect(jsonPath("$.estadoNuevo").value("EN_REVISION"))
                .andExpect(jsonPath("$.fechaCambio").exists())
                .andExpect(jsonPath("$.idEmpleado").value(3L))
                .andExpect(jsonPath("$.comentario").value("Se revisa la bicicleta"))
                .andExpect(jsonPath("$.ordenTrabajo.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.historialEstadosOrden.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(historialEstadoOrdenService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/historial-estados-orden/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenTrabajoConResultados() throws Exception {
        when(historialEstadoOrdenService.findByOrdenTrabajo(1L)).thenReturn(List.of(historialEstadoOrden));

        mockMvc.perform(get("/api/v1/historial-estados-orden/ordenTrabajo/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList[0].idHistorialEstadoOrden").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenTrabajoSinResultados() throws Exception {
        when(historialEstadoOrdenService.findByOrdenTrabajo(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/historial-estados-orden/ordenTrabajo/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearHistorialEstadoOrden() throws Exception {
        when(historialEstadoOrdenService.guardarHistorialEstadoOrden(any(HistorialEstadoOrden.class))).thenReturn(historialEstadoOrden);

        mockMvc.perform(post("/api/v1/historial-estados-orden")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(historialEstadoOrden)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idHistorialEstadoOrden").value(1))
                .andExpect(jsonPath("$.estadoNuevo").value("EN_REVISION"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.historialEstadosOrden.href").exists());

        verify(historialEstadoOrdenService, times(1)).guardarHistorialEstadoOrden(any(HistorialEstadoOrden.class));
    }

    @Test
    void crearHistorialEstadoOrdenConRelacionNoExistente() throws Exception {
        when(historialEstadoOrdenService.guardarHistorialEstadoOrden(any(HistorialEstadoOrden.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/historial-estados-orden")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(historialEstadoOrden)))
                .andExpect(status().isNotFound());
    }

    @Test
    void actualizarHistorialEstadoOrdenExistente() throws Exception {
        HistorialEstadoOrden actualizado = new HistorialEstadoOrden(1L, EstadoOrden.EN_REPARACION, EstadoOrden.LISTA, LocalDateTime.of(2026, 10, 8, 17, 0), 3L, "Lista para retiro", new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(historialEstadoOrdenService.actualizarHistorialEstadoOrden(eq(1L), any(HistorialEstadoOrden.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/historial-estados-orden/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estadoNuevo").value("LISTA"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.historialEstadosOrden.href").exists());
    }

    @Test
    void actualizarHistorialEstadoOrdenNoExistente() throws Exception {
        when(historialEstadoOrdenService.actualizarHistorialEstadoOrden(eq(99L), any(HistorialEstadoOrden.class)))
                .thenThrow(new RuntimeException("HistorialEstadoOrden no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/historial-estados-orden/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(historialEstadoOrden)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarHistorialEstadoOrden() throws Exception {
        doNothing().when(historialEstadoOrdenService).eliminarHistorialEstadoOrden(1L);

        mockMvc.perform(delete("/api/v1/historial-estados-orden/1"))
                .andExpect(status().isNoContent());

        verify(historialEstadoOrdenService, times(1)).eliminarHistorialEstadoOrden(1L);
    }
}
