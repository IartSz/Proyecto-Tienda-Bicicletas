package com.ridertapia.proveedores.controller;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Arrays;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.service.ProveedorService;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@WebMvcTest(ProveedorController.class)
@ActiveProfiles("test")
class ProveedorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProveedorService proveedorService;

    private final ObjectMapper objectMapper = JsonMapper.builder().build();

    private Proveedor proveedor;

    @BeforeEach
    void setUp() {
        proveedor = new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "223456789", "Av. Vicuña Mackenna 1234", "Santiago", "Carolina Muñoz", true);
    }

    @Test
    void listarProveedores() throws Exception {
        Proveedor otro = new Proveedor(2L, "77987654-3", "Importadora Ruedas del Sur Ltda.", null, null, "contacto@ruedasdelsur.cl", "412345678", "Calle Colo Colo 456", "Concepción", null, true);
        when(proveedorService.listarProveedores()).thenReturn(Arrays.asList(proveedor, otro));

        mockMvc.perform(get("/api/v1/proveedores"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$._embedded.proveedorList", hasSize(2)))
                .andExpect(jsonPath("$._embedded.proveedorList[0].rut").exists())
                .andExpect(jsonPath("$._embedded.proveedorList[1].rut").exists())
                .andExpect(jsonPath("$._embedded.proveedorList[0]._links.self.href").exists())
                .andExpect(jsonPath("$._links.self.href").exists());
    }

    @Test
    void obtenerPorIdExistente() throws Exception {
        when(proveedorService.findById(1L)).thenReturn(Optional.of(proveedor));

        mockMvc.perform(get("/api/v1/proveedores/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProveedor").value(1))
                .andExpect(jsonPath("$.rut").value("76123456-7"))
                .andExpect(jsonPath("$.razonSocial").value("Distribuidora Andes Bike SpA"))
                .andExpect(jsonPath("$.nombreFantasia").value("Andes Bike"))
                .andExpect(jsonPath("$.giro").value("Venta al por mayor de bicicletas y repuestos"))
                .andExpect(jsonPath("$.email").value("ventas@andesbike.cl"))
                .andExpect(jsonPath("$.telefono").value("223456789"))
                .andExpect(jsonPath("$.direccion").value("Av. Vicuña Mackenna 1234"))
                .andExpect(jsonPath("$.comuna").value("Santiago"))
                .andExpect(jsonPath("$.nombreContacto").value("Carolina Muñoz"))
                .andExpect(jsonPath("$.activo").value(true))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.proveedores.href").exists());
    }

    @Test
    void obtenerPorIdNoExistente() throws Exception {
        when(proveedorService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/v1/proveedores/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void obtenerPorRutExistente() throws Exception {
        when(proveedorService.findByRut("76123456-7")).thenReturn(proveedor);

        mockMvc.perform(get("/api/v1/proveedores/rut/76123456-7"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.idProveedor").value(1))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.proveedores.href").exists());
    }

    @Test
    void obtenerPorRutNoExistente() throws Exception {
        when(proveedorService.findByRut("no-existe")).thenReturn(null);

        mockMvc.perform(get("/api/v1/proveedores/rut/no-existe"))
                .andExpect(status().isNotFound());
    }

    @Test
    void crearProveedor() throws Exception {
        when(proveedorService.guardarProveedor(any(Proveedor.class))).thenReturn(proveedor);

        mockMvc.perform(post("/api/v1/proveedores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(proveedor)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.idProveedor").value(1))
                .andExpect(jsonPath("$.telefono").value("223456789"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.proveedores.href").exists());

        verify(proveedorService, times(1)).guardarProveedor(any(Proveedor.class));
    }

    @Test
    void crearProveedorDuplicado() throws Exception {
        when(proveedorService.guardarProveedor(any(Proveedor.class)))
                .thenThrow(new DataIntegrityViolationException("valor duplicado"));

        mockMvc.perform(post("/api/v1/proveedores")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(proveedor)))
                .andExpect(status().isConflict());
    }

    @Test
    void actualizarProveedorExistente() throws Exception {
        Proveedor actualizado = new Proveedor(1L, "76123456-7", "Distribuidora Andes Bike SpA", "Andes Bike", "Venta al por mayor de bicicletas y repuestos", "ventas@andesbike.cl", "229998877", "Av. Vicuña Mackenna 1500", "Santiago", "Pedro Rojas", false);
        when(proveedorService.actualizarProveedor(eq(1L), any(Proveedor.class))).thenReturn(actualizado);

        mockMvc.perform(put("/api/v1/proveedores/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(actualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.telefono").value("229998877"))
                .andExpect(jsonPath("$._links.self.href").exists())
                .andExpect(jsonPath("$._links.proveedores.href").exists());
    }

    @Test
    void actualizarProveedorNoExistente() throws Exception {
        when(proveedorService.actualizarProveedor(eq(99L), any(Proveedor.class)))
                .thenThrow(new RuntimeException("Proveedor no encontrado con id: 99"));

        mockMvc.perform(put("/api/v1/proveedores/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(proveedor)))
                .andExpect(status().isNotFound());
    }

    @Test
    void eliminarProveedor() throws Exception {
        doNothing().when(proveedorService).eliminarProveedor(1L);

        mockMvc.perform(delete("/api/v1/proveedores/1"))
                .andExpect(status().isNoContent());

        verify(proveedorService, times(1)).eliminarProveedor(1L);
    }

    @Test
    void eliminarProveedorEnUso() throws Exception {
        doThrow(new DataIntegrityViolationException("en uso")).when(proveedorService).eliminarProveedor(1L);

        mockMvc.perform(delete("/api/v1/proveedores/1"))
                .andExpect(status().isConflict());
    }
}
