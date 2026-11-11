package cl.ridertapia.usuarioservice.service;

import cl.ridertapia.usuarioservice.dto.UsuarioResponse;
import cl.ridertapia.usuarioservice.exception.ApiException;
import cl.ridertapia.usuarioservice.model.CambioEstadoUsuario;
import cl.ridertapia.usuarioservice.model.Usuario;
import cl.ridertapia.usuarioservice.repository.CambioEstadoUsuarioRepository;
import cl.ridertapia.usuarioservice.repository.UsuarioRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Activa o desactiva cuentas y guarda el registro de cada cambio. */
@Service
@RequiredArgsConstructor
public class EstadoUsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final CambioEstadoUsuarioRepository cambioRepository;

    @Transactional
    public UsuarioResponse cambiarEstado(String rutUsuario, boolean activo) {
        String rut = UsuarioService.normalizar(rutUsuario);
        Usuario usuario = usuarioRepository.findById(rut)
                .orElseThrow(() -> ApiException.noEncontrado("No existe un usuario con el RUT " + rut));
        if (Usuario.ROL_ADMIN.equals(usuario.getRol()) && !activo) {
            throw ApiException.solicitudInvalida("No se puede desactivar una cuenta de administrador");
        }
        if (usuario.estaActivo() != activo) {
            usuario.setActivo(activo);
            usuarioRepository.save(usuario);
            cambioRepository.save(CambioEstadoUsuario.builder()
                    .rutUsuario(rut)
                    .activo(activo)
                    .fecha(LocalDateTime.now())
                    .build());
        }
        return UsuarioResponse.desde(usuario);
    }

    @Transactional(readOnly = true)
    public List<CambioEstadoUsuario> listarCambios() {
        return cambioRepository.findAllByOrderByFechaDesc();
    }
}
