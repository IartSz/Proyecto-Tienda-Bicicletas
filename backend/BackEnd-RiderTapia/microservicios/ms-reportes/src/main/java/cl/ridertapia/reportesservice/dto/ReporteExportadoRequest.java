package cl.ridertapia.reportesservice.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Datos de un reporte exportado desde el panel. */
public record ReporteExportadoRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 150, message = "El nombre no puede superar los 150 caracteres")
        @Schema(example = "Ventas por mes") String nombre,

        @NotBlank(message = "El tipo es obligatorio")
        @Size(max = 30, message = "El tipo no puede superar los 30 caracteres")
        @Schema(example = "ventas") String tipo,

        @Size(max = 100, message = "La categoría no puede superar los 100 caracteres")
        @Schema(example = "Todas") String categoria,

        @NotBlank(message = "El formato es obligatorio")
        @Pattern(regexp = "^(excel|pdf)$", message = "El formato debe ser excel o pdf")
        @Schema(example = "excel") String formato,

        @NotBlank(message = "Las filas son obligatorias")
        @Schema(example = "[[\"Mes\",\"Ventas\"],[\"Octubre\",120000]]") String filas
) {
}
