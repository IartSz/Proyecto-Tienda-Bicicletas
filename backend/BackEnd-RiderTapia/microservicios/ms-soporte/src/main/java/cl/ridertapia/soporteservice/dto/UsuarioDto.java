package cl.ridertapia.soporteservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record UsuarioDto(String rutUsuario, String emailCliente, String rol) {
}
