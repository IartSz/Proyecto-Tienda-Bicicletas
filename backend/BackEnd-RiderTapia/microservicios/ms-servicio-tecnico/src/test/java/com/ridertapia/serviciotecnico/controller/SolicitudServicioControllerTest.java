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

import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.SolicitudServicioService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(SolicitudServicioController.class)
@ActiveProfiles("test")
class SolicitudServicioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private SolicitudServicioService solicitudServicioService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private SolicitudServicio solicitudServicio;

    @BeforeEach
    void setUp() {
        solicitudServicio = new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
    }

    @Test
    void listarSolicitudesServicio() throws Exception {
        SolicitudServicio otro = new SolicitudServicio(2L, "Ana Soto", "933334444", null, null, "Los cambios saltan en los piñones chicos", LocalDateTime.of(2026, 10, 6, 12, 0), null, EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(solicitudServicioService.listarSolicitudesServicio()).thenReturn(Arrays.asList(solicitudServicio, otro));

        mockMvc.perform(get("/api/v1/solicitudes-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.solicitudServicioList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.solicitudServicioList[0].nombreContacto").exists())
                .andExpect(jsonPath("$._embedded.solicitudServicioList[1].nombreContacto").exists())
                .andExpect(jsonPath("$._embedded.solicitudServicioList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(solicitudServicioService.findById(1L)).thenReturn(Optional.of(solicitudServicio));

        mockMvc.perform(get("/api/v1/solicitudes-servicio/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idSolicitudServicio").value(1))
                .andExpect(jsonPath("$.nombreContacto").value("Juan Pérez"))
                .andExpect(jsonPath("$.telefonoContacto").value("912345678"))
                .andExpect(jsonPath("$.emailContacto").value("juan@correo.cl"))
                .andExpect(jsonPath("$.rutCliente").value("12345678-5"))
                .andExpect(jsonPath("$.descripcionFalla").value("Los frenos traseros no frenan bien"))
                .andExpect(jsonPath("$.fechaSolicitud").exists())
                .andExpect(jsonPath("$.fechaPreferida").exists())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.tipoServicio.idTipoServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.solicitudesServicio.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(solicitudServicioService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/solicitudes-servicio/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorTelefonoContactoConResultados() throws Exception {
        when(solicitudServicioService.findByTelefonoContacto("912345678")).thenReturn(List.of(solicitudServicio));

        mockMvc.perform(get("/api/v1/solicitudes-servicio/telefonoContacto/912345678"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.solicitudServicioList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.solicitudServicioList[0].idSolicitudServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorTelefonoContactoSinResultados() throws Exception {
        when(solicitudServicioService.findByTelefonoContacto("no-existe")).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/solicitudes-servicio/telefonoContacto/no-existe"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearSolicitudServicio() throws Exception {
        when(solicitudServicioService.guardarSolicitudServicio(any(SolicitudServicio.class))).thenReturn(solicitudServicio);

        mockMvc.perform(post("/api/v1/solicitudes-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(solicitudServicio)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idSolicitudServicio").value(1))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.solicitudesServicio.href").exists());

        verify(solicitudServicioService, times(1)).guardarSolicitudServicio(any(SolicitudServicio.class));
    }

    @Test
    void crearSolicitudServicioConRelacionNoExistente() throws Exception {
        when(solicitudServicioService.guardarSolicitudServicio(any(SolicitudServicio.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/solicitudes-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(solicitudServicio)))
                .andExpect(status().isNotFound());
    }

    @Test
    void actualizarSolicitudServicioExistente() throws Exception {
        SolicitudServicio actualizado = new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien y suena la dirección", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 10), EstadoSolicitud.AGENDADA, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(solicitudServicioService.actualizarSolicitudServicio(eq(1L), any(SolicitudServicio.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/solicitudes-servicio/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("AGENDADA"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.solicitudesServicio.href").exists());
    }

    @Test
    void actualizarSolicitudServicioNoExistente() throws Exception {
        when(solicitudServicioService.actualizarSolicitudServicio(eq(99L), any(SolicitudServicio.class)))
                .thenThrow(new RuntimeException("SolicitudServicio no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/solicitudes-servicio/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(solicitudServicio)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarSolicitudServicio() throws Exception {
        doNothing().when(solicitudServicioService).eliminarSolicitudServicio(1L);

        mockMvc.perform(delete("/api/v1/solicitudes-servicio/1"))
                .andExpect(status().isNoContent());

        verify(solicitudServicioService, times(1)).eliminarSolicitudServicio(1L);
    }

    @Test
    void eliminarSolicitudServicioEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(solicitudServicioService).eliminarSolicitudServicio(1L);

        mockMvc.perform(delete("/api/v1/solicitudes-servicio/1"))
                .andExpect(status().isConflict());
    }
}
