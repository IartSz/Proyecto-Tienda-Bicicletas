# usuario-service

Microservicio de **cuentas de usuario** de *Rider Tapia Biker*: registro, inicio de sesión, recuperación de contraseña y roles. Es la fuente de verdad del RUT: el resto de los servicios le consultan si un RUT tiene cuenta.

| | |
|---|---|
| Puerto | `8081` |
| Base de datos | `ridertapia_usuarios` (MySQL) |
| Stack | Java 17 · Spring Boot 3.3.5 · Spring Data JPA · Spring HATEOAS · springdoc-openapi · Lombok |
| Depende de | nadie |

## Modelo

**Usuario**: `rutUsuario` (clave, formato `12345678-5`, dígito verificador validado con módulo 11), `emailCliente` (único, en minúsculas), `password` (guardada cifrada con BCrypt, nunca se devuelve), `rol` (`CLIENTE` por defecto, o `ADMIN`).

## Cómo ejecutarlo

Requisitos: **Java 17**, **Maven 3.9+** y **MySQL** corriendo en `localhost:3306`.

```bash
# usuario y clave de tu MySQL (por defecto root y sin clave)
export DB_USER=root
export DB_PASSWORD=tu_clave

mvn spring-boot:run
```

La base de datos `ridertapia_usuarios` se crea sola la primera vez (`createDatabaseIfNotExist=true`) y las tablas se generan con JPA (`ddl-auto=update`).

Documentación interactiva (Swagger): <http://localhost:8081/swagger-ui.html>

## Estructura

```
src/main/java/cl/ridertapia/usuarioservice/
├── controller/   endpoints REST y assemblers HATEOAS
├── dto/          datos de entrada y salida
├── exception/    ApiException y manejo global de errores
├── model/        entidades JPA
├── repository/   acceso a la base de datos
└── service/      reglas de negocio
src/test/java/...  pruebas (misma estructura de paquetes)
```

## Endpoints

Base: `/api/usuarios`. Las respuestas siguen **HATEOAS (HAL)**: cada recurso trae `_links` y los listados vienen en `_embedded.usuarios`. Un listado vacío no trae `_embedded`.

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/api/usuarios` | Crea una cuenta | 201 |
| GET | `/api/usuarios` | Lista las cuentas | 200 |
| GET | `/api/usuarios/{rut}` | Busca por RUT | 200 / 404 |
| GET | `/api/usuarios/buscar?email=` | Busca por correo | 200 / 404 |
| PUT | `/api/usuarios/{rut}` | Actualiza correo, clave o rol | 200 |
| POST | `/api/usuarios/login` | Inicia sesión | 200 / 401 |
| POST | `/api/usuarios/recuperar-password` | Cambia la clave por correo | 200 |

### Ejemplos

Crear (`rol` es opcional):
```json
{ "rutUsuario": "12345678-5", "emailCliente": "juan.perez@example.com", "password": "password123", "rol": "CLIENTE" }
```

Actualizar:
```json
{ "emailCliente": "juan.perez@example.com", "password": "password456", "rol": "ADMIN" }
```

Login:
```json
{ "emailCliente": "juan.perez@example.com", "password": "password456" }
```

Recuperar contraseña (mínimo 8 caracteres):
```json
{ "emailCliente": "juan.perez@example.com", "nuevaPassword": "claveNueva123" }
```

## Formato de errores

Todos los errores responden con el mismo cuerpo:

```json
{ "timestamp": "2026-10-15T12:00:00", "status": 409, "mensaje": "Ya existe un usuario con el RUT 12345678-5" }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos o RUT con dígito verificador incorrecto |
| 401 | Correo o contraseña incorrectos |
| 404 | No existe el usuario |
| 409 | RUT o correo ya registrados |

## Pruebas

```bash
mvn test      # pruebas unitarias, de controlador y de repositorio
mvn verify    # además ejecuta las pruebas de integración (*IT)
mvn test -Dtest=UsuarioControllerIT   # una sola clase
```

| Tipo | Qué prueba | Archivos |
|---|---|---|
| Unitarias (Mockito) | Reglas del servicio: RUT, duplicados, cifrado de clave, login | `UsuarioServiceTest`, `RutValidacionTest` |
| Controlador (`@WebMvcTest`) | Rutas, validaciones, errores y enlaces HATEOAS | `UsuarioControllerTest` |
| Repositorio (`@DataJpaTest`) | Consultas y restricciones de la tabla | `UsuarioRepositoryTest` |
| Integración | Flujo completo con H2 | `UsuarioControllerIT` |

Las pruebas de repositorio y de integración usan **H2 en memoria**, no necesitan MySQL.

## Datos válidos para probar

RUT con dígito verificador correcto: `12345678-5`, `11111111-1`, `12342313-5`, `10000013-K`.
