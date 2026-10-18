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
import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HistorialEstadoOrdenControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

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

    private HistorialEstadoOrden nuevoHistorialEstadoOrden(int variante) {
        return switch (variante) {
            case 1 -> new HistorialEstadoOrden(null, EstadoOrden.RECIBIDA, EstadoOrden.EN_REVISION, LocalDateTime.of(2026, 10, 7, 12, 0), 3L, "Se revisa la bicicleta", ordenTrabajo);
            case 2 -> new HistorialEstadoOrden(null, EstadoOrden.EN_REVISION, EstadoOrden.EN_REPARACION, LocalDateTime.of(2026, 10, 8, 9, 0), 3L, null, ordenTrabajo);
            default -> new HistorialEstadoOrden(null, EstadoOrden.EN_REPARACION, EstadoOrden.LISTA, LocalDateTime.of(2026, 10, 8, 17, 0), 3L, "Lista para retiro", ordenTrabajo);
        };
    }

    @Test
    void crearYListarHistorialEstadosOrden() throws Exception {
        mockMvc.perform(post("/api/v1/historial-estados-orden")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoHistorialEstadoOrden(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idHistorialEstadoOrden").exists())
                .andExpect(jsonPath("$.estadoNuevo").value("EN_REVISION"));

        mockMvc.perform(post("/api/v1/historial-estados-orden")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoHistorialEstadoOrden(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/historial-estados-orden"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/historial-estados-orden/ordenTrabajo/" + ordenTrabajo.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList", hasSize(2)));
    }

    @Test
    void actualizarHistorialEstadoOrden() throws Exception {
        HistorialEstadoOrden guardado = historialEstadoOrdenRepository.save(nuevoHistorialEstadoOrden(1));

        mockMvc.perform(put("/api/v1/historial-estados-orden/" + guardado.getIdHistorialEstadoOrden())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoHistorialEstadoOrden(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idHistorialEstadoOrden").value(guardado.getIdHistorialEstadoOrden().intValue()))
                .andExpect(jsonPath("$.estadoNuevo").value("LISTA"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.historialEstadosOrden.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        HistorialEstadoOrden guardado = historialEstadoOrdenRepository.save(nuevoHistorialEstadoOrden(1));

        mockMvc.perform(delete("/api/v1/historial-estados-orden/" + guardado.getIdHistorialEstadoOrden()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/historial-estados-orden/" + guardado.getIdHistorialEstadoOrden()))
                .andExpect(status().isNotFound());
    }
}
