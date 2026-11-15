package com.ridertapia.productos.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.PathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ArchivoImagenService {

    public static final long TAMANO_MAXIMO = 2 * 1024 * 1024;

    private static final Map<String, String> EXTENSIONES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp");

    @Value("${app.imagenes.carpeta:uploads/productos}")
    private String carpeta;

    @Value("${app.imagenes.url-base:http://localhost:9000}")
    private String urlBase;

    // Guarda el archivo y devuelve la url publica
    public String guardar(MultipartFile archivo) {
        if (archivo == null || archivo.isEmpty()) {
            throw new IllegalArgumentException("Selecciona una imagen.");
        }
        String extension = EXTENSIONES.get(archivo.getContentType());
        if (extension == null) {
            throw new IllegalArgumentException("Formato no permitido. Usa JPG, PNG o WEBP.");
        }
        if (archivo.getSize() > TAMANO_MAXIMO) {
            throw new IllegalArgumentException("La imagen supera los 2 MB.");
        }

        String nombre = UUID.randomUUID() + extension;
        try (InputStream entrada = archivo.getInputStream()) {
            Path destino = directorio();
            Files.createDirectories(destino);
            Files.copy(entrada, destino.resolve(nombre), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo guardar la imagen.", e);
        }
        return urlBase + "/api/v1/imagenes/archivos/" + nombre;
    }

    public Optional<Resource> cargar(String nombre) {
        if (nombre == null || nombre.contains("..") || nombre.contains("/") || nombre.contains("\\")) {
            return Optional.empty();
        }
        Path ruta = directorio().resolve(nombre);
        return Files.isRegularFile(ruta) ? Optional.of(new PathResource(ruta)) : Optional.empty();
    }

    public String tipoDe(String nombre) {
        return EXTENSIONES.entrySet().stream()
                .filter(e -> nombre.endsWith(e.getValue()))
                .map(Map.Entry::getKey)
                .findFirst()
                .orElse("application/octet-stream");
    }

    private Path directorio() {
        return Paths.get(carpeta).toAbsolutePath().normalize();
    }
}
