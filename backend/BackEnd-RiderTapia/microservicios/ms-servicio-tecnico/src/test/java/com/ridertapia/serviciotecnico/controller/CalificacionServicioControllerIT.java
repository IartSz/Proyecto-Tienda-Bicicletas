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
import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.CalificacionServicio;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.CalificacionServicioRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CalificacionServicioControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private CalificacionServicioRepository calificacionServicioRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Bicicleta bicicleta;

    private TipoServicio tipoServicio;

    private OrdenTrabajo ordenTrabajo;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        bicicleta = bicicletaRepository.save(new Bicicleta(null, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"));
        tipoServicio = tipoServicioRepository.save(new TipoServicio(null, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        ordenTrabajo = ordenTrabajoRepository.save(new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, bicicleta, tipoServicio, null));
        ordenTrabajo.setEstado(EstadoOrden.ENTREGADA);
        ordenTrabajo = ordenTrabajoRepository.save(ordenTrabajo);
    }

    private CalificacionServicio nuevoCalificacionServicio(int variante) {
        return switch (variante) {
            case 1 -> new CalificacionServicio(null, 5, "Excelente atención, quedó como nueva", LocalDateTime.of(2026, 10, 10, 12, 0), ordenTrabajo);
            case 2 -> new CalificacionServicio(null, 4, null, LocalDateTime.of(2026, 10, 10, 13, 0), ordenTrabajo);
            default -> new CalificacionServicio(null, 3, "Se demoró un día más de lo indicado", LocalDateTime.of(2026, 10, 10, 12, 30), ordenTrabajo);
        };
    }

    @Test
    void crearYListarCalificacionesServicio() throws Exception {
        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCalificacionServicio(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idCalificacionServicio").exists())
                .andExpect(jsonPath("$.puntuacion").value(5));

        // Una sola calificación por orden
        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCalificacionServicio(2))))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/calificaciones-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.calificacionServicioList", hasSize(1)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/calificaciones-servicio/ordenTrabajo/" + ordenTrabajo.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.calificacionServicioList", hasSize(1)));
    }

    @Test
    void actualizarCalificacionServicio() throws Exception {
        CalificacionServicio guardado = calificacionServicioRepository.save(nuevoCalificacionServicio(1));

        mockMvc.perform(put("/api/v1/calificaciones-servicio/" + guardado.getIdCalificacionServicio())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCalificacionServicio(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idCalificacionServicio").value(guardado.getIdCalificacionServicio().intValue()))
                .andExpect(jsonPath("$.puntuacion").value(3))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.calificacionesServicio.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        CalificacionServicio guardado = calificacionServicioRepository.save(nuevoCalificacionServicio(1));

        mockMvc.perform(delete("/api/v1/calificaciones-servicio/" + guardado.getIdCalificacionServicio()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/calificaciones-servicio/" + guardado.getIdCalificacionServicio()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearCalificacionServicioConOrdenNoEntregada() throws Exception {
        ordenTrabajo.setEstado(EstadoOrden.EN_REPARACION);
        ordenTrabajo = ordenTrabajoRepository.save(ordenTrabajo);

        mockMvc.perform(post("/api/v1/calificaciones-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCalificacionServicio(1))))
                .andExpect(status().isConflict());
    }
}
