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
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OrdenCompraControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Proveedor proveedor;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        proveedor = proveedorRepository.save(new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
    }

    private OrdenCompra nuevoOrdenCompra(int variante) {
        return switch (variante) {
            case 1 -> new OrdenCompra(null, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, proveedor);
            case 2 -> new OrdenCompra(null, "OC-00002", LocalDateTime.of(2026, 10, 8, 10, 0), null, EstadoOrdenCompra.BORRADOR, 95000, 18050, 113050, null, 1L, proveedor);
            default -> new OrdenCompra(null, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 16), EstadoOrdenCompra.ENVIADA, 1010000, 191900, 1201900, "Reposición con precio ajustado", 1L, proveedor);
        };
    }

    @Test
    void crearYListarOrdenesCompra() throws Exception {
        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenCompra(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idOrdenCompra").exists())
                .andExpect(jsonPath("$.total").value(1237600));

        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenCompra(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/ordenes-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/ordenes-compra/proveedor/" + proveedor.getIdProveedor()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(2)));
        mockMvc.perform(get("/api/v1/ordenes-compra/estado/BORRADOR"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.ordenCompraList", hasSize(1)));
    }

    @Test
    void actualizarOrdenCompra() throws Exception {
        OrdenCompra guardado = ordenCompraRepository.save(nuevoOrdenCompra(1));

        mockMvc.perform(put("/api/v1/ordenes-compra/" + guardado.getIdOrdenCompra())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoOrdenCompra(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idOrdenCompra").value(guardado.getIdOrdenCompra().intValue()))
                .andExpect(jsonPath("$.total").value(1201900))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.ordenesCompra.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        OrdenCompra guardado = ordenCompraRepository.save(nuevoOrdenCompra(1));

        mockMvc.perform(delete("/api/v1/ordenes-compra/" + guardado.getIdOrdenCompra()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/ordenes-compra/" + guardado.getIdOrdenCompra()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearOrdenCompraSinNumeroNiEstado() throws Exception {
        OrdenCompra orden = nuevoOrdenCompra(2);
        orden.setNumero(null);
        orden.setEstado(null);
        orden.setIva(null);
        orden.setTotal(null);

        mockMvc.perform(post("/api/v1/ordenes-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(orden)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.numero").exists())
                .andExpect(jsonPath("$.estado").value("BORRADOR"))
                .andExpect(jsonPath("$.iva").value(18050))
                .andExpect(jsonPath("$.total").value(113050));
    }
}
