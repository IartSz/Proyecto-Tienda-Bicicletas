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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.CalificacionServicio;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.CalificacionServicioService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(CalificacionServicioController.class)
@ActiveProfiles("test")
class CalificacionServicioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CalificacionServicioService calificacionServicioService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private CalificacionServicio calificacionServicio;

    @BeforeEach
    void setUp() {
        calificacionServicio = new CalificacionServicio(1L, 5, "Excelente atención, quedó como nueva", LocalDateTime.of(2026, 10, 10, 12, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void listarCalificacionesServicio() throws Exception {
        CalificacionServicio otro = new CalificacionServicio(2L, 4, null, LocalDateTime.of(2026, 10, 10, 13, 0), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(calificacionServicioService.listarCalificacionesServicio()).thenReturn(Arrays.asList(calificacionServicio, otro));

        mockMvc.perform(get("/api/v1/calificaciones-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.calificacionServicioList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.calificacionServicioList[0].puntuacion").exists())
                .andExpect(jsonPath("$._embedded.calificacionServicioList[1].puntuacion").exists())
                .andExpect(jsonPath("$._embedded.calificacionServicioList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(calificacionServicioService.findById(1L)).thenReturn(Optional.of(calificacionServicio));

        mockMvc.perform(get("/api/v1/calificaciones-servicio/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCalificacionServicio").value(1))
                .andExpect(jsonPath("$.puntuacion").value(5))
                .andExpect(jsonPath("$.comentario").value("Excelente atención, quedó como nueva"))
                .andExpect(jsonPath("$.fechaCalificacion").exists())
                .andExpect(jsonPath("$.ordenTrabajo.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.calificacionesServicio.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(calificacionServicioService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/calificaciones-servicio/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenTrabajoConResultados() throws Exception {
        when(calificacionServicioService.findByOrdenTrabajo(1L)).thenReturn(List.of(calificacionServicio));

        mockMvc.perform(get("/api/v1/calificaciones-servicio/ordenTrabajo/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.calificacionServicioList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.calificacionServicioList[0].idCalificacionServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenTrabajoSinResultados() throws Exception {
        when(calificacionServicioService.findByOrdenTrabajo(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/calificaciones-servicio/ordenTrabajo/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearCalificacionServicio() throws Exception {
        when(calificacionServicioService.guardarCalificacionServicio(any(CalificacionServicio.class))).thenReturn(calificacionServicio);

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCalificacionServicio").value(1))
                .andExpect(jsonPath("$.puntuacion").value(5))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.calificacionesServicio.href").exists());

        verify(calificacionServicioService, times(1)).guardarCalificacionServicio(any(CalificacionServicio.class));
    }

    @Test
    void crearCalificacionServicioConRelacionNoExistente() throws Exception {
        when(calificacionServicioService.guardarCalificacionServicio(any(CalificacionServicio.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCalificacionServicioDuplicado() throws Exception {
        when(calificacionServicioService.guardarCalificacionServicio(any(CalificacionServicio.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCalificacionServicioNoPermitida() throws Exception {
        when(calificacionServicioService.guardarCalificacionServicio(any(CalificacionServicio.class)))
                .thenThrow(new IllegalStateException("Servicio no entregado o ya calificado"));

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isConflict());
    }

    @Test
    void crearCalificacionServicioConPuntuacionFueraDeRango() throws Exception {
        when(calificacionServicioService.guardarCalificacionServicio(any(CalificacionServicio.class)))
                .thenThrow(new IllegalArgumentException("Puntuación fuera de rango"));

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void actualizarCalificacionServicioExistente() throws Exception {
        CalificacionServicio actualizado = new CalificacionServicio(1L, 3, "Se demoró un día más de lo indicado", LocalDateTime.of(2026, 10, 10, 12, 30), new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(calificacionServicioService.actualizarCalificacionServicio(eq(1L), any(CalificacionServicio.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/calificaciones-servicio/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.puntuacion").value(3))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.calificacionesServicio.href").exists());
    }

    @Test
    void actualizarCalificacionServicioNoExistente() throws Exception {
        when(calificacionServicioService.actualizarCalificacionServicio(eq(99L), any(CalificacionServicio.class)))
                .thenThrow(new RuntimeException("CalificacionServicio no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/calificaciones-servicio/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(calificacionServicio)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarCalificacionServicio() throws Exception {
        doNothing().when(calificacionServicioService).eliminarCalificacionServicio(1L);

        mockMvc.perform(delete("/api/v1/calificaciones-servicio/1"))
                .andExpect(status().isNoContent());

        verify(calificacionServicioService, times(1)).eliminarCalificacionServicio(1L);
    }
}
