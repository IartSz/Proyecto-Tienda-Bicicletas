package com.ridertapia.proveedores.controller;

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

import com.ridertapia.proveedores.LimpiezaBaseDatos;
import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DetalleOrdenCompraControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Proveedor proveedor;

    private OrdenCompra ordenCompra;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        proveedor = proveedorRepository.save(new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        ordenCompra = ordenCompraRepository.save(new OrdenCompra(null, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, proveedor));
    }

    private DetalleOrdenCompra nuevoDetalleOrdenCompra(int variante) {
        return switch (variante) {
            case 1 -> new DetalleOrdenCompra(null, 10L, 2, 0, 520000, ordenCompra);
            case 2 -> new DetalleOrdenCompra(null, 20L, 10, 0, 9500, ordenCompra);
            default -> new DetalleOrdenCompra(null, 10L, 2, 0, 505000, ordenCompra);
        };
    }

    @Test
    void crearYListarDetallesOrdenCompra() throws Exception {
        mockMvc.perform(post("/api/v1/detalles-orden-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleOrdenCompra(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDetalleOrdenCompra").exists())
                .andExpect(jsonPath("$.costoUnitario").value(520000));

        mockMvc.perform(post("/api/v1/detalles-orden-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleOrdenCompra(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/detalles-orden-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/detalles-orden-compra/ordenCompra/" + ordenCompra.getIdOrdenCompra()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleOrdenCompraList", hasSize(2)));
    }

    @Test
    void actualizarDetalleOrdenCompra() throws Exception {
        DetalleOrdenCompra guardado = detalleOrdenCompraRepository.save(nuevoDetalleOrdenCompra(1));

        mockMvc.perform(put("/api/v1/detalles-orden-compra/" + guardado.getIdDetalleOrdenCompra())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleOrdenCompra(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDetalleOrdenCompra").value(guardado.getIdDetalleOrdenCompra().intValue()))
                .andExpect(jsonPath("$.costoUnitario").value(505000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesOrdenCompra.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        DetalleOrdenCompra guardado = detalleOrdenCompraRepository.save(nuevoDetalleOrdenCompra(1));

        mockMvc.perform(delete("/api/v1/detalles-orden-compra/" + guardado.getIdDetalleOrdenCompra()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/detalles-orden-compra/" + guardado.getIdDetalleOrdenCompra()))
                .andExpect(status().isNotFound());
    }
}
