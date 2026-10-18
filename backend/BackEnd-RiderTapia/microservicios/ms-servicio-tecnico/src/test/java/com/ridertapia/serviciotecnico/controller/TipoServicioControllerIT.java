package com.ridertapia.serviciotecnico.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.serviciotecnico.LimpiezaBaseDatos;
import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TipoServicioControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
    }

    private TipoServicio nuevoTipoServicio(int variante) {
        return switch (variante) {
            case 1 -> new TipoServicio(null, "Mantención básica", NivelServicio.BASICO, "Ajuste general y lubricación", "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión", 25000, 1, true);
            case 2 -> new TipoServicio(null, "Mantención mediana", NivelServicio.MEDIANO, "Básica más limpieza de transmisión", "Todo lo de la básica, limpieza profunda de transmisión y centrado de ruedas", 45000, 2, true);
            default -> new TipoServicio(null, "Mantención full", NivelServicio.FULL, "Desarme completo de la bicicleta", "Desarme completo, limpieza y engrase de rodamientos y purga de frenos", 90000, 4, true);
        };
    }

    @Test
    void crearYListarTiposServicio() throws Exception {
        mockMvc.perform(post("/api/v1/tipos-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoTipoServicio(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idTipoServicio").exists())
                .andExpect(jsonPath("$.precio").value(25000));

        mockMvc.perform(post("/api/v1/tipos-servicio")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoTipoServicio(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/tipos-servicio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.tipoServicioList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/tipos-servicio/nivel/MEDIANO"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.tipoServicioList", hasSize(1)));
    }

    @Test
    void actualizarTipoServicio() throws Exception {
        TipoServicio guardado = tipoServicioRepository.save(nuevoTipoServicio(1));

        mockMvc.perform(put("/api/v1/tipos-servicio/" + guardado.getIdTipoServicio())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoTipoServicio(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idTipoServicio").value(guardado.getIdTipoServicio().intValue()))
                .andExpect(jsonPath("$.precio").value(90000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.tiposServicio.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        TipoServicio guardado = tipoServicioRepository.save(nuevoTipoServicio(1));

        mockMvc.perform(delete("/api/v1/tipos-servicio/" + guardado.getIdTipoServicio()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/tipos-servicio/" + guardado.getIdTipoServicio()))
                .andExpect(status().isNotFound());
    }
}
