package cl.ridertapia.usuarioservice.datos;

import cl.ridertapia.usuarioservice.dto.UsuarioRequest;
import cl.ridertapia.usuarioservice.repository.UsuarioRepository;
import cl.ridertapia.usuarioservice.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

// Al arrancar crea la cuenta de administrador si aun no existe.
// Se apaga con ridertapia.carga-inicial=false.
@Component
@ConditionalOnProperty(name = "ridertapia.carga-inicial", havingValue = "true", matchIfMissing = true)
public class CargaInicialAdmin implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaInicialAdmin.class);

    private final UsuarioRepository usuarioRepository;
    private final UsuarioService usuarioService;

    @Value("${ridertapia.admin.rut:11111111-1}")
    private String rut;

    @Value("${ridertapia.admin.email:admin@ridertapia.cl}")
    private String email;

    @Value("${ridertapia.admin.password:admin123}")
    private String password;

    public CargaInicialAdmin(UsuarioRepository usuarioRepository, UsuarioService usuarioService) {
        this.usuarioRepository = usuarioRepository;
        this.usuarioService = usuarioService;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.existsById(rut) || usuarioRepository.existsByEmailCliente(email)) {
            return;
        }
        usuarioService.guardarUsuario(new UsuarioRequest(rut, email, password, "ADMIN"));
        log.info("Cuenta de administrador creada: {}", email);
    }
}
