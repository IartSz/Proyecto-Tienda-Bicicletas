package com.ridertapia.proveedores.controller;

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

import com.ridertapia.proveedores.LimpiezaBaseDatos;
import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.DetalleRecepcion;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.model.TipoDocumentoRecepcion;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.DetalleRecepcionRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DetalleRecepcionControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private DetalleRecepcionRepository detalleRecepcionRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private RecepcionCompraRepository recepcionCompraRepository;

    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    // Simula los otros microservicios: los tests no dependen de que estén levantados
    @MockitoBean
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Proveedor proveedor;

    private OrdenCompra ordenCompra;

    private RecepcionCompra recepcionCompra;

    private DetalleOrdenCompra detalleOrdenCompra;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        proveedor = proveedorRepository.save(new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        ordenCompra = ordenCompraRepository.save(new OrdenCompra(null, "OC-00001", LocalDateTime.of(2026, 10, 8, 9, 0), LocalDate.of(2026, 10, 15), EstadoOrdenCompra.ENVIADA, 1040000, 197600, 1237600, "Reposición de bicicletas Marlin 7", 1L, proveedor));
        recepcionCompra = recepcionCompraRepository.save(new RecepcionCompra(null, LocalDateTime.of(2026, 10, 15, 11, 0), TipoDocumentoRecepcion.FACTURA, "FAC-88123", "Llegó todo en buen estado", 2L, ordenCompra));
        detalleOrdenCompra = detalleOrdenCompraRepository.save(new DetalleOrdenCompra(null, 10L, 2, 0, 520000, ordenCompra));
        when(restTemplate.getForObject(any(URI.class), eq(Map.class))).thenReturn(new HashMap<>(Map.of("idItemInventario", 5, "idVariante", 10, "stockDisponible", 3, "stockReservado", 0, "stockMinimo", 2, "costoPromedio", 500000, "idProveedores", List.of(1))));
    }

    private DetalleRecepcion nuevoDetalleRecepcion(int variante) {
        return switch (variante) {
            case 1 -> new DetalleRecepcion(null, 1, recepcionCompra, detalleOrdenCompra);
            case 2 -> new DetalleRecepcion(null, 1, recepcionCompra, detalleOrdenCompra);
            default -> new DetalleRecepcion(null, 2, recepcionCompra, detalleOrdenCompra);
        };
    }

    @Test
    void crearYListarDetallesRecepcion() throws Exception {
        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleRecepcion(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idDetalleRecepcion").exists())
                .andExpect(jsonPath("$.cantidadRecibida").value(1));

        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleRecepcion(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/detalles-recepcion"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/detalles-recepcion/recepcionCompra/" + recepcionCompra.getIdRecepcionCompra()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.detalleRecepcionList", hasSize(2)));
    }

    @Test
    void actualizarDetalleRecepcion() throws Exception {
        DetalleRecepcion guardado = detalleRecepcionRepository.save(nuevoDetalleRecepcion(1));

        mockMvc.perform(put("/api/v1/detalles-recepcion/" + guardado.getIdDetalleRecepcion())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleRecepcion(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idDetalleRecepcion").value(guardado.getIdDetalleRecepcion().intValue()))
                .andExpect(jsonPath("$.cantidadRecibida").value(2))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.detallesRecepcion.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        DetalleRecepcion guardado = detalleRecepcionRepository.save(nuevoDetalleRecepcion(1));

        mockMvc.perform(delete("/api/v1/detalles-recepcion/" + guardado.getIdDetalleRecepcion()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/detalles-recepcion/" + guardado.getIdDetalleRecepcion()))
                .andExpect(status().isNotFound());
    }

    @Test
    void recibirTodoDejaLaOrdenRecibida() throws Exception {
        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleRecepcion(3))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/ordenes-compra/" + ordenCompra.getIdOrdenCompra()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("RECIBIDA"));

        mockMvc.perform(get("/api/v1/detalles-orden-compra/" + detalleOrdenCompra.getIdDetalleOrdenCompra()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cantidadRecibida").value(2));

        // Ya no queda nada pendiente
        mockMvc.perform(post("/api/v1/detalles-recepcion")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoDetalleRecepcion(1))))
                .andExpect(status().isConflict());
    }
}
