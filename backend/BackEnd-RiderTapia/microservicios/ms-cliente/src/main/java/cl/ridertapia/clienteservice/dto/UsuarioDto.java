package cl.ridertapia.clienteservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** Lo que cliente-service necesita saber de la cuenta que devuelve usuario-service. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record UsuarioDto(String rutUsuario, String emailCliente, String rol) {
}
