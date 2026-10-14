package cl.ridertapia.reportesservice.repository;

import static org.assertj.core.api.Assertions.assertThat;

import cl.ridertapia.reportesservice.model.ProductoMasVendido;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

@DataJpaTest
class ProductoMasVendidoRepositoryTest {

    @Autowired
    private ProductoMasVendidoRepository repository;

    private ProductoMasVendido fila(long idReporte, long idVariante, int cantidad, long total) {
        return ProductoMasVendido.builder().idReporte(idReporte).idVariante(idVariante)
                .cantidadVendida(cantidad).totalVendido(total).build();
    }

    @BeforeEach
    void preparar() {
        repository.save(fila(1, 100, 3, 9000));
        repository.save(fila(1, 200, 5, 2000));
        repository.save(fila(1, 300, 3, 12000));
        repository.save(fila(2, 100, 1, 1000));
    }

    @Test
    @DisplayName("Ordena por unidades y, en empate, por monto vendido")
    void ordenado() {
        assertThat(repository.findByIdReporteOrderByCantidadVendidaDescTotalVendidoDesc(1L))
                .extracting(ProductoMasVendido::getIdVariante).containsExactly(200L, 300L, 100L);
    }

    @Test
    @DisplayName("Solo trae las filas del reporte pedido")
    void soloDelReporte() {
        assertThat(repository.findByIdReporteOrderByCantidadVendidaDescTotalVendidoDesc(2L)).hasSize(1);
        assertThat(repository.findByIdReporteOrderByCantidadVendidaDescTotalVendidoDesc(9L)).isEmpty();
    }

    @Test
    @DisplayName("deleteByIdReporte borra solo el ranking de ese reporte")
    void borrarPorReporte() {
        repository.deleteByIdReporte(1L);

        assertThat(repository.findByIdReporteOrderByCantidadVendidaDescTotalVendidoDesc(1L)).isEmpty();
        assertThat(repository.findByIdReporteOrderByCantidadVendidaDescTotalVendidoDesc(2L)).hasSize(1);
    }
}
