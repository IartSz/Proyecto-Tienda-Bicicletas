package cl.ridertapia.reportesservice.service;

import cl.ridertapia.reportesservice.dto.ReporteExportadoRequest;
import cl.ridertapia.reportesservice.exception.ApiException;
import cl.ridertapia.reportesservice.model.ReporteExportado;
import cl.ridertapia.reportesservice.repository.ReporteExportadoRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReporteExportadoService {

    private final ReporteExportadoRepository repository;

    @Transactional
    public ReporteExportado guardar(ReporteExportadoRequest request) {
        return repository.save(ReporteExportado.builder()
                .nombre(request.nombre().trim())
                .tipo(request.tipo())
                .categoria(request.categoria())
                .formato(request.formato())
                .fecha(LocalDateTime.now())
                .filas(request.filas())
                .build());
    }

    @Transactional(readOnly = true)
    public List<ReporteExportado> listar() {
        return repository.findAllByOrderByFechaDesc();
    }

    @Transactional(readOnly = true)
    public ReporteExportado findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> ApiException.noEncontrado("No existe el reporte exportado " + id));
    }
}
