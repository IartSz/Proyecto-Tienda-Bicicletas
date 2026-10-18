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

import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.FotoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.FotoSolicitudService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(FotoSolicitudController.class)
@ActiveProfiles("test")
class FotoSolicitudControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FotoSolicitudService fotoSolicitudService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private FotoSolicitud fotoSolicitud;

    @BeforeEach
    void setUp() {
        fotoSolicitud = new FotoSolicitud(1L, "https://ridertapia.cl/fotos/solicitud-1-a.jpg", "jpg", 850, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
    }

    @Test
    void listarFotosSolicitud() throws Exception {
        FotoSolicitud otro = new FotoSolicitud(2L, "https://ridertapia.cl/fotos/solicitud-1-b.png", "png", 1200, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(fotoSolicitudService.listarFotosSolicitud()).thenReturn(Arrays.asList(fotoSolicitud, otro));

        mockMvc.perform(get("/api/v1/fotos-solicitud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.fotoSolicitudList[0].url").exists())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList[1].url").exists())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(fotoSolicitudService.findById(1L)).thenReturn(Optional.of(fotoSolicitud));

        mockMvc.perform(get("/api/v1/fotos-solicitud/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idFotoSolicitud").value(1))
                .andExpect(jsonPath("$.url").value("https://ridertapia.cl/fotos/solicitud-1-a.jpg"))
                .andExpect(jsonPath("$.formato").value("jpg"))
                .andExpect(jsonPath("$.tamanoKb").value(850))
                .andExpect(jsonPath("$.solicitudServicio.idSolicitudServicio").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.fotosSolicitud.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(fotoSolicitudService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/fotos-solicitud/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorSolicitudServicioConResultados() throws Exception {
        when(fotoSolicitudService.findBySolicitudServicio(1L)).thenReturn(List.of(fotoSolicitud));

        mockMvc.perform(get("/api/v1/fotos-solicitud/solicitudServicio/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.fotoSolicitudList[0].idFotoSolicitud").value(1))
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorSolicitudServicioSinResultados() throws Exception {
        when(fotoSolicitudService.findBySolicitudServicio(99L)).thenReturn(List.of());

        mockMvc.perform(get("/api/v1/fotos-solicitud/solicitudServicio/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void crearFotoSolicitud() throws Exception {
        when(fotoSolicitudService.guardarFotoSolicitud(any(FotoSolicitud.class))).thenReturn(fotoSolicitud);

        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fotoSolicitud)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idFotoSolicitud").value(1))
                .andExpect(jsonPath("$.tamanoKb").value(850))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.fotosSolicitud.href").exists());

        verify(fotoSolicitudService, times(1)).guardarFotoSolicitud(any(FotoSolicitud.class));
    }

    @Test
    void crearFotoSolicitudConRelacionNoExistente() throws Exception {
        when(fotoSolicitudService.guardarFotoSolicitud(any(FotoSolicitud.class)))
                .thenThrow(new RuntimeException("Registro relacionado no encontrado"));

        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fotoSolicitud)))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearFotoSolicitudConFormatoNoPermitido() throws Exception {
        when(fotoSolicitudService.guardarFotoSolicitud(any(FotoSolicitud.class)))
                .thenThrow(new IllegalArgumentException("Formato o tamaño de imagen no permitido"));

        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fotoSolicitud)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void actualizarFotoSolicitudExistente() throws Exception {
        FotoSolicitud actualizado = new FotoSolicitud(1L, "https://ridertapia.cl/fotos/solicitud-1-c.webp", "webp", 640, new SolicitudServicio(1L, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, new TipoServicio(1L, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true)));
        when(fotoSolicitudService.actualizarFotoSolicitud(eq(1L), any(FotoSolicitud.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/fotos-solicitud/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tamanoKb").value(640))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.fotosSolicitud.href").exists());
    }

    @Test
    void actualizarFotoSolicitudNoExistente() throws Exception {
        when(fotoSolicitudService.actualizarFotoSolicitud(eq(99L), any(FotoSolicitud.class)))
                .thenThrow(new RuntimeException("FotoSolicitud no encontrada con id: 99"));

        mockMvc.perform(put("/api/v1/fotos-solicitud/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(fotoSolicitud)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarFotoSolicitud() throws Exception {
        doNothing().when(fotoSolicitudService).eliminarFotoSolicitud(1L);

        mockMvc.perform(delete("/api/v1/fotos-solicitud/1"))
                .andExpect(status().isNoContent());

        verify(fotoSolicitudService, times(1)).eliminarFotoSolicitud(1L);
    }
}
