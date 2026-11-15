package com.ridertapia.productos.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.nio.file.Files;
import java.nio.file.Path;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

class ArchivoImagenServiceTest {

    @TempDir
    Path carpeta;

    private ArchivoImagenService archivoImagenService;

    @BeforeEach
    void setUp() {
        archivoImagenService = new ArchivoImagenService();
        ReflectionTestUtils.setField(archivoImagenService, "carpeta", carpeta.toString());
        ReflectionTestUtils.setField(archivoImagenService, "urlBase", "http://localhost:9000");
    }

    @Test
    void guardarImagen() throws Exception {
        MockMultipartFile archivo = new MockMultipartFile("archivo", "casco.png", "image/png", new byte[] { 1, 2, 3 });

        String url = archivoImagenService.guardar(archivo);

        assertTrue(url.startsWith("http://localhost:9000/api/v1/imagenes/archivos/"));
        assertTrue(url.endsWith(".png"));
        String nombre = url.substring(url.lastIndexOf('/') + 1);
        assertTrue(Files.exists(carpeta.resolve(nombre)));
    }

    @Test
    void guardarFormatoNoPermitido() {
        MockMultipartFile archivo = new MockMultipartFile("archivo", "nota.txt", "text/plain", new byte[] { 1 });

        assertThrows(IllegalArgumentException.class, () -> archivoImagenService.guardar(archivo));
    }

    @Test
    void guardarArchivoVacio() {
        MockMultipartFile archivo = new MockMultipartFile("archivo", "casco.jpg", "image/jpeg", new byte[0]);

        assertThrows(IllegalArgumentException.class, () -> archivoImagenService.guardar(archivo));
    }

    @Test
    void guardarArchivoMuyGrande() {
        byte[] datos = new byte[(int) ArchivoImagenService.TAMANO_MAXIMO + 1];
        MockMultipartFile archivo = new MockMultipartFile("archivo", "casco.jpg", "image/jpeg", datos);

        assertThrows(IllegalArgumentException.class, () -> archivoImagenService.guardar(archivo));
    }

    @Test
    void cargarImagenGuardada() {
        String url = archivoImagenService.guardar(new MockMultipartFile("archivo", "casco.jpg", "image/jpeg", new byte[] { 1 }));
        String nombre = url.substring(url.lastIndexOf('/') + 1);

        assertTrue(archivoImagenService.cargar(nombre).isPresent());
        assertEquals("image/jpeg", archivoImagenService.tipoDe(nombre));
    }

    @Test
    void cargarRutaInvalida() {
        assertTrue(archivoImagenService.cargar("../application.properties").isEmpty());
        assertTrue(archivoImagenService.cargar("nada.jpg").isEmpty());
    }
}
