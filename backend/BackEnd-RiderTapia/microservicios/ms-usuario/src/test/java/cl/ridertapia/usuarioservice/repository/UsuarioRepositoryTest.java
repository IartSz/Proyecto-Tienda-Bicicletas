package cl.ridertapia.usuarioservice.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import cl.ridertapia.usuarioservice.model.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.dao.DataIntegrityViolationException;

/** Usa una base H2 en memoria (reemplaza a MySQL solo durante la prueba). */
@DataJpaTest
class UsuarioRepositoryTest {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void preparar() {
        usuarioRepository.save(Usuario.builder()
                .rutUsuario("12345678-5").emailCliente("pedro@correo.cl").password("hash").rol("CLIENTE").build());
    }

    @Test
    @DisplayName("findById usa el RUT como identificador")
    void findById() {
        assertThat(usuarioRepository.findById("12345678-5")).isPresent();
        assertThat(usuarioRepository.findById("11111111-1")).isEmpty();
    }

    @Test
    @DisplayName("findByEmailCliente encuentra por email")
    void findByEmailCliente() {
        assertThat(usuarioRepository.findByEmailCliente("pedro@correo.cl"))
                .get().extracting(Usuario::getRutUsuario).isEqualTo("12345678-5");
        assertThat(usuarioRepository.findByEmailCliente("otro@correo.cl")).isEmpty();
    }

    @Test
    @DisplayName("existsByEmailCliente")
    void existsByEmailCliente() {
        assertThat(usuarioRepository.existsByEmailCliente("pedro@correo.cl")).isTrue();
        assertThat(usuarioRepository.existsByEmailCliente("otro@correo.cl")).isFalse();
    }

    @Test
    @DisplayName("No permite dos usuarios con el mismo email")
    void emailUnico() {
        Usuario repetido = Usuario.builder()
                .rutUsuario("11111111-1").emailCliente("pedro@correo.cl").password("hash").rol("CLIENTE").build();

        assertThatThrownBy(() -> usuarioRepository.saveAndFlush(repetido))
                .isInstanceOf(DataIntegrityViolationException.class);
    }
}
