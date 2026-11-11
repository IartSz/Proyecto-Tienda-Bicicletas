package cl.ridertapia.reportesservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import cl.ridertapia.reportesservice.dto.ReporteExportadoRequest;
import cl.ridertapia.reportesservice.exception.ApiException;
import cl.ridertapia.reportesservice.model.ReporteExportado;
import cl.ridertapia.reportesservice.repository.ReporteExportadoRepository;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReporteExportadoServiceTest {

    @Mock
    private ReporteExportadoRepository repository;

    @InjectMocks
    private ReporteExportadoService service;

    @Test
    void guardarAsignaFechaYLimpiaNombre() {
        when(repository.save(any(ReporteExportado.class))).thenAnswer(inv -> inv.getArgument(0));

        ReporteExportado guardado = service.guardar(new ReporteExportadoRequest("  Top ventas ", "top", "Cascos", "pdf", "[]"));

        assertThat(guardado.getNombre()).isEqualTo("Top ventas");
        assertThat(guardado.getFecha()).isNotNull();
        assertThat(guardado.getFormato()).isEqualTo("pdf");
    }

    @Test
    void findByIdInexistenteLanza404() {
        when(repository.findById(5L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findById(5L)).isInstanceOf(ApiException.class);
    }
}
