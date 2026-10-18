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

import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.TipoServicioService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(TipoServicioController.class)
@ActiveProfiles("test")
class TipoServicioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TipoServicioService tipoServicioService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private TipoServicio tipoServicio;

    @BeforeEach
    void setUp() {
        tipoServicio = new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true);
    }

    @Test
    void listarTiposServicio() throws Exception {
        TipoServicio otro = new TipoServicio(2L, "Mantención mediana", NivelServicio.MEDIANO, "Básica más limpieza de transmisión", "Todo lo de la básica, limpieza profunda de transmisión y centrado de ruedas", 45000, 2, true);
        when(tipoServicioService.listarTiposServicio()).thenReturn(Arrays.asList(tipoServicio, otro));

        mockMvc.perform(get("/api/v1/tipos-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.tipoServicioList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.tipoServicioList[0].nombre").exists())
                .andExpect(jsonPath("$._embedded.tipoServicioList[1].nombre").exists())
                .andExpect(jsonPath("$._embedded.tipoServicioList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(tipoServicioService.findById(1L)).thenReturn(Optional.of(tipoServicio));

        mockMvc.perform(get("/api/v1/tipos-servicio/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idTipoServicio").value(1))
                .andExpect(jsonPath("$.nombre").value("Mantención básica"))
                .andExpect(jsonPath("$.nivel").value("BASICO"))
                .andExpect(jsonPath("$.descripcion").value("Ajuste general y lubricación"))
                .andExpect(jsonPath("$.incluye").value("Ajuste de frenos y cambios, lubricación de cadena y revisión de presión"))
                .andExpect(jsonPath("$.precio").value(25000))
                .andExpect(jsonPath("$.diasEstimados").value(1))
                .andExpect(jsonPath("$.activo").value(true))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.tiposServicio.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(tipoServicioService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/tipos-servicio/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorNivelConResultados() throws Exception {
        when(tipoServicioService.findByNivel(NivelServicio.BASICO)).thenReturn(List.of(tipoServicio));

        mockMvc.perform(get("/api/v1/tipos-servicio/nivel/BASICO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.tipoServicioList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.tipoServicioList[0].idTipoServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearTipoServicio() throws Exception {
        when(tipoServicioService.guardarTipoServicio(any(TipoServicio.class))).thenReturn(tipoServicio);

        mockMvc.perform(post("/api/v1/tipos-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tipoServicio)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idTipoServicio").value(1))
                .andExpect(jsonPath("$.precio").value(25000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.tiposServicio.href").exists());

        verify(tipoServicioService, times(1)).guardarTipoServicio(any(TipoServicio.class));
    }

    @Test
    void crearTipoServicioDuplicado() throws Exception {
        when(tipoServicioService.guardarTipoServicio(any(TipoServicio.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/tipos-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tipoServicio)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarTipoServicioExistente() throws Exception {
        TipoServicio actualizado = new TipoServicio(1L, "Mantención full", NivelServicio.FULL, "Desarme completo de la bicicleta", "Desarme completo, limpieza y engrase de rodamientos y purga de frenos", 90000, 4, true);
        when(tipoServicioService.actualizarTipoServicio(eq(1L), any(TipoServicio.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/tipos-servicio/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.precio").value(90000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.tiposServicio.href").exists());
    }

    @Test
    void actualizarTipoServicioNoExistente() throws Exception {
        when(tipoServicioService.actualizarTipoServicio(eq(99L), any(TipoServicio.class)))
                .thenThrow(new RuntimeException("TipoServicio no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/tipos-servicio/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(tipoServicio)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarTipoServicio() throws Exception {
        doNothing().when(tipoServicioService).eliminarTipoServicio(1L);

        mockMvc.perform(delete("/api/v1/tipos-servicio/1"))
                .andExpect(status().isNoContent());

        verify(tipoServicioService, times(1)).eliminarTipoServicio(1L);
    }

    @Test
    void eliminarTipoServicioEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(tipoServicioService).eliminarTipoServicio(1L);

        mockMvc.perform(delete("/api/v1/tipos-servicio/1"))
                .andExpect(status().isConflict());
    }
}
