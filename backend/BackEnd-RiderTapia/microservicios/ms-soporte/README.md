# soporte-service

Microservicio de **soporte y postventa** de *Rider Tapia Biker*: reseñas de productos, garantías, devoluciones, mensajes de contacto y seguimiento de pedidos.

| | |
|---|---|
| Puerto | `9003` |
| Base de datos | `ridertapia_soporte` (MySQL) |
| Stack | Java 17 · Spring Boot 3.3.5 · Spring Data JPA · Spring HATEOAS · springdoc-openapi · Lombok |
| Depende de | `usuario-service` (valida que el RUT tenga cuenta) |

## Qué hace cada módulo

| Módulo | Qué es | Reglas principales |
|---|---|---|
| **Reseña** | Opinión de un cliente sobre un producto | Calificación 1 a 5. Una por usuario y producto. Se puede ocultar; las ocultas no cuentan en el promedio |
| **Garantía** | Garantía de un producto comprado | 12 meses por defecto (1 a 60). Una por producto de cada pedido. Si vence, pasa a `EXPIRADA` |
| **Devolución** | Solicitud de devolución | Estados `SOLICITADA → APROBADA/RECHAZADA`, `APROBADA → COMPLETADA`. Rechazar exige explicar el motivo. No se acepta otra mientras haya una en curso |
| **Contacto** | Mensaje de un cliente o visitante | El RUT es opcional. Estados `ABIERTO → RESPONDIDO` |
| **Seguimiento** | Contacto posterior a la compra | Tipo `LLAMADA`, `CORREO` o `ENCUESTA`. Estados `PENDIENTE`, `REALIZADO`, `CANCELADO` |

Los pedidos y productos (`idPedido`, `idProducto`) se guardan como número, sin clave foránea: viven en otros servicios.

## Cómo ejecutarlo

Requisitos: **Java 17**, **Maven 3.9+** y **MySQL** corriendo en `localhost:3306`.

```bash
# usuario y clave de tu MySQL (por defecto root y sin clave)
export DB_USER=root
export DB_PASSWORD=tu_clave

mvn spring-boot:run
```

Antes de usarlo debe estar corriendo **usuario-service** (por defecto en `http://localhost:9001`). Si está en otra dirección:
```bash
export USUARIO_SERVICE_URL=http://localhost:9001
```

La base de datos `ridertapia_soporte` se crea sola la primera vez (`createDatabaseIfNotExist=true`) y las tablas se generan con JPA (`ddl-auto=update`).

Documentación interactiva (Swagger): <http://localhost:9003/swagger-ui.html>

## Estructura

```
src/main/java/cl/ridertapia/soporteservice/
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

Base: `/api/v1`. Las respuestas siguen **HATEOAS (HAL)**: cada recurso trae `_links` y los listados vienen en `_embedded.resenas, garantias, devoluciones, contactos o seguimientos`. Un listado vacío no trae `_embedded`.

### Reseñas — `/api/v1/resenas`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/resenas` | Publica una reseña (201) |
| GET | `/resenas` | Lista todas |
| GET | `/resenas/{id}` | Obtiene una |
| GET | `/resenas/producto/{idProducto}` | Reseñas visibles de un producto |
| GET | `/resenas/producto/{idProducto}/resumen` | Promedio y total |
| GET | `/resenas/usuario/{rut}` | Reseñas de un usuario |
| PATCH | `/resenas/{id}/ocultar` | Oculta una reseña |

### Garantías — `/api/v1/garantias`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/garantias` | Registra una garantía (201) |
| GET | `/garantias` | Lista todas |
| GET | `/garantias/{id}` | Obtiene una |
| GET | `/garantias/usuario/{rut}` | Garantías de un usuario |
| GET | `/garantias/{id}/vigencia` | Días restantes; marca `EXPIRADA` si venció |

### Devoluciones — `/api/v1/devoluciones`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/devoluciones` | Solicita una devolución (201) |
| GET | `/devoluciones?estado=` | Lista, o filtra por estado |
| GET | `/devoluciones/{id}` | Obtiene una |
| GET | `/devoluciones/usuario/{rut}` | Devoluciones de un usuario |
| PUT | `/devoluciones/{id}/resolver` | Aprueba, rechaza o completa |

### Contacto — `/api/v1/contactos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/contactos` | Envía un mensaje (201) |
| GET | `/contactos?estado=` | Lista, o filtra por estado |
| GET | `/contactos/{id}` | Obtiene uno |
| PUT | `/contactos/{id}/responder` | Responde el mensaje |

### Seguimiento — `/api/v1/seguimientos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/seguimientos` | Registra un seguimiento (201) |
| GET | `/seguimientos` | Lista todos |
| GET | `/seguimientos/{id}` | Obtiene uno |
| GET | `/seguimientos/pedido/{idPedido}` | Seguimientos de un pedido |
| PUT | `/seguimientos/{id}/estado` | Cambia el estado |

### Ejemplos de cuerpos

```json
// POST /resenas
{ "rutUsuario": "12345678-5", "idProducto": 100, "calificacion": 5, "comentario": "Excelente bicicleta" }

// POST /garantias   (mesesCobertura es opcional)
{ "rutUsuario": "12345678-5", "idPedido": 1, "idProducto": 100, "mesesCobertura": 12 }

// POST /devoluciones   (motivo: 10 a 500 caracteres)
{ "rutUsuario": "12345678-5", "idPedido": 1, "idProducto": 100, "motivo": "El producto llegó con la llanta dañada" }

// PUT /devoluciones/{id}/resolver
{ "estado": "APROBADA", "respuesta": "Envíalo a nuestra tienda" }

// POST /contactos   (rutUsuario es opcional)
{ "nombre": "Juan", "emailContacto": "juan@example.com", "asunto": "Consulta", "mensaje": "¿Tienen stock?" }

// PUT /contactos/{id}/responder
{ "respuesta": "Sí, tenemos stock." }

// POST /seguimientos
{ "idPedido": 1, "rutUsuario": "12345678-5", "tipo": "ENCUESTA", "observacion": "Preguntar por la entrega" }

// PUT /seguimientos/{id}/estado
{ "estado": "REALIZADO", "observacion": "Cliente conforme" }
```

Los enlaces de cada recurso cambian según su estado: por ejemplo `ocultar` solo aparece en reseñas visibles, y `resolver` solo en devoluciones solicitadas o aprobadas.

## Formato de errores

Todos los errores responden con el mismo cuerpo:

```json
{ "timestamp": "2026-10-15T12:00:00", "status": 409, "mensaje": "Ya hay una devolución en curso para el producto 100 del pedido 1" }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Datos inválidos, estado inexistente o rechazo sin motivo |
| 404 | No existe el recurso, o el RUT no tiene cuenta en usuario-service |
| 409 | Duplicado (reseña, garantía o devolución en curso) o cambio de estado no permitido |
| 503 | usuario-service no está disponible |

## Pruebas

```bash
mvn test      # pruebas unitarias, de controlador y de repositorio
mvn verify    # además ejecuta las pruebas de integración (*IT)
mvn test -Dtest=ResenaControllerIT   # una sola clase
```

| Tipo | Qué prueba | Archivos |
|---|---|---|
| Unitarias (Mockito) | Reglas de los 5 servicios | `ResenaServiceTest`, `GarantiaServiceTest`, `DevolucionServiceTest`, `ContactoServiceTest`, `SeguimientoServiceTest` |
| Cliente HTTP | Llamada a usuario-service simulada | `UsuarioRemotoServiceTest` |
| Controlador (`@WebMvcTest`) | Rutas, validaciones, errores y enlaces HATEOAS | `*ControllerTest` (5) |
| Repositorio (`@DataJpaTest`) | Restricción única de reseñas y consultas | `SoporteRepositoriesTest` |
| Integración | Flujos completos con H2 | `*ControllerIT` (5) |

Las pruebas de repositorio y de integración usan **H2 en memoria**, no necesitan MySQL.

## Nota sobre la ruta de usuarios

`UsuarioRemotoService` llama a `/api/usuarios/{rut}`. Si en tu usuario-service la ruta es otra (por ejemplo `/api/v1/usuarios`), cambia la constante `RUTA_USUARIO` de esa clase.
