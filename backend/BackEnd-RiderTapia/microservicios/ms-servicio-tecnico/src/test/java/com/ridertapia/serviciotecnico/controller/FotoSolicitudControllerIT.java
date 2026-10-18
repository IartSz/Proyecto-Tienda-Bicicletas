package com.ridertapia.serviciotecnico.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.serviciotecnico.LimpiezaBaseDatos;
import com.ridertapia.serviciotecnico.model.EstadoSolicitud;
import com.ridertapia.serviciotecnico.model.FotoSolicitud;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.FotoSolicitudRepository;
import com.ridertapia.serviciotecnico.repository.SolicitudServicioRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class FotoSolicitudControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private FotoSolicitudRepository fotoSolicitudRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    @Autowired
    private SolicitudServicioRepository solicitudServicioRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private TipoServicio tipoServicio;

    private SolicitudServicio solicitudServicio;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        tipoServicio = tipoServicioRepository.save(new TipoServicio(null, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        solicitudServicio = solicitudServicioRepository.save(new SolicitudServicio(null, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Los frenos traseros no frenan bien", LocalDateTime.of(2026, 10, 6, 9, 0), LocalDate.of(2026, 10, 9), EstadoSolicitud.PENDIENTE, tipoServicio));
    }

    private FotoSolicitud nuevoFotoSolicitud(int variante) {
        return switch (variante) {
            case 1 -> new FotoSolicitud(null, "https://ridertapia.cl/fotos/solicitud-1-a.jpg", "jpg", 850, solicitudServicio);
            case 2 -> new FotoSolicitud(null, "https://ridertapia.cl/fotos/solicitud-1-b.png", "png", 1200, solicitudServicio);
            default -> new FotoSolicitud(null, "https://ridertapia.cl/fotos/solicitud-1-c.webp", "webp", 640, solicitudServicio);
        };
    }

    @Test
    void crearYListarFotosSolicitud() throws Exception {
        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoFotoSolicitud(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idFotoSolicitud").exists())
                .andExpect(jsonPath("$.tamanoKb").value(850));

        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoFotoSolicitud(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/fotos-solicitud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/fotos-solicitud/solicitudServicio/" + solicitudServicio.getIdSolicitudServicio()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.fotoSolicitudList", hasSize(2)));
    }

    @Test
    void actualizarFotoSolicitud() throws Exception {
        FotoSolicitud guardado = fotoSolicitudRepository.save(nuevoFotoSolicitud(1));

        mockMvc.perform(put("/api/v1/fotos-solicitud/" + guardado.getIdFotoSolicitud())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoFotoSolicitud(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idFotoSolicitud").value(guardado.getIdFotoSolicitud().intValue()))
                .andExpect(jsonPath("$.tamanoKb").value(640))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.fotosSolicitud.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        FotoSolicitud guardado = fotoSolicitudRepository.save(nuevoFotoSolicitud(1));

        mockMvc.perform(delete("/api/v1/fotos-solicitud/" + guardado.getIdFotoSolicitud()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/fotos-solicitud/" + guardado.getIdFotoSolicitud()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearFotoSolicitudConFormatoNoPermitido() throws Exception {
        FotoSolicitud foto = nuevoFotoSolicitud(1);
        foto.setFormato("bmp");

        mockMvc.perform(post("/api/v1/fotos-solicitud")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(foto)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/v1/fotos-solicitud"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist());
    }
}
