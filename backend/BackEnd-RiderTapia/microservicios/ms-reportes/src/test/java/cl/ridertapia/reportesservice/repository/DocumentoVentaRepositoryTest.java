package cl.ridertapia.reportesservice.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cl.ridertapia.reportesservice.model.DatosFactura;
import cl.ridertapia.reportesservice.model.DetalleDocumento;
import cl.ridertapia.reportesservice.model.DocumentoVenta;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

@DataJpaTest
class DocumentoVentaRepositoryTest {

    @Autowired
    private DocumentoVentaRepository documentoRepository;

    @Autowired
    private DetalleDocumentoRepository detalleRepository;

    @Autowired
    private DatosFacturaRepository datosFacturaRepository;

    private DocumentoVenta documento(DocumentoVenta.Tipo tipo, long numero, long idPedido, String rutCliente) {
        return DocumentoVenta.builder().tipo(tipo).numero(numero).idPedido(idPedido).rutCliente(rutCliente)
                .fechaEmision(LocalDateTime.now()).neto(10000).iva(1900).total(11900).build();
    }

    @BeforeEach
    void preparar() {
        documentoRepository.save(documento(DocumentoVenta.Tipo.BOLETA, 1, 10, "12345678-5"));
        documentoRepository.save(documento(DocumentoVenta.Tipo.BOLETA, 2, 11, "12345678-5"));
        documentoRepository.save(documento(DocumentoVenta.Tipo.FACTURA, 1, 12, "12342313-5"));
    }

    @Test
    @DisplayName("existsByIdPedido y findByIdPedido")
    void porPedido() {
        assertThat(documentoRepository.existsByIdPedido(10L)).isTrue();
        assertThat(documentoRepository.existsByIdPedido(99L)).isFalse();
        assertThat(documentoRepository.findByIdPedido(12L)).get()
                .extracting(DocumentoVenta::getTipo).isEqualTo(DocumentoVenta.Tipo.FACTURA);
    }

    @Test
    @DisplayName("Cada tipo tiene su propia numeración: boleta 1 y factura 1 conviven")
    void numeracionPorTipo() {
        assertThat(documentoRepository.findByTipoAndNumero(DocumentoVenta.Tipo.BOLETA, 1L)).isPresent();
        assertThat(documentoRepository.findByTipoAndNumero(DocumentoVenta.Tipo.FACTURA, 1L)).isPresent();
        assertThat(documentoRepository.findByTipoAndNumero(DocumentoVenta.Tipo.FACTURA, 2L)).isEmpty();
    }

    @Test
    @DisplayName("findTopByTipoOrderByNumeroDesc devuelve el último número de cada tipo")
    void ultimoNumero() {
        assertThat(documentoRepository.findTopByTipoOrderByNumeroDesc(DocumentoVenta.Tipo.BOLETA)).get()
                .extracting(DocumentoVenta::getNumero).isEqualTo(2L);
        assertThat(documentoRepository.findTopByTipoOrderByNumeroDesc(DocumentoVenta.Tipo.FACTURA)).get()
                .extracting(DocumentoVenta::getNumero).isEqualTo(1L);
    }

    @Test
    @DisplayName("findByTipo y findByRutCliente")
    void listados() {
        assertThat(documentoRepository.findByTipo(DocumentoVenta.Tipo.BOLETA)).hasSize(2);
        assertThat(documentoRepository.findByRutCliente("12345678-5")).hasSize(2);
        assertThat(documentoRepository.findByRutCliente("99999999-9")).isEmpty();
    }

    @Test
    @DisplayName("No permite dos documentos para el mismo pedido")
    void pedidoUnico() {
        DocumentoVenta repetido = documento(DocumentoVenta.Tipo.FACTURA, 5, 10, null);

        assertThatThrownBy(() -> documentoRepository.saveAndFlush(repetido))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("No permite repetir el número dentro del mismo tipo")
    void numeroUnicoPorTipo() {
        DocumentoVenta repetido = documento(DocumentoVenta.Tipo.BOLETA, 1, 50, null);

        assertThatThrownBy(() -> documentoRepository.saveAndFlush(repetido))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    @DisplayName("Un cliente nulo es válido (venta de visitante)")
    void clienteNulo() {
        DocumentoVenta visitante = documentoRepository.saveAndFlush(
                documento(DocumentoVenta.Tipo.BOLETA, 3, 60, null));

        assertThat(visitante.getIdDocumento()).isNotNull();
    }

    @Test
    @DisplayName("Guarda y recupera las líneas y los datos de factura de un documento")
    void lineasYDatosFactura() {
        Long idDocumento = documentoRepository.findByIdPedido(12L).orElseThrow().getIdDocumento();
        detalleRepository.save(DetalleDocumento.builder().idDocumento(idDocumento).idVariante(100L)
                .descripcion("Variante 100").cantidad(1).precioUnitario(11900).subtotal(11900).build());
        detalleRepository.save(DetalleDocumento.builder().idDocumento(idDocumento)
                .descripcion("Descuento aplicado").cantidad(1).precioUnitario(-500).subtotal(-500).build());
        datosFacturaRepository.save(DatosFactura.builder().idDocumento(idDocumento).rutEmpresa("76543210-3")
                .razonSocial("Ciclos del Sur SpA").giro("Venta").direccionEmpresa("Av. Colón 1234").build());

        assertThat(detalleRepository.findByIdDocumento(idDocumento)).hasSize(2);
        assertThat(detalleRepository.findByIdDocumento(999L)).isEmpty();
        assertThat(datosFacturaRepository.findByIdDocumento(idDocumento)).get()
                .extracting(DatosFactura::getRutEmpresa).isEqualTo("76543210-3");
    }
}
