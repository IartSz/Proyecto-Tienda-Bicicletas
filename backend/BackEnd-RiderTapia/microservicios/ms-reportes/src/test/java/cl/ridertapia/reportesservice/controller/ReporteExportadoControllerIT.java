package cl.ridertapia.reportesservice.controller;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import cl.ridertapia.reportesservice.dto.ReporteExportadoRequest;
import cl.ridertapia.reportesservice.repository.ReporteExportadoRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "spring.jpa.hibernate.ddl-auto=create-drop")
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
class ReporteExportadoControllerIT {

    private static final String RUTA = "/api/v1/reportes-exportados";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ReporteExportadoRepository repository;

    @BeforeEach
    void limpiar() {
        repository.deleteAll();
    }

    private String json(ReporteExportadoRequest request) throws Exception {
        return objectMapper.writeValueAsString(request);
    }

    @Test
    void testGuardarListarYObtener() throws Exception {
        String filas = "[[\"Mes\",\"Ventas\"],[\"Octubre\",120000]]";
        String location = mockMvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ReporteExportadoRequest(" Ventas por mes ", "ventas", "Todas", "excel", filas))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.nombre").value("Ventas por mes"))
                .andExpect(jsonPath("$.fecha").exists())
                .andReturn().getResponse().getHeader("Location");

        mockMvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ReporteExportadoRequest("Inventario", "inventario", null, "pdf", "[[\"SKU\"]]"))))
                .andExpect(status().isCreated());

        mockMvc.perform(get(RUTA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.reportesExportados", hasSize(2)))
                .andExpect(jsonPath("$._embedded.reportesExportados[0].nombre").value("Inventario"));

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.filas").value(filas));
    }

    @Test
    void testDatosInvalidos() throws Exception {
        mockMvc.perform(post(RUTA).contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ReporteExportadoRequest("", "ventas", null, "word", "[]"))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.mensaje", containsString("formato")));
    }

    @Test
    void testReporteInexistente() throws Exception {
        mockMvc.perform(get(RUTA + "/999"))
                .andExpect(status().isNotFound());
    }
}
