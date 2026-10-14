package cl.ridertapia.usuarioservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

/**
 * Cuenta de acceso al sistema (cliente o personal interno).
 * El identificador es el RUT con formato "12345678-9".
 * Los datos personales del cliente viven en el microservicio de clientes.
 */
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "password")
public class Usuario {

    public static final String ROL_ADMIN = "ADMIN";
    public static final String ROL_CLIENTE = "CLIENTE";

    @Id
    @Column(name = "rut_usuario", length = 12)
    private String rutUsuario;

    @Column(name = "email_cliente", nullable = false, unique = true, length = 100)
    private String emailCliente;

    // Se guarda siempre cifrada con BCrypt
    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 20)
    private String rol;
}
