package cl.ridertapia.reportesservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public record PedidoDto(
        Long idPedido,
        String numero,
        LocalDateTime fechaCreacion,
        String estado,
        String canal,
        Integer subtotal,
        Integer descuento,
        Integer total,
        String rutCliente
) {
}
