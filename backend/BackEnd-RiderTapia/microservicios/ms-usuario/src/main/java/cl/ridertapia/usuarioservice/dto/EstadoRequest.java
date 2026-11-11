package cl.ridertapia.usuarioservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

/** Activa o desactiva una cuenta. */
public record EstadoRequest(
        @NotNull(message = "Indica si la cuenta queda activa")
        @Schema(example = "false") Boolean activo
) {
}
