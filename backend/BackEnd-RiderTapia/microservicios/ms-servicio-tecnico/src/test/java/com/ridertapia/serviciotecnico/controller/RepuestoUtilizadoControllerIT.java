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
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.serviciotecnico.LimpiezaBaseDatos;
import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.EstadoOrden;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.RepuestoUtilizadoRepository;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RepuestoUtilizadoControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private RepuestoUtilizadoRepository repuestoUtilizadoRepository;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    // Simula los otros microservicios: los tests no dependen de que estén levantados
    @MockitoBean
    private RestTemplate restTemplate;

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
        when(restTemplate.getForObject(any(URI.class), eq(Map.class))).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 20, "stockDisponible", 10, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 14000, "idProveedores", List.of(1))));
    }

    private RepuestoUtilizado nuevoRepuestoUtilizado(int variante) {
        return switch (variante) {
            case 1 -> new RepuestoUtilizado(null, 20L, 1, 15990, LocalDateTime.of(2026, 10, 8, 10, 0), ordenTrabajo);
            case 2 -> new RepuestoUtilizado(null, 21L, 2, 4990, LocalDateTime.of(2026, 10, 8, 10, 30), ordenTrabajo);
            default -> new RepuestoUtilizado(null, 20L, 2, 15990, LocalDateTime.of(2026, 10, 8, 11, 0), ordenTrabajo);
        };
    }

    @Test
    void crearYListarRepuestosUtilizados() throws Exception {
        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRepuestoUtilizado(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRepuestoUtilizado").exists())
                .andExpect(jsonPath("$.cantidad").value(1));

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRepuestoUtilizado(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/repuestos-utilizados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/repuestos-utilizados/ordenTrabajo/" + ordenTrabajo.getIdOrdenTrabajo()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.repuestoUtilizadoList", hasSize(2)));
    }

    @Test
    void actualizarRepuestoUtilizado() throws Exception {
        RepuestoUtilizado guardado = repuestoUtilizadoRepository.save(nuevoRepuestoUtilizado(1));

        mockMvc.perform(put("/api/v1/repuestos-utilizados/" + guardado.getIdRepuestoUtilizado())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRepuestoUtilizado(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRepuestoUtilizado").value(guardado.getIdRepuestoUtilizado().intValue()))
                .andExpect(jsonPath("$.cantidad").value(2))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.repuestosUtilizados.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        RepuestoUtilizado guardado = repuestoUtilizadoRepository.save(nuevoRepuestoUtilizado(1));

        mockMvc.perform(delete("/api/v1/repuestos-utilizados/" + guardado.getIdRepuestoUtilizado()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/repuestos-utilizados/" + guardado.getIdRepuestoUtilizado()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearRepuestoUtilizadoSinStockSuficiente() throws Exception {
        when(restTemplate.getForObject(any(URI.class), eq(Map.class))).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 20, "stockDisponible", 1, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 14000, "idProveedores", List.of(1))));

        mockMvc.perform(post("/api/v1/repuestos-utilizados")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRepuestoUtilizado(2))))
                .andExpect(status().isConflict());

        mockMvc.perform(get("/api/v1/repuestos-utilizados"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist());
    }
}
