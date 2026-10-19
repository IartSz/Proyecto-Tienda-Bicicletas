package cl.ridertapia.reportesservice.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cl.ridertapia.reportesservice.model.ReporteVentas;
import java.time.LocalDate;
import java.time.LocalDateTime;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/** Usa una base H2 en memoria (reemplaza a MySQL solo durante la prueba). */
@DataJpaTest
class ReporteVentasRepositoryTest {

    private static final LocalDate DIA = LocalDate.of(2026, 10, 7);

    @Autowired
    private ReporteVentasRepository repository;

    private ReporteVentas reporte(ReporteVentas.Tipo tipo, LocalDate inicio, LocalDate fin) {
        return ReporteVentas.builder().tipo(tipo).fechaInicio(inicio).fechaFin(fin)
                .totalVentas(1000L).cantidadPedidos(1).fechaGeneracion(LocalDateTime.now()).build();
    }

    @BeforeEach
    void preparar() {
        repository.save(reporte(ReporteVentas.Tipo.DIARIO, DIA, DIA));
        repository.save(reporte(ReporteVentas.Tipo.DIARIO, DIA.minusDays(1), DIA.minusDays(1)));
        repository.save(reporte(ReporteVentas.Tipo.MENSUAL, DIA.withDayOfMonth(1), DIA.withDayOfMonth(31)));
    }

    @Test
    @DisplayName("Encuentra el reporte por tipo y período")
    void findByTipoAndFechas() {
        assertThat(repository.findByTipoAndFechaInicioAndFechaFin(ReporteVentas.Tipo.DIARIO, DIA, DIA)).isPresent();
        assertThat(repository.findByTipoAndFechaInicioAndFechaFin(ReporteVentas.Tipo.SEMANAL, DIA, DIA)).isEmpty();
    }

    @Test
    @DisplayName("Lista por tipo del más reciente al más antiguo")
    void findByTipoOrdenado() {
        assertThat(repository.findByTipoOrderByFechaInicioDesc(ReporteVentas.Tipo.DIARIO))
                .extracting(ReporteVentas::getFechaInicio).containsExactly(DIA, DIA.minusDays(1));
    }

    @Test
    @DisplayName("Lista todos del más reciente al más antiguo")
    void findAllOrdenado() {
        // El mensual empieza el día 1 del mes, por eso queda último
        assertThat(repository.findAllByOrderByFechaInicioDesc())
                .extracting(ReporteVentas::getFechaInicio)
                .containsExactly(DIA, DIA.minusDays(1), DIA.withDayOfMonth(1));
    }

    @Test
    @DisplayName("No permite dos reportes del mismo tipo y período")
    void periodoUnico() {
        ReporteVentas repetido = reporte(ReporteVentas.Tipo.DIARIO, DIA, DIA);

        assertThatThrownBy(() -> repository.saveAndFlush(repetido)).isInstanceOf(DataIntegrityViolationException.class);
    }
}
