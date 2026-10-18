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
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.RepuestoUtilizadoService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(RepuestoUtilizadoController.class)
@ActiveProfiles("test")
class RepuestoUtilizadoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RepuestoUtilizadoService repuestoUtilizadoService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private RepuestoUtilizado repuestoUtilizado;

    @BeforeEach
    void setUp() {
        repuestoUtilizado = new RepuestoUtilizado(1L, 20L, 1, 15990, LocalDateTime.of(2026, 10, 8, 10, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void listarRepuestosUtilizados() throws Exception {
        RepuestoUtilizado otro = new RepuestoUtilizado(2L, 21L, 2, 4990, LocalDateTime.of(2026, 10, 8, 10, 30), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(repuestoUtilizadoService.listarRepuestosUtilizados()).thenReturn(Arrays.asList(repuestoUtilizado, otro));

        mockMvc.perform(get("/api/v1/repuestos-utilizados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList[0].idVariante").exists())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList[1].idVariante").exists())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(repuestoUtilizadoService.findById(1L)).thenReturn(Optional.of(repuestoUtilizado));

        mockMvc.perform(get("/api/v1/repuestos-utilizados/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRepuestoUtilizado").value(1))
                .andExpect(jsonPath("$.idVariante").value(20L))
                .andExpect(jsonPath("$.cantidad").value(1))
                .andExpect(jsonPath("$.precioUnitario").value(15990))
                .andExpect(jsonPath("$.fechaRegistro").exists())
                .andExpect(jsonPath("$.ordenTrabajo.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.repuestosUtilizados.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(repuestoUtilizadoService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/repuestos-utilizados/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenTrabajoConResultados() throws Exception {
        when(repuestoUtilizadoService.findByOrdenTrabajo(1L)).thenReturn(List.of(repuestoUtilizado));

        mockMvc.perform(get("/api/v1/repuestos-utilizados/ordenTrabajo/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList[0].idRepuestoUtilizado").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenTrabajoSinResultados() throws Exception {
        when(repuestoUtilizadoService.findByOrdenTrabajo(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/repuestos-utilizados/ordenTrabajo/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearRepuestoUtilizado() throws Exception {
        when(repuestoUtilizadoService.guardarRepuestoUtilizado(any(RepuestoUtilizado.class))).thenReturn(repuestoUtilizado);

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repuestoUtilizado)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRepuestoUtilizado").value(1))
                .andExpect(jsonPath("$.cantidad").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.repuestosUtilizados.href").exists());

        verify(repuestoUtilizadoService, times(1)).guardarRepuestoUtilizado(any(RepuestoUtilizado.class));
    }

    @Test
    void crearRepuestoUtilizadoConRelacionNoExistente() throws Exception {
        when(repuestoUtilizadoService.guardarRepuestoUtilizado(any(RepuestoUtilizado.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repuestoUtilizado)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearRepuestoUtilizadoSinStock() throws Exception {
        when(repuestoUtilizadoService.guardarRepuestoUtilizado(any(RepuestoUtilizado.class)))
                .thenThrow(new IllegalStateException("Stock insuficiente"));

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repuestoUtilizado)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearRepuestoUtilizadoConCantidadNoValida() throws Exception {
        when(repuestoUtilizadoService.guardarRepuestoUtilizado(any(RepuestoUtilizado.class)))
                .thenThrow(new IllegalArgumentException("Cantidad no válida"));

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repuestoUtilizado)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void actualizarRepuestoUtilizadoExistente() throws Exception {
        RepuestoUtilizado actualizado = new RepuestoUtilizado(1L, 20L, 2, 15990, LocalDateTime.of(2026, 10, 8, 11, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(repuestoUtilizadoService.actualizarRepuestoUtilizado(eq(1L), any(RepuestoUtilizado.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/repuestos-utilizados/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.repuestosUtilizados.href").exists());
    }

    @Test
    void actualizarRepuestoUtilizadoNoExistente() throws Exception {
        when(repuestoUtilizadoService.actualizarRepuestoUtilizado(eq(99L), any(RepuestoUtilizado.class)))
                .thenThrow(new RuntimeException("RepuestoUtilizado no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/repuestos-utilizados/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(repuestoUtilizado)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarRepuestoUtilizado() throws Exception {
        doNothing().when(repuestoUtilizadoService).eliminarRepuestoUtilizado(1L);

        mockMvc.perform(delete("/api/v1/repuestos-utilizados/1"))
                .andExpect(status().isNoContent());

        verify(repuestoUtilizadoService, times(1)).eliminarRepuestoUtilizado(1L);
    }
}
