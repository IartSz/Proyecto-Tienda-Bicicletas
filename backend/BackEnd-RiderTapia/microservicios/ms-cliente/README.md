# cliente-service

Microservicio de **perfiles de clientes** de *Rider Tapia Biker*: nombre, contacto y dirección de quienes compran. Cada cliente corresponde a una cuenta de usuario (mismo RUT).

| | |
|---|---|
| Puerto | `8082` |
| Base de datos | `ridertapia_clientes` (MySQL) |
| Stack | Java 17 · Spring Boot 3.3.5 · Spring Data JPA · Spring HATEOAS · springdoc-openapi · Lombok |
| Depende de | `usuario-service` (valida que el RUT tenga cuenta) |

## Modelo

**Cliente**: `rutUsuario` (clave, es el mismo RUT de la cuenta), `nombre`, `apellido`, `telefono` (8 a 12 dígitos, opcional), `direccion`, `comuna`.

La relación con la cuenta no es una clave foránea (cada servicio tiene su base): antes de crear un cliente, `UsuarioRemotoService` consulta por HTTP a usuario-service.

## Cómo ejecutarlo

Requisitos: **Java 17**, **Maven 3.9+** y **MySQL** corriendo en `localhost:3306`.

```bash
# usuario y clave de tu MySQL (por defecto root y sin clave)
export DB_USER=root
export DB_PASSWORD=tu_clave

mvn spring-boot:run
```

Antes de crear clientes debe estar corriendo **usuario-service** (por defecto en `http://localhost:8081`). Si está en otra dirección:
```bash
export USUARIO_SERVICE_URL=http://localhost:8081
```

La base de datos `ridertapia_clientes` se crea sola la primera vez (`createDatabaseIfNotExist=true`) y las tablas se generan con JPA (`ddl-auto=update`).

Documentación interactiva (Swagger): <http://localhost:8082/swagger-ui.html>

## Estructura

```
src/main/java/cl/ridertapia/clienteservice/
├── controller/   endpoints REST y assemblers HATEOAS
├── dto/          datos de entrada y salida
├── exception/    ApiException y manejo global de errores
├── model/        entidades JPA
├── repository/   acceso a la base de datos
└── service/      reglas de negocio
                  (UsuarioRemotoService consulta a usuario-service)
src/test/java/...  pruebas (misma estructura de paquetes)
```

## Endpoints

Base: `/api/clientes`. Las respuestas siguen **HATEOAS (HAL)**: cada recurso trae `_links` y los listados vienen en `_embedded.clientes`. Un listado vacío no trae `_embedded`.

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| POST | `/api/clientes` | Crea el perfil de un cliente | 201 / 404 / 409 |
| GET | `/api/clientes` | Lista los clientes | 200 |
| GET | `/api/clientes/{rut}` | Busca por RUT | 200 / 404 |
| GET | `/api/clientes/buscar?nombre=` | Busca por nombre o apellido | 200 |
| PUT | `/api/clientes/{rut}` | Actualiza los datos (el RUT no cambia) | 200 / 404 |

### Ejemplos

Crear:
```json
{
  "rutUsuario": "12345678-5", "nombre": "Pedro", "apellido": "Suárez",
  "telefono": "+56912345678", "direccion": "Calle Falsa 123", "comuna": "Concepción"
}
```

Actualizar (sin `rutUsuario`):
```json
{ "nombre": "Pedro", "apellido": "Suárez", "telefono": "+56987654321", "direccion": "Av. Chacabuco 456", "comuna": "Concepción" }
```

## Formato de errores

Todos los errores responden con el mismo cuerpo:

```json
{ "timestamp": "2026-10-15T12:00:00", "status": 404, "mensaje": "No existe una cuenta de usuario con el RUT 12345678-5" }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos (RUT mal escrito, teléfono con letras...) |
| 404 | No existe el cliente, o el RUT no tiene cuenta en usuario-service |
| 409 | Ya existe un cliente con ese RUT |
| 503 | usuario-service no está disponible |

## Pruebas

```bash
mvn test      # pruebas unitarias, de controlador y de repositorio
mvn verify    # además ejecuta las pruebas de integración (*IT)
mvn test -Dtest=ClienteControllerIT   # una sola clase
```

| Tipo | Qué prueba | Archivos |
|---|---|---|
| Unitarias (Mockito) | Reglas del servicio y validación contra usuarios | `ClienteServiceTest` |
| Cliente HTTP | Llamada a usuario-service simulada (404, 503, respuesta vacía) | `UsuarioRemotoServiceTest` |
| Controlador (`@WebMvcTest`) | Rutas, validaciones, errores y enlaces HATEOAS | `ClienteControllerTest` |
| Repositorio (`@DataJpaTest`) | Consultas y búsqueda por nombre | `ClienteRepositoryTest` |
| Integración | Flujo completo con H2 (usuario-service simulado) | `ClienteControllerIT` |

Las pruebas de repositorio y de integración usan **H2 en memoria**, no necesitan MySQL.

## Nota sobre la ruta de usuarios

`UsuarioRemotoService` llama a `/api/usuarios/{rut}`. Si en tu usuario-service la ruta es otra (por ejemplo `/api/v1/usuarios`), cambia la constante de esa clase.
