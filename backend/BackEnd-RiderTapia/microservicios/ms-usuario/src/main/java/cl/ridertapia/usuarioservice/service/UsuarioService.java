package cl.ridertapia.usuarioservice.service;

import cl.ridertapia.usuarioservice.dto.LoginRequest;
import cl.ridertapia.usuarioservice.dto.RecuperarPasswordRequest;
import cl.ridertapia.usuarioservice.dto.UsuarioRequest;
import cl.ridertapia.usuarioservice.dto.UsuarioResponse;
import cl.ridertapia.usuarioservice.dto.UsuarioUpdateRequest;
import cl.ridertapia.usuarioservice.exception.ApiException;
import cl.ridertapia.usuarioservice.model.Usuario;
import cl.ridertapia.usuarioservice.repository.UsuarioRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository) {
        this(usuarioRepository, new BCryptPasswordEncoder());
    }

    /** Constructor para las pruebas: permite entregar un cifrador simulado. */
    UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponse guardarUsuario(UsuarioRequest request) {
        String rut = normalizar(request.rutUsuario());
        if (!esValido(rut)) {
            throw ApiException.solicitudInvalida("El RUT ingresado no es válido");
        }
        if (usuarioRepository.existsById(rut)) {
            throw ApiException.conflicto("Ya existe un usuario con el RUT " + rut);
        }
        String email = request.emailCliente().trim().toLowerCase();
        if (usuarioRepository.existsByEmailCliente(email)) {
            throw ApiException.conflicto("Ya existe un usuario con el email " + email);
        }

        Usuario usuario = Usuario.builder()
                .rutUsuario(rut)
                .emailCliente(email)
                .password(passwordEncoder.encode(request.password()))
                .rol(request.rol() == null ? Usuario.ROL_CLIENTE : request.rol())
                .build();
        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarUsuarios() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::desde).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findByRut(String rutUsuario) {
        return UsuarioResponse.desde(buscarPorRut(rutUsuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse findByEmailCliente(String emailCliente) {
        return usuarioRepository.findByEmailCliente(emailCliente.trim().toLowerCase())
                .map(UsuarioResponse::desde)
                .orElseThrow(() -> ApiException.noEncontrado("No existe un usuario con el email " + emailCliente));
    }

    @Transactional
    public UsuarioResponse actualizarUsuario(String rutUsuario, UsuarioUpdateRequest request) {
        Usuario usuario = buscarPorRut(rutUsuario);

        String email = request.emailCliente().trim().toLowerCase();
        if (!email.equals(usuario.getEmailCliente()) && usuarioRepository.existsByEmailCliente(email)) {
            throw ApiException.conflicto("Ya existe un usuario con el email " + email);
        }
        usuario.setEmailCliente(email);

        if (request.password() != null && !request.password().isBlank()) {
            usuario.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.rol() != null) {
            usuario.setRol(request.rol());
        }
        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    @Transactional(readOnly = true)
    public UsuarioResponse iniciarSesion(LoginRequest request) {
        // Mismo mensaje para email inexistente y clave incorrecta, para no revelar qué cuentas existen
        Usuario usuario = usuarioRepository.findByEmailCliente(request.emailCliente().trim().toLowerCase())
                .orElseThrow(() -> ApiException.noAutorizado("Email o contraseña incorrectos"));
        if (!passwordEncoder.matches(request.password(), usuario.getPassword())) {
            throw ApiException.noAutorizado("Email o contraseña incorrectos");
        }
        return UsuarioResponse.desde(usuario);
    }

    /**
     * Versión simple para el proyecto académico: cambia la contraseña conociendo solo el email.
     * En producción esto debe hacerse con un token enviado por correo.
     */
    @Transactional
    public void recuperarPassword(RecuperarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findByEmailCliente(request.emailCliente().trim().toLowerCase())
                .orElseThrow(() -> ApiException.noEncontrado("No existe un usuario con ese email"));
        usuario.setPassword(passwordEncoder.encode(request.nuevaPassword()));
        usuarioRepository.save(usuario);
    }

    private Usuario buscarPorRut(String rutUsuario) {
        String rut = normalizar(rutUsuario);
        return usuarioRepository.findById(rut)
                .orElseThrow(() -> ApiException.noEncontrado("No existe un usuario con el RUT " + rut));
    }

    /** Valida el dígito verificador de un RUT con formato 12345678-9 (módulo 11). */
    static boolean esValido(String rut) {
        if (rut == null || !rut.matches("^\\d{7,8}-[\\dkK]$")) {
            return false;
        }
        String[] partes = rut.split("-");
        String cuerpo = partes[0];
        char dvIngresado = Character.toUpperCase(partes[1].charAt(0));

        int suma = 0;
        int multiplicador = 2;
        for (int i = cuerpo.length() - 1; i >= 0; i--) {
            suma += Character.getNumericValue(cuerpo.charAt(i)) * multiplicador;
            multiplicador = (multiplicador == 7) ? 2 : multiplicador + 1;
        }
        int resto = 11 - (suma % 11);
        char dvEsperado = (resto == 11) ? '0' : (resto == 10) ? 'K' : (char) ('0' + resto);
        return dvIngresado == dvEsperado;
    }

    /** Deja el RUT en mayúsculas para guardarlo siempre igual (K final). */
    static String normalizar(String rut) {
        return rut == null ? null : rut.trim().toUpperCase();
    }
}
