package cl.ridertapia.clienteservice.service;

import cl.ridertapia.clienteservice.dto.UsuarioDto;
import cl.ridertapia.clienteservice.exception.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/** Consulta a usuario-service (por HTTP) para comprobar que existe la cuenta de un RUT. */
@Service
public class UsuarioRemotoService {

    /** Ruta de la cuenta en usuario-service. Si allá cambia (por ejemplo a /api/v1/usuarios), se cambia solo aquí. */
    public static final String RUTA_USUARIO = "/api/v1/usuarios/{rut}";

    private final RestClient restClient;

    @Autowired
    public UsuarioRemotoService(@Value("${usuario.service.url}") String baseUrl) {
        // Timeouts cortos para no dejar colgada la petición si usuario-service no responde
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);
        factory.setReadTimeout(3000);
        this.restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    /** Constructor para las pruebas: recibe un RestClient ya armado (por ejemplo, uno simulado). */
    UsuarioRemotoService(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Consulta la cuenta por RUT.
     *
     * @throws ApiException 404 si no existe la cuenta, 503 si usuario-service no está disponible
     */
    public UsuarioDto obtenerPorRut(String rut) {
        try {
            UsuarioDto usuario = restClient.get()
                    .uri(RUTA_USUARIO, rut)
                    .retrieve()
                    .body(UsuarioDto.class);
            if (usuario == null) {
                throw ApiException.noEncontrado("No existe una cuenta de usuario con el RUT " + rut);
            }
            return usuario;
        } catch (HttpClientErrorException.NotFound e) {
            throw ApiException.noEncontrado("No existe una cuenta de usuario con el RUT " + rut);
        } catch (RestClientException e) {
            throw ApiException.servicioNoDisponible(
                    "No se pudo validar el RUT: el servicio de usuarios no está disponible");
        }
    }
}
