package cl.ridertapia.reportesservice.service;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class CriterioVentaTest {

    @Test
    @DisplayName("Reconoce los estados configurados sin importar mayúsculas ni espacios")
    void esVenta() {
        CriterioVenta criterio = new CriterioVenta(" pagado , Entregado ,, COMPLETADO ");

        assertThat(criterio.esVenta("PAGADO")).isTrue();
        assertThat(criterio.esVenta("entregado")).isTrue();
        assertThat(criterio.esVenta("  Completado ")).isTrue();
        assertThat(criterio.estados()).containsExactlyInAnyOrder("PAGADO", "ENTREGADO", "COMPLETADO");
    }

    @Test
    @DisplayName("Los estados no configurados y el nulo no cuentan como venta")
    void noEsVenta() {
        CriterioVenta criterio = new CriterioVenta("PAGADO");

        assertThat(criterio.esVenta("PENDIENTE")).isFalse();
        assertThat(criterio.esVenta("")).isFalse();
        assertThat(criterio.esVenta(null)).isFalse();
    }
}
