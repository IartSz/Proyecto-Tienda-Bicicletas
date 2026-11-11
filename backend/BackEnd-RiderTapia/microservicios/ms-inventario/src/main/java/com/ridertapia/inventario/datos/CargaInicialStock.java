package com.ridertapia.inventario.datos;

import java.io.InputStream;
import java.net.URI;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.inventario.model.ItemInventario;
import com.ridertapia.inventario.repository.ItemInventarioRepository;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

// Al arrancar, si no hay stock, lo carga para cada variante del catálogo.
// Los idVariante los genera ms-productos: se buscan por SKU.
// Se apaga con ridertapia.carga-inicial=false (los tests lo usan).
@Component
@ConditionalOnProperty(name = "ridertapia.carga-inicial", havingValue = "true", matchIfMissing = true)
public class CargaInicialStock implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaInicialStock.class);
    private static final String ARCHIVO = "datos/stock-inicial.json";
    private static final int INTENTOS = 30;

    public record StockInicial(String sku, Integer stockDisponible, Integer stockMinimo) {
    }

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final ItemInventarioRepository itemInventarioRepository;

    @Value("${ms.productos.variantes-url}")
    private String varianteUrl;

    public CargaInicialStock(ObjectMapper objectMapper, RestTemplate restTemplate,
            ItemInventarioRepository itemInventarioRepository) {
        this.objectMapper = objectMapper;
        this.restTemplate = restTemplate;
        this.itemInventarioRepository = itemInventarioRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        if (itemInventarioRepository.count() > 0) {
            log.info("Stock inicial: la base ya tiene datos, no se carga nada.");
            return;
        }

        List<StockInicial> stock;
        try (InputStream entrada = new ClassPathResource(ARCHIVO).getInputStream()) {
            stock = objectMapper.readValue(entrada, new TypeReference<List<StockInicial>>() { });
        }

        // ms-productos puede seguir cargando su catálogo: se espera hasta tener todas las variantes
        Map<String, Long> idPorSku = new HashMap<>();
        for (int intento = 1; intento <= INTENTOS && idPorSku.size() < stock.size(); intento++) {
            idPorSku = leerVariantes();
            if (idPorSku.size() < stock.size()) {
                Thread.sleep(2000);
            }
        }
        if (idPorSku.isEmpty()) {
            log.warn("Stock inicial: ms-productos no respondió. Se intentará en el próximo arranque.");
            return;
        }

        int cargados = 0;
        for (StockInicial s : stock) {
            Long idVariante = idPorSku.get(s.sku());
            if (idVariante == null) {
                continue;
            }
            ItemInventario item = new ItemInventario();
            item.setIdVariante(idVariante);
            item.setStockDisponible(s.stockDisponible());
            item.setStockReservado(0);
            item.setStockMinimo(s.stockMinimo());
            item.setCostoPromedio(0);
            item.setFechaActualizacion(LocalDateTime.now());
            item.setIdProveedores(new ArrayList<>());
            itemInventarioRepository.save(item);
            cargados++;
        }
        log.info("Stock inicial cargado: {} de {} variantes.", cargados, stock.size());
    }

    // GET /api/v1/variantes de ms-productos (formato HATEOAS) -> sku: id
    private Map<String, Long> leerVariantes() {
        Map<String, Long> resultado = new HashMap<>();
        try {
            String respuesta = restTemplate.getForObject(URI.create(varianteUrl), String.class);
            JsonNode embebido = objectMapper.readTree(respuesta).path("_embedded");
            for (JsonNode lista : embebido) {
                for (JsonNode variante : lista) {
                    resultado.put(variante.path("sku").asString(), variante.path("idVarianteProducto").asLong());
                }
            }
        } catch (RestClientException e) {
            log.info("Stock inicial: esperando a ms-productos...");
        }
        return resultado;
    }
}
