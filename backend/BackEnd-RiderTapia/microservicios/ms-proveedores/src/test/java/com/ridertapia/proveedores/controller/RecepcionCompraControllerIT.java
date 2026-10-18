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
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RecepcionCompraControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private RecepcionCompraRepository recepcionCompraRepository;

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

    private RecepcionCompra nuevoRecepcionCompra(int variante) {
        return switch (variante) {
            case 1 -> new RecepcionCompra(null, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, ordenCompra);
            case 2 -> new RecepcionCompra(null, LocalDateTime.of(2026, 10, 16, 9, 30), TipoDocumentoRecepcion.GUIA_DESPACHO, "GD-4410", null, 2L, ordenCompra);
            default -> new RecepcionCompra(null, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88124", "Factura corregida", 2L, ordenCompra);
        };
    }

    @Test
    void crearYListarRecepcionesCompra() throws Exception {
        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRecepcionCompra(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idRecepcionCompra").exists())
                .andExpect(jsonPath("$.numeroDocumento").value("FAC-88123"));

        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRecepcionCompra(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/recepciones-compra"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.recepcionCompraList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/recepciones-compra/ordenCompra/" + ordenCompra.getIdOrdenCompra()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.recepcionCompraList", hasSize(2)));
    }

    @Test
    void actualizarRecepcionCompra() throws Exception {
        RecepcionCompra guardado = recepcionCompraRepository.save(nuevoRecepcionCompra(1));

        mockMvc.perform(put("/api/v1/recepciones-compra/" + guardado.getIdRecepcionCompra())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRecepcionCompra(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idRecepcionCompra").value(guardado.getIdRecepcionCompra().intValue()))
                .andExpect(jsonPath("$.numeroDocumento").value("FAC-88124"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.recepcionesCompra.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        RecepcionCompra guardado = recepcionCompraRepository.save(nuevoRecepcionCompra(1));

        mockMvc.perform(delete("/api/v1/recepciones-compra/" + guardado.getIdRecepcionCompra()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/recepciones-compra/" + guardado.getIdRecepcionCompra()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearRecepcionCompraDeOrdenEnBorrador() throws Exception {
        ordenCompra.setEstado(EstadoOrdenCompra.BORRADOR);
        ordenCompra = ordenCompraRepository.save(ordenCompra);

        mockMvc.perform(post("/api/v1/recepciones-compra")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoRecepcionCompra(1))))
                .andExpect(status().isConflict());
    }
}
