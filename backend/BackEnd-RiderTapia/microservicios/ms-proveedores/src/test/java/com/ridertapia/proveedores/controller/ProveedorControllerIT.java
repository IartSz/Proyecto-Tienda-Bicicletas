package com.ridertapia.proveedores.controller;

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

import com.ridertapia.proveedores.LimpiezaBaseDatos;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProveedorRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProveedorControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private ProveedorRepository proveedorRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
    }

    private Proveedor nuevoProveedor(int variante) {
        return switch (variante) {
            case 1 -> new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true);
            case 2 -> new Proveedor(null, "77987654-3", "Importadora Ruedas del Sur Ltda.", null, null, "contacto@ruedasdelsur.cl", "412345678", "Calle Colo Colo 456", "Concepción", null, true);
            default -> new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "229998877", "Av. Vicuña Mackenna 1500", "Santiago", "Pedro Rojas", false);
        };
    }

    @Test
    void crearYListarProveedores() throws Exception {
        mockMvc.perform(post("/api/v1/proveedores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProveedor(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idProveedor").exists())
                .andExpect(jsonPath("$.telefono").value("223456789"));

        mockMvc.perform(post("/api/v1/proveedores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProveedor(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/proveedores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.proveedorList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/proveedores/rut/77987654-3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.rut").value("77987654-3"));
    }

    @Test
    void actualizarProveedor() throws Exception {
        Proveedor guardado = proveedorRepository.save(nuevoProveedor(1));

        mockMvc.perform(put("/api/v1/proveedores/" + guardado.getIdProveedor())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProveedor(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProveedor").value(guardado.getIdProveedor().intValue()))
                .andExpect(jsonPath("$.telefono").value("229998877"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.proveedores.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        Proveedor guardado = proveedorRepository.save(nuevoProveedor(1));

        mockMvc.perform(delete("/api/v1/proveedores/" + guardado.getIdProveedor()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/proveedores/" + guardado.getIdProveedor()))
                .andExpect(status().isNotFound());
    }
}
