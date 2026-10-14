package cl.ridertapia.clienteservice.repository;

import static org.assertj.core.api.Assertions.assertThat;

import cl.ridertapia.clienteservice.model.Cliente;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

/** Usa una base H2 en memoria (reemplaza a MySQL solo durante la prueba). */
@DataJpaTest
class ClienteRepositoryTest {

    @Autowired
    private ClienteRepository clienteRepository;

    @BeforeEach
    void preparar() {
        clienteRepository.save(Cliente.builder().rutUsuario("12345678-5").nombre("Pedro").apellido("Suárez").build());
        clienteRepository.save(Cliente.builder().rutUsuario("11111111-1").nombre("Ana").apellido("Pedraza").build());
        clienteRepository.save(Cliente.builder().rutUsuario("12342313-5").nombre("Luis").apellido("Rojas").build());
    }

    @Test
    @DisplayName("findById usa el RUT como identificador")
    void findById() {
        assertThat(clienteRepository.findById("12345678-5")).get()
                .extracting(Cliente::getNombre).isEqualTo("Pedro");
        assertThat(clienteRepository.findById("99999999-9")).isEmpty();
    }

    @Test
    @DisplayName("Busca por parte del nombre o del apellido, sin distinguir mayúsculas")
    void buscarPorNombreOApellido() {
        List<Cliente> resultado = clienteRepository
                .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase("PED", "PED");

        assertThat(resultado).extracting(Cliente::getRutUsuario)
                .containsExactlyInAnyOrder("12345678-5", "11111111-1"); // Pedro (nombre) y Pedraza (apellido)
    }

    @Test
    @DisplayName("Sin coincidencias devuelve lista vacía")
    void buscarSinResultados() {
        assertThat(clienteRepository
                .findByNombreContainingIgnoreCaseOrApellidoContainingIgnoreCase("zzz", "zzz")).isEmpty();
    }
}
