package com.ridertapia.serviciotecnico.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.LimpiezaBaseDatos;
import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SolicitudServicioControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    // Simula los otros microservicios: los tests no dependen de que estén levantados
    @MockitoBean
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private TipoServicio tipoServicio;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        tipoServicio = tipoServicioRepository.save(new TipoServicio(null, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(restTemplate.getForEntity(any(URI.class), eq(String.class))).thenReturn(ResponseEntity.ok("{}"));
    }

    private SolicitudServicio nuevoSolicitudServicio(int variante) {
        return switch (variante) {
            case 1 -> new SolicitudServicio(null, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, tipoServicio);
            case 2 -> new SolicitudServicio(null, "Ana Soto", "933334444", null, null, "Los cambios saltan en los piñones chicos", LocalDateTime.of(2026, 10, 6, 12, 0), null, EstadoSolicitud.PENDIENTE, tipoServicio);
            default -> new SolicitudServicio(null, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien y suena la dirección", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 10), EstadoSolicitud.AGENDADA, tipoServicio);
        };
    }

    @Test
    void crearYListarSolicitudesServicio() throws Exception {
        mockMvc.perform(post("/api/v1/solicitudes-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoSolicitudServicio(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idSolicitudServicio").exists())
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));

        mockMvc.perform(post("/api/v1/solicitudes-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoSolicitudServicio(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/solicitudes-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.solicitudServicioList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/solicitudes-servicio/telefonoContacto/933334444"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.solicitudServicioList", hasSize(1)));
    }

    @Test
    void actualizarSolicitudServicio() throws Exception {
        SolicitudServicio guardado = solicitudServicioRepository.save(nuevoSolicitudServicio(1));

        mockMvc.perform(put("/api/v1/solicitudes-servicio/" + guardado.getIdSolicitudServicio())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoSolicitudServicio(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idSolicitudServicio").value(guardado.getIdSolicitudServicio().intValue()))
                .andExpect(jsonPath("$.estado").value("AGENDADA"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.solicitudesServicio.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        SolicitudServicio guardado = solicitudServicioRepository.save(nuevoSolicitudServicio(1));

        mockMvc.perform(delete("/api/v1/solicitudes-servicio/" + guardado.getIdSolicitudServicio()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/solicitudes-servicio/" + guardado.getIdSolicitudServicio()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearSolicitudServicioConClienteNoExistente() throws Exception {
        when(restTemplate.getForEntity(any(URI.class), eq(String.class)))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        mockMvc.perform(post("/api/v1/solicitudes-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoSolicitudServicio(1))))
                .andExpect(status().isNotFound());
    }
}
