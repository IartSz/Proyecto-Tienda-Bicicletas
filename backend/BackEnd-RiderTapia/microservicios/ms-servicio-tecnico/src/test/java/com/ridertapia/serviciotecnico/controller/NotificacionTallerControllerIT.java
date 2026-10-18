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
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificacionTallerControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private NotificacionTallerRepository notificacionTallerRepository;

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
    }

    private NotificacionTaller nuevoNotificacionTaller(int variante) {
        return switch (variante) {
            case 1 -> new NotificacionTaller(null, "BICICLETA_LISTA", "juan@correo.cl", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 5), true, ordenTrabajo);
            case 2 -> new NotificacionTaller(null, "CAMBIO_ESTADO", "juan@correo.cl", "Tu bicicleta está en reparación. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 9, 5), true, ordenTrabajo);
            default -> new NotificacionTaller(null, "BICICLETA_LISTA", "912345678", "Tu bicicleta ya está lista para retiro. Orden OT-00001", LocalDateTime.of(2026, 10, 8, 17, 10), false, ordenTrabajo);
        };
    }

    @Test
    void crearYListarNotificacionesTaller() throws Exception {
        mockMvc.perform(post("/api/v1/notificaciones-taller")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoNotificacionTaller(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idNotificacionTaller").exists())
                .andExpect(jsonPath("$.destinatario").value("juan@correo.cl"));

        mockMvc.perform(post("/api/v1/notificaciones-taller")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoNotificacionTaller(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/notificaciones-taller"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.notificacionTallerList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/notificaciones-taller/ordenTrabajo/" + ordenTrabajo.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.notificacionTallerList", hasSize(2)));
    }

    @Test
    void actualizarNotificacionTaller() throws Exception {
        NotificacionTaller guardado = notificacionTallerRepository.save(nuevoNotificacionTaller(1));

        mockMvc.perform(put("/api/v1/notificaciones-taller/" + guardado.getIdNotificacionTaller())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoNotificacionTaller(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idNotificacionTaller").value(guardado.getIdNotificacionTaller().intValue()))
                .andExpect(jsonPath("$.destinatario").value("912345678"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.notificacionesTaller.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        NotificacionTaller guardado = notificacionTallerRepository.save(nuevoNotificacionTaller(1));

        mockMvc.perform(delete("/api/v1/notificaciones-taller/" + guardado.getIdNotificacionTaller()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/notificaciones-taller/" + guardado.getIdNotificacionTaller()))
                .andExpect(status().isNotFound());
    }
}
