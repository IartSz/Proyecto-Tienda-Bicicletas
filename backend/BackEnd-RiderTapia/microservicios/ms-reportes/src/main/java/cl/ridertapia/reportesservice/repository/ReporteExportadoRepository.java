package cl.ridertapia.reportesservice.repository;

import cl.ridertapia.reportesservice.model.ReporteExportado;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReporteExportadoRepository extends JpaRepository<ReporteExportado, Long> {

    List<ReporteExportado> findAllByOrderByFechaDesc();
}
