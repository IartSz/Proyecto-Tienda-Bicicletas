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
import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.model.TipoBicicleta;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BicicletaControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private BicicletaRepository bicicletaRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
    }

    private Bicicleta nuevoBicicleta(int variante) {
        return switch (variante) {
            case 1 -> new Bicicleta(null, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Rojo", "WTU123456", "12345678-5");
            case 2 -> new Bicicleta(null, "Specialized", "Allez", TipoBicicleta.RUTA, "700c", "Negro", "WSB654321", "12345678-5");
            default -> new Bicicleta(null, "Trek", "Marlin 7", TipoBicicleta.MTB, "29", "Azul", "WTU123456", "12345678-5");
        };
    }

    @Test
    void crearYListarBicicletas() throws Exception {
        mockMvc.perform(post("/api/v1/bicicletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoBicicleta(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idBicicleta").exists())
                .andExpect(jsonPath("$.color").value("Rojo"));

        mockMvc.perform(post("/api/v1/bicicletas")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoBicicleta(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/bicicletas"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.bicicletaList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/bicicletas/rutCliente/12345678-5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.bicicletaList", hasSize(2)));
    }

    @Test
    void actualizarBicicleta() throws Exception {
        Bicicleta guardado = bicicletaRepository.save(nuevoBicicleta(1));

        mockMvc.perform(put("/api/v1/bicicletas/" + guardado.getIdBicicleta())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoBicicleta(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idBicicleta").value(guardado.getIdBicicleta().intValue()))
                .andExpect(jsonPath("$.color").value("Azul"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.bicicletas.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        Bicicleta guardado = bicicletaRepository.save(nuevoBicicleta(1));

        mockMvc.perform(delete("/api/v1/bicicletas/" + guardado.getIdBicicleta()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/bicicletas/" + guardado.getIdBicicleta()))
                .andExpect(status().isNotFound());
    }
}
