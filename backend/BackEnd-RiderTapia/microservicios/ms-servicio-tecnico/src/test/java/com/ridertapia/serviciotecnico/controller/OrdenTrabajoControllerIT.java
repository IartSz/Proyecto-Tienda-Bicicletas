package com.ridertapia.serviciotecnico.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.assertEquals;
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
import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.HistorialEstadoOrdenRepository;
import com.ridertapia.serviciotecnico.repository.NotificacionTallerRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrdenTrabajoControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    // Simula los otros microservicios: los tests no dependen de que estén levantados
    @MockitoBean
    private RestTemplate restTemplate;

    @Autowired
    private HistorialEstadoOrdenRepository historialEstadoOrdenRepository;

    @Autowired
    private NotificacionTallerRepository notificacionTallerRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Bicicleta bicicleta;

    private TipoServicio tipoServicio;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        bicicleta = bicicletaRepository.save(new Bicicleta(null, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5"));
        tipoServicio = tipoServicioRepository.save(new TipoServicio(null, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true));
        when(restTemplate.getForEntity(any(URI.class), eq(String.class))).thenReturn(ResponseEntity.ok("{}"));
    }

    private OrdenTrabajo nuevoOrdenTrabajo(int variante) {
        return switch (variante) {
            case 1 -> new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.RECIBIDA, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas", 25000, 3L, bicicleta, tipoServicio, null);
            case 2 -> new OrdenTrabajo(null, "OT-00002", LocalDateTime.of(2026, 10, 7, 11, 0), LocalDate.of(2026, 10, 10), null, EstadoOrden.RECIBIDA, "Ana Soto", "933334444", null, null, null, 45000, 3L, bicicleta, tipoServicio, null);
            default -> new OrdenTrabajo(null, "OT-00001", LocalDateTime.of(2026, 10, 7, 10, 0), LocalDate.of(2026, 10, 9), null, EstadoOrden.EN_REPARACION, "Juan Pérez", "912345678", "juan@correo.cl", "12345678-5", "Pastillas traseras gastadas y cable de cambio cortado", 30000, 3L, bicicleta, tipoServicio, null);
        };
    }

    @Test
    void crearYListarOrdenesTrabajo() throws Exception {
        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenTrabajo(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idOrdenTrabajo").exists())
                .andExpect(jsonPath("$.costoManoObra").value(25000));

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenTrabajo(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/ordenes-trabajo"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/ordenes-trabajo/telefonoCliente/933334444"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenTrabajoList", hasSize(1)));
    }

    @Test
    void actualizarOrdenTrabajo() throws Exception {
        OrdenTrabajo guardado = ordenTrabajoRepository.save(nuevoOrdenTrabajo(1));

        mockMvc.perform(put("/api/v1/ordenes-trabajo/" + guardado.getIdOrdenTrabajo())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenTrabajo(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idOrdenTrabajo").value(guardado.getIdOrdenTrabajo().intValue()))
                .andExpect(jsonPath("$.costoManoObra").value(30000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesTrabajo.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        OrdenTrabajo guardado = ordenTrabajoRepository.save(nuevoOrdenTrabajo(1));

        mockMvc.perform(delete("/api/v1/ordenes-trabajo/" + guardado.getIdOrdenTrabajo()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/ordenes-trabajo/" + guardado.getIdOrdenTrabajo()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearOrdenTrabajoSinCodigoNiEstado() throws Exception {
        OrdenTrabajo orden = nuevoOrdenTrabajo(2);
        orden.setCodigo(null);
        orden.setEstado(null);

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orden)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codigo").exists())
                .andExpect(jsonPath("$.estado").value("RECIBIDA"));

        assertEquals(1, historialEstadoOrdenRepository.count());
    }

    @Test
    void cambiarEstadoAListaRegistraHistorialYNotificacion() throws Exception {
        OrdenTrabajo guardado = ordenTrabajoRepository.save(nuevoOrdenTrabajo(1));
        OrdenTrabajo datos = nuevoOrdenTrabajo(1);
        datos.setEstado(EstadoOrden.LISTA);

        mockMvc.perform(put("/api/v1/ordenes-trabajo/" + guardado.getIdOrdenTrabajo())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(datos)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("LISTA"));

        mockMvc.perform(get("/api/v1/historial-estados-orden/ordenTrabajo/" + guardado.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.historialEstadoOrdenList[0].estadoNuevo").value("LISTA"));

        mockMvc.perform(get("/api/v1/notificaciones-taller/ordenTrabajo/" + guardado.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.notificacionTallerList", hasSize(1)))
                .andExpect(jsonPath("$._embedded.notificacionTallerList[0].tipo").value("BICICLETA_LISTA"));
        assertEquals(1, notificacionTallerRepository.count());
    }

    @Test
    void crearOrdenTrabajoConClienteNoExistente() throws Exception {
        when(restTemplate.getForEntity(any(URI.class), eq(String.class)))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        mockMvc.perform(post("/api/v1/ordenes-trabajo")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenTrabajo(1))))
                .andExpect(status().isNotFound());
    }
}
