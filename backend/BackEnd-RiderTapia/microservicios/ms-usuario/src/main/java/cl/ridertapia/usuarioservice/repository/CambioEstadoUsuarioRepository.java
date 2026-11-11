package cl.ridertapia.usuarioservice.repository;

import cl.ridertapia.usuarioservice.model.CambioEstadoUsuario;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CambioEstadoUsuarioRepository extends JpaRepository<CambioEstadoUsuario, Long> {

    List<CambioEstadoUsuario> findAllByOrderByFechaDesc();
}
