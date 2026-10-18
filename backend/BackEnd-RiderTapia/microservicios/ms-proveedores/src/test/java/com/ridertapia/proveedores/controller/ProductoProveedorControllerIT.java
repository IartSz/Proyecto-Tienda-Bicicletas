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
import java.nio.charset.StandardCharsets;

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

import com.ridertapia.proveedores.LimpiezaBaseDatos;
import com.ridertapia.proveedores.model.ProductoProveedor;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProductoProveedorRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductoProveedorControllerIT {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private LimpiezaBaseDatos limpiezaBaseDatos;

    @Autowired
    private ProductoProveedorRepository productoProveedorRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    // Simula los otros microservicios: los tests no dependen de que estén levantados
    @MockitoBean
    private RestTemplate restTemplate;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Proveedor proveedor;

    @BeforeEach
    void prepararBase() {
        limpiezaBaseDatos.limpiar();
        proveedor = proveedorRepository.save(new Proveedor(null, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true));
        when(restTemplate.getForEntity(any(URI.class), eq(String.class))).thenReturn(ResponseEntity.ok("{}"));
    }

    private ProductoProveedor nuevoProductoProveedor(int variante) {
        return switch (variante) {
            case 1 -> new ProductoProveedor(null, 10L, "AB-MAR7-29", 520000, 7, true, proveedor);
            case 2 -> new ProductoProveedor(null, 20L, "AB-PAST-SH", 9500, 3, false, proveedor);
            default -> new ProductoProveedor(null, 10L, "AB-MAR7-29", 505000, 10, true, proveedor);
        };
    }

    @Test
    void crearYListarProductosProveedor() throws Exception {
        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(1))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idProductoProveedor").exists())
                .andExpect(jsonPath("$.costoUnitario").value(520000));

        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(2))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/productos-proveedor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(2)))
                .andExpect(jsonPath("$._links.self.href").exists());

        mockMvc.perform(get("/api/v1/productos-proveedor/idVariante/20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(1)));
        mockMvc.perform(get("/api/v1/productos-proveedor/proveedor/" + proveedor.getIdProveedor()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.productoProveedorList", hasSize(2)));
    }

    @Test
    void actualizarProductoProveedor() throws Exception {
        ProductoProveedor guardado = productoProveedorRepository.save(nuevoProductoProveedor(1));

        mockMvc.perform(put("/api/v1/productos-proveedor/" + guardado.getIdProductoProveedor())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(3))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProductoProveedor").value(guardado.getIdProductoProveedor().intValue()))
                .andExpect(jsonPath("$.costoUnitario").value(505000))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.productosProveedor.href").exists());
    }

    @Test
    void eliminarYVerificar404() throws Exception {
        ProductoProveedor guardado = productoProveedorRepository.save(nuevoProductoProveedor(1));

        mockMvc.perform(delete("/api/v1/productos-proveedor/" + guardado.getIdProductoProveedor()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/v1/productos-proveedor/" + guardado.getIdProductoProveedor()))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearProductoProveedorDuplicado() throws Exception {
        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(1))))
                .andExpect(status().isCreated());

        // El mismo proveedor no puede tener dos veces la misma variante
        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(1))))
                .andExpect(status().isConflict());
    }

    @Test
    void crearProductoProveedorConVarianteNoExistente() throws Exception {
        when(restTemplate.getForEntity(any(URI.class), eq(String.class)))
                .thenThrow(HttpClientErrorException.create(HttpStatus.NOT_FOUND, "Not Found",
                        new HttpHeaders(), new byte[0], StandardCharsets.UTF_8));

        mockMvc.perform(post("/api/v1/productos-proveedor")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoProductoProveedor(1))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/v1/productos-proveedor"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded").doesNotExist());
    }
}
