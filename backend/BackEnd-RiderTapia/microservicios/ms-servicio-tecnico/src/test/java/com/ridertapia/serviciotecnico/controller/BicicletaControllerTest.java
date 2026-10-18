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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.service.BicicletaService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(BicicletaController.class)
@ActiveProfiles("test")
class BicicletaControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private BicicletaService bicicletaService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Bicicleta bicicleta;

    @BeforeEach
    void setUp() {
        bicicleta = new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5");
    }

    @Test
    void listarBicicletas() throws Exception {
        Bicicleta otro = new Bicicleta(2L, "Specialized", "Allez", TipoBicicleta.RUTA, "700c", "Negro", "WSB654321", "12345678-5");
        when(bicicletaService.listarBicicletas()).thenReturn(Arrays.asList(bicicleta, otro));

        mockMvc.perform(get("/api/v1/bicicletas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.bicicletaList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.bicicletaList[0].marca").exists())
                .andExpect(jsonPath("$._embedded.bicicletaList[1].marca").exists())
                .andExpect(jsonPath("$._embedded.bicicletaList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(bicicletaService.findById(1L)).thenReturn(Optional.of(bicicleta));

        mockMvc.perform(get("/api/v1/bicicletas/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idBicicleta").value(1))
                .andExpect(jsonPath("$.marca").value("Trek"))
                .andExpect(jsonPath("$.modelo").value("Marlin 7"))
                .andExpect(jsonPath("$.tipo").value("MTB"))
                .andExpect(jsonPath("$.aro").value("29"))
                .andExpect(jsonPath("$.color").value("Rojo"))
                .andExpect(jsonPath("$.numeroSerie").value("WTU123456"))
                .andExpect(jsonPath("$.rutCliente").value("12345678-5"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.bicicletas.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(bicicletaService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/bicicletas/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorRutClienteConResultados() throws Exception {
        when(bicicletaService.findByRutCliente("12345678-5")).thenReturn(List.of(bicicleta));

        mockMvc.perform(get("/api/v1/bicicletas/rutCliente/12345678-5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.bicicletaList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.bicicletaList[0].idBicicleta").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorRutClienteSinResultados() throws Exception {
        when(bicicletaService.findByRutCliente("no-existe")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/bicicletas/rutCliente/no-existe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearBicicleta() throws Exception {
        when(bicicletaService.guardarBicicleta(any(Bicicleta.class))).thenReturn(bicicleta);

        mockMvc.perform(post("/api/v1/bicicletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bicicleta)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idBicicleta").value(1))
                .andExpect(jsonPath("$.color").value("Rojo"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.bicicletas.href").exists());

        verify(bicicletaService, times(1)).guardarBicicleta(any(Bicicleta.class));
    }

    @Test
    void crearBicicletaDuplicado() throws Exception {
        when(bicicletaService.guardarBicicleta(any(Bicicleta.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/bicicletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bicicleta)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarBicicletaExistente() throws Exception {
        Bicicleta actualizado = new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Azul", "WTU123456", "12345678-5");
        when(bicicletaService.actualizarBicicleta(eq(1L), any(Bicicleta.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/bicicletas/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.color").value("Azul"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.bicicletas.href").exists());
    }

    @Test
    void actualizarBicicletaNoExistente() throws Exception {
        when(bicicletaService.actualizarBicicleta(eq(99L), any(Bicicleta.class)))
                .thenThrow(new RuntimeException("Bicicleta no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/bicicletas/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(bicicleta)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarBicicleta() throws Exception {
        doNothing().when(bicicletaService).eliminarBicicleta(1L);

        mockMvc.perform(delete("/api/v1/bicicletas/1"))
                .andExpect(status().isNoContent());

        verify(bicicletaService, times(1)).eliminarBicicleta(1L);
    }

    @Test
    void eliminarBicicletaEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(bicicletaService).eliminarBicicleta(1L);

        mockMvc.perform(delete("/api/v1/bicicletas/1"))
                .andExpect(status().isConflict());
    }
}
