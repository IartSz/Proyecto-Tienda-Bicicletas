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
import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.NotificacionTallerService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(NotificacionTallerController.class)
@ActiveProfiles("test")
class NotificacionTallerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private NotificacionTallerService notificacionTallerService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private NotificacionTaller notificacionTaller;

    @BeforeEach
    void setUp() {
        notificacionTaller = new NotificacionTaller(1L, "BICICLETA_LISTA", "juan@correo.cl", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 5), true, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
    }

    @Test
    void listarNotificacionesTaller() throws Exception {
        NotificacionTaller otro = new NotificacionTaller(2L, "CAMBIO_ESTADO", "juan@correo.cl", "Tu bicicleta está en reparación. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 9, 5), true, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(notificacionTallerService.listarNotificacionesTaller()).thenReturn(Arrays.asList(notificacionTaller, otro));

        mockMvc.perform(get("/api/v1/notificaciones-taller"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.notificacionTallerList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.notificacionTallerList[0].tipo").exists())
                .andExpect(jsonPath("$._embedded.notificacionTallerList[1].tipo").exists())
                .andExpect(jsonPath("$._embedded.notificacionTallerList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(notificacionTallerService.findById(1L)).thenReturn(Optional.of(notificacionTaller));

        mockMvc.perform(get("/api/v1/notificaciones-taller/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idNotificacionTaller").value(1))
                .andExpect(jsonPath("$.tipo").value("BICICLETA_LISTA"))
                .andExpect(jsonPath("$.destinatario").value("juan@correo.cl"))
                .andExpect(jsonPath("$.mensaje").value("Tu bicicleta ya está lista para retiro. Orden OT-00001"))
                .andExpect(jsonPath("$.fechaEnvio").exists())
                .andExpect(jsonPath("$.enviada").value(true))
                .andExpect(jsonPath("$.ordenTrabajo.idOrdenTrabajo").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.notificacionesTaller.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(notificacionTallerService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/notificaciones-taller/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorOrdenTrabajoConResultados() throws Exception {
        when(notificacionTallerService.findByOrdenTrabajo(1L)).thenReturn(List.of(notificacionTaller));

        mockMvc.perform(get("/api/v1/notificaciones-taller/ordenTrabajo/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.notificacionTallerList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.notificacionTallerList[0].idNotificacionTaller").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorOrdenTrabajoSinResultados() throws Exception {
        when(notificacionTallerService.findByOrdenTrabajo(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/notificaciones-taller/ordenTrabajo/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearNotificacionTaller() throws Exception {
        when(notificacionTallerService.guardarNotificacionTaller(any(NotificacionTaller.class))).thenReturn(notificacionTaller);

        mockMvc.perform(post("/api/v1/notificaciones-taller")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notificacionTaller)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idNotificacionTaller").value(1))
                .andExpect(jsonPath("$.destinatario").value("juan@correo.cl"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.notificacionesTaller.href").exists());

        verify(notificacionTallerService, times(1)).guardarNotificacionTaller(any(NotificacionTaller.class));
    }

    @Test
    void crearNotificacionTallerConRelacionNoExistente() throws Exception {
        when(notificacionTallerService.guardarNotificacionTaller(any(NotificacionTaller.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/notificaciones-taller")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notificacionTaller)))
                .andExpect(status().isNotFound());
    }

    @Test
    void actualizarNotificacionTallerExistente() throws Exception {
        NotificacionTaller actualizado = new NotificacionTaller(1L, "BICICLETA_LISTA", "912345678", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 10), false, new OrdenTrabajo(1L, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, new Bicicleta(1L, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"), new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true), null));
        when(notificacionTallerService.actualizarNotificacionTaller(eq(1L), any(NotificacionTaller.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/notificaciones-taller/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.destinatario").value("912345678"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.notificacionesTaller.href").exists());
    }

    @Test
    void actualizarNotificacionTallerNoExistente() throws Exception {
        when(notificacionTallerService.actualizarNotificacionTaller(eq(99L), any(NotificacionTaller.class)))
                .thenThrow(new RuntimeException("NotificacionTaller no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/notificaciones-taller/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(notificacionTaller)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarNotificacionTaller() throws Exception {
        doNothing().when(notificacionTallerService).eliminarNotificacionTaller(1L);

        mockMvc.perform(delete("/api/v1/notificaciones-taller/1"))
                .andExpect(status().isNoContent());

        verify(notificacionTallerService, times(1)).eliminarNotificacionTaller(1L);
    }
}
