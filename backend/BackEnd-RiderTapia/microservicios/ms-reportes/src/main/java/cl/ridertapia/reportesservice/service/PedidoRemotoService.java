package cl.ridertapia.reportesservice.service;

import cl.ridertapia.reportesservice.dto.DetallePedidoDto;
import cl.ridertapia.reportesservice.dto.PedidoDto;
import cl.ridertapia.reportesservice.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * Consulta al servicio de pedidos por HTTP.
 * Ese servicio responde con Spring HATEOAS: las listas llegan dentro de "_embedded" y cada
 * elemento trae "_links". Por eso las listas se leen como JSON genérico y se extraen a mano.
 */
@Service
public class PedidoRemotoService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Autowired
    public PedidoRemotoService(@Value("${pedidos.service.url}") String baseUrl, ObjectMapper objectMapper) {
        // Lectura con más margen porque los listados de pedidos pueden ser grandes
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(10000);
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
        this.objectMapper = objectMapper;
    }

    /** Constructor para las pruebas: recibe un RestClient ya armado (por ejemplo, uno simulado). */
    PedidoRemotoService(RestClient restClient, ObjectMapper objectMapper) {
        this.restClient = restClient;
        this.objectMapper = objectMapper;
    }

    /** Todos los pedidos (el servicio de pedidos no tiene filtro por fecha, se filtra aquí). */
    public List<PedidoDto> listarPedidos() {
        return extraerLista(consultar("/api/v1/pedidos"), PedidoDto.class);
    }

    /** Todos los detalles de todos los pedidos. */
    public List<DetallePedidoDto> listarDetalles() {
        return extraerLista(consultar("/api/v1/detalles"), DetallePedidoDto.class);
    }

    public List<DetallePedidoDto> listarDetallesPorPedido(Long idPedido) {
        return extraerLista(consultar("/api/v1/detalles/pedido/" + idPedido), DetallePedidoDto.class);
    }

    public PedidoDto obtenerPedido(Long idPedido) {
        try {
            PedidoDto pedido = restClient.get()
                    .uri("/api/v1/pedidos/{id}", idPedido)
                    .retrieve()
                    .body(PedidoDto.class);
            if (pedido == null) {
                throw ApiException.noEncontrado("No existe el pedido " + idPedido);
            }
            return pedido;
        } catch (HttpClientErrorException.NotFound e) {
            throw ApiException.noEncontrado("No existe el pedido " + idPedido);
        } catch (RestClientException e) {
            throw ApiException.servicioNoDisponible("No se pudo consultar el servicio de pedidos");
        }
    }

    private JsonNode consultar(String ruta) {
        try {
            return restClient.get().uri(ruta).retrieve().body(JsonNode.class);
        } catch (RestClientException e) {
            throw ApiException.servicioNoDisponible("No se pudo consultar el servicio de pedidos");
        }
    }

    /** Acepta un arreglo JSON simple o una respuesta HAL ("_embedded": { "xxxList": [ ... ] }). */
    private <T> List<T> extraerLista(JsonNode raiz, Class<T> tipo) {
        JsonNode arreglo = null;
        if (raiz != null) {
            if (raiz.isArray()) {
                arreglo = raiz;
            } else if (raiz.has("_embedded")) {
                Iterator<JsonNode> coleccionesEmbebidas = raiz.get("_embedded").elements();
                if (coleccionesEmbebidas.hasNext()) {
                    arreglo = coleccionesEmbebidas.next();
                }
            }
        }

        List<T> resultado = new ArrayList<>();
        // HAL omite "_embedded" cuando la lista está vacía, por eso una lista vacía es válida
        if (arreglo != null && arreglo.isArray()) {
            for (JsonNode elemento : arreglo) {
                resultado.add(objectMapper.convertValue(elemento, tipo));
            }
        }
        return resultado;
    }
}
