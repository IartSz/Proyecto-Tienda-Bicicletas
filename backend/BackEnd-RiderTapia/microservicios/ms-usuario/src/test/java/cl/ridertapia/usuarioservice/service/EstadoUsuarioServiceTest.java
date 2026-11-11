package cl.ridertapia.usuarioservice.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import cl.ridertapia.usuarioservice.dto.UsuarioResponse;
import cl.ridertapia.usuarioservice.exception.ApiException;
import cl.ridertapia.usuarioservice.model.CambioEstadoUsuario;
import cl.ridertapia.usuarioservice.model.Usuario;
import cl.ridertapia.usuarioservice.repository.CambioEstadoUsuarioRepository;
import cl.ridertapia.usuarioservice.repository.UsuarioRepository;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

@ExtendWith(MockitoExtension.class)
class EstadoUsuarioServiceTest {

    private static final String RUT = "12345678-5";

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CambioEstadoUsuarioRepository cambioRepository;

    @InjectMocks
    private EstadoUsuarioService estadoUsuarioService;

    private Usuario usuario(String rol) {
        return Usuario.builder().rutUsuario(RUT).emailCliente("pedro@correo.cl").password("hash").rol(rol).build();
    }

    private void assertEstado(Throwable ex, HttpStatus esperado) {
        assertThat(ex).isInstanceOf(ApiException.class);
        assertThat(((ApiException) ex).getStatus()).isEqualTo(esperado);
    }

    @Test
    @DisplayName("cambiarEstado: desactiva la cuenta y registra el cambio")
    void desactivar() {
        when(usuarioRepository.findById(RUT)).thenReturn(Optional.of(usuario("CLIENTE")));

        UsuarioResponse respuesta = estadoUsuarioService.cambiarEstado(RUT, false);

        assertThat(respuesta.activo()).isFalse();
        ArgumentCaptor<CambioEstadoUsuario> captor = ArgumentCaptor.forClass(CambioEstadoUsuario.class);
        verify(cambioRepository).save(captor.capture());
        assertThat(captor.getValue().getRutUsuario()).isEqualTo(RUT);
        assertThat(captor.getValue().getActivo()).isFalse();
    }

    @Test
    @DisplayName("cambiarEstado: si ya estaba en ese estado no registra nada")
    void sinCambio() {
        when(usuarioRepository.findById(RUT)).thenReturn(Optional.of(usuario("CLIENTE")));

        estadoUsuarioService.cambiarEstado(RUT, true);

        verify(usuarioRepository, never()).save(any());
        verify(cambioRepository, never()).save(any());
    }

    @Test
    @DisplayName("cambiarEstado: un administrador no se puede desactivar")
    void adminNoSeDesactiva() {
        when(usuarioRepository.findById(RUT)).thenReturn(Optional.of(usuario("ADMIN")));

        assertThatThrownBy(() -> estadoUsuarioService.cambiarEstado(RUT, false))
                .satisfies(ex -> assertEstado(ex, HttpStatus.BAD_REQUEST));
    }

    @Test
    @DisplayName("cambiarEstado: 404 si el usuario no existe")
    void noExiste() {
        when(usuarioRepository.findById(RUT)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> estadoUsuarioService.cambiarEstado(RUT, false))
                .satisfies(ex -> assertEstado(ex, HttpStatus.NOT_FOUND));
    }
}
