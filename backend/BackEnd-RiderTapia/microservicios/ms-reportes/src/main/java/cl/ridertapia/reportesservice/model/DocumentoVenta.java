package cl.ridertapia.reportesservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/** Boleta o factura emitida para un pedido. Un pedido tiene como máximo un documento. */
@Entity
@Table(name = "documentos_venta",
        uniqueConstraints = @UniqueConstraint(columnNames = {"tipo", "numero"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class DocumentoVenta {

    public enum Tipo { BOLETA, FACTURA }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDocumento;

    // Correlativo propio de cada tipo: boleta 1, 2, 3... y factura 1, 2, 3...
    @Column(nullable = false)
    private Long numero;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo;

    @Column(name = "id_pedido", nullable = false, unique = true)
    private Long idPedido;

    // Viene del pedido; puede ser nulo en ventas de visitantes
    @Column(name = "id_cliente")
    private Long idCliente;

    @Column(nullable = false)
    private LocalDateTime fechaEmision;

    // Montos en pesos. El total ya incluye IVA (19%): neto + iva = total
    @Column(nullable = false)
    private Integer neto;

    @Column(nullable = false)
    private Integer iva;

    @Column(nullable = false)
    private Integer total;
}
