package cl.ridertapia.reportesservice.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public record DetallePedidoDto(
        Long idDetallePedido,
        Long idVariante,
        Integer cantidad,
        Integer precioUnitario,
        Integer subtotal,
        PedidoDto pedido
) {
}
