# ms-servicio-tecnico — Rider Tapia Biker

Microservicio REST de **servicio técnico** de Rider Tapia Biker (épica EP-10 Servicio técnico). Digitaliza la gestión del taller: el cliente elige el tipo de mantención y describe la falla con fotos, el mecánico recibe la bicicleta y genera la orden de trabajo, actualiza su estado, registra los repuestos usados (que se descuentan del inventario) y el cliente es avisado cuando su bicicleta está lista. Al final el cliente puede calificar el servicio. Las respuestas siguen el formato HATEOAS (HAL).

El cliente puede consultar el estado de su reparación **solo con su número de teléfono**, sin tener cuenta (HU-57).

## Tecnologías

| Tecnología | Versión |
|---|---|
| Java | 25 |
| Spring Boot | 4.0.6 (webmvc, data-jpa, hateoas) |
| springdoc-openapi (Swagger UI) | 3.0.3 |
| MySQL (mysql-connector-j) | runtime |
| H2 | runtime y tests |
| Lombok | gestionado por Spring Boot |
| RestTemplate | cliente HTTP hacia ms-cliente y ms-inventario |
| JUnit 5 + Mockito + MockMvc | tests |
| JaCoCo | 0.8.14 |

## Del diagrama al código

| Clase del diagrama | En el código |
|---|---|
| TipoServicio, Bicicleta, SolicitudServicio, FotoSolicitud, OrdenTrabajo, HistorialEstadoOrden, RepuestoUtilizado, NotificacionTaller, CalificacionServicio | Entidades JPA, cada una con repository, service, controller y tests |
| NivelServicio, TipoBicicleta, EstadoSolicitud, EstadoOrden | Enums de Java guardados como texto |
| Cliente | Está en `ms-cliente`: la orden y la solicitud guardan solo el RUT (`rutCliente`), que es opcional para clientes sin cuenta |
| ItemInventario, MovimientoInventario | Están en `ms-inventario`: el repuesto guarda `idVariante` y el stock se descuenta por HTTP |
| Empleado (mecánico) | Pertenece a `ms-usuario`: se guarda solo su id (`idEmpleado`) |

Relaciones dentro del microservicio:

- SolicitudServicio → TipoServicio, y FotoSolicitud → SolicitudServicio.
- OrdenTrabajo → Bicicleta, TipoServicio y SolicitudServicio (opcional, si la orden viene de una solicitud web).
- HistorialEstadoOrden, RepuestoUtilizado, NotificacionTaller y CalificacionServicio → OrdenTrabajo.
- Cada orden tiene como máximo una CalificacionServicio (`id_orden_trabajo` es único).

## Rol en la arquitectura

**Consume**:

- `ms-cliente` (puerto 9002): `GET /api/v1/clientes/{rut}`. Al crear una orden de trabajo o una solicitud con `rutCliente`, valida que el cliente exista (si no, 404). Si no viene RUT no se valida. La URL se configura en `ms.clientes.url`.
- `ms-inventario` (puerto 9008), al registrar un repuesto utilizado (HU-44):
  - `GET /api/v1/items-inventario/idVariante/{idVariante}`: revisa el stock disponible. Si no alcanza responde **409 Conflict**; si la variante no tiene inventario responde 404.
  - `PUT /api/v1/items-inventario/{id}`: descuenta las unidades usadas.
  - `POST /api/v1/movimientos`: deja un movimiento `USO_TALLER` con el `idOrdenTrabajo`.
  - Las URLs se configuran en `ms.inventario.items-url` y `ms.inventario.movimientos-url`.

**Es consumido por**:

- Frontend tienda: selección del tipo de mantención, solicitud con fotos, consulta del estado por teléfono y calificación del servicio.
- Panel mecánico / administrador: recepción de bicicletas, órdenes de trabajo, cambios de estado y repuestos.
- `ms-inventario`: sus movimientos `USO_TALLER` guardan el `idOrdenTrabajo` de este microservicio.

Para registrar repuestos en local, `ms-inventario` (y `ms-productos`, que él usa) deben estar levantados.

## Reglas del negocio

| Historia | Regla | Dónde |
|---|---|---|
| HU-39 | Una solicitud siempre tiene un tipo de servicio; si no existe responde 404 | `SolicitudServicioService` |
| HU-40 | Las fotos solo pueden ser `jpg`, `jpeg`, `png` o `webp` y de hasta 5 MB (5120 KB); si no, responde **400** | `FotoSolicitudService` |
| HU-41 y HU-42 | Si la orden llega sin `codigo` se genera `OT-00001`, `OT-00002`, etc. Si llega sin `estado` parte en `RECIBIDA` | `OrdenTrabajoService` |
| HU-43 | Cada vez que cambia el estado de la orden se guarda un `HistorialEstadoOrden` con la fecha (también al crearla). Al pasar a `ENTREGADA` se guarda `fechaEntrega` si no viene | `OrdenTrabajoService` |
| HU-44 | Al registrar un repuesto se valida y descuenta el stock en `ms-inventario`. Si no alcanza responde **409**. El PUT solo corrige el registro, no vuelve a mover el stock | `RepuestoUtilizadoService` |
| HU-45 | Cuando la orden pasa a `LISTA` se crea una `NotificacionTaller` de tipo `BICICLETA_LISTA` al correo del cliente (o a su teléfono si no tiene correo). En los estados intermedios no se avisa | `OrdenTrabajoService` |
| HU-46 | Solo se califica una orden `ENTREGADA`, una sola vez y con puntuación de 1 a 5. Si no, responde **409** (o **400** por la puntuación) | `CalificacionServicioService` |
| HU-57 | El cliente consulta sus órdenes con `GET /api/v1/ordenes-trabajo/telefonoCliente/{telefono}`; si no tiene, la lista viene vacía | `OrdenTrabajoController` |

## Configuración

| Propiedad | Valor |
|---|---|
| Puerto | `9015` |
| Base de datos | `ridertapia_servicio_tecnico` (MySQL, se crea sola con `createDatabaseIfNotExist=true`) |
| Usuario / clave MySQL | `root` / vacío (ajustar en `application.properties`) |
| URL clientes | `ms.clientes.url=http://localhost:9002/api/v1/clientes` |
| URL ítems de inventario | `ms.inventario.items-url=http://localhost:9008/api/v1/items-inventario` |
| URL movimientos | `ms.inventario.movimientos-url=http://localhost:9008/api/v1/movimientos` |
| Swagger UI | http://localhost:9015/doc/swagger-ui.html |
| OpenAPI JSON | http://localhost:9015/api-docs |

Ejecutar:

```bash
./mvnw spring-boot:run
```

Al crear o actualizar, las relaciones se envían solo con su id (por ejemplo `"ordenTrabajo": {"idOrdenTrabajo": 1}`). Si no existe responde 404. Al eliminar un registro que otro está usando (por ejemplo, una orden con repuestos) responde 409.

## Endpoints

Cada clase tiene su propio controller con el mismo patrón: listar, obtener por id, una o dos búsquedas, crear, actualizar y eliminar.

### TipoServicio — `/api/v1/tipos-servicio`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/tipos-servicio` | Lista todos | 200 |
| GET | `/api/v1/tipos-servicio/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/tipos-servicio/nivel/{nivel}` | Lista los que tienen ese nivel | 200 |
| POST | `/api/v1/tipos-servicio` | Crea | 201 / 409 si el valor único ya existe |
| PUT | `/api/v1/tipos-servicio/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/tipos-servicio/{id}` | Elimina | 204 / 409 si está en uso |

### Bicicleta — `/api/v1/bicicletas`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/bicicletas` | Lista todos | 200 |
| GET | `/api/v1/bicicletas/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/bicicletas/rutCliente/{rutCliente}` | Lista los que tienen ese rutCliente | 200 |
| POST | `/api/v1/bicicletas` | Crea | 201 / 409 si el valor único ya existe |
| PUT | `/api/v1/bicicletas/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/bicicletas/{id}` | Elimina | 204 / 409 si está en uso |

### SolicitudServicio — `/api/v1/solicitudes-servicio`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/solicitudes-servicio` | Lista todos | 200 |
| GET | `/api/v1/solicitudes-servicio/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/solicitudes-servicio/telefonoContacto/{telefonoContacto}` | Lista los que tienen ese telefonoContacto | 200 |
| POST | `/api/v1/solicitudes-servicio` | Crea | 201 / 404 si el tipo de servicio o el cliente no existe |
| PUT | `/api/v1/solicitudes-servicio/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/solicitudes-servicio/{id}` | Elimina | 204 / 409 si está en uso |

### FotoSolicitud — `/api/v1/fotos-solicitud`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/fotos-solicitud` | Lista todos | 200 |
| GET | `/api/v1/fotos-solicitud/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/fotos-solicitud/solicitudServicio/{idSolicitudServicio}` | Lista los de una solicitudServicio | 200 |
| POST | `/api/v1/fotos-solicitud` | Crea | 201 / 404 si una relación no existe / 400 si el formato o el tamaño no es válido |
| PUT | `/api/v1/fotos-solicitud/{id}` | Actualiza | 200 / 404 / 400 si el formato o el tamaño no es válido |
| DELETE | `/api/v1/fotos-solicitud/{id}` | Elimina | 204 |

### OrdenTrabajo — `/api/v1/ordenes-trabajo`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/ordenes-trabajo` | Lista todos | 200 |
| GET | `/api/v1/ordenes-trabajo/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/ordenes-trabajo/telefonoCliente/{telefonoCliente}` | Lista los que tienen ese telefonoCliente | 200 |
| POST | `/api/v1/ordenes-trabajo` | Crea | 201 / 404 si una relación o el cliente no existe / 409 si el valor único ya existe |
| PUT | `/api/v1/ordenes-trabajo/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/ordenes-trabajo/{id}` | Elimina | 204 / 409 si está en uso |

### HistorialEstadoOrden — `/api/v1/historial-estados-orden`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/historial-estados-orden` | Lista todos | 200 |
| GET | `/api/v1/historial-estados-orden/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/historial-estados-orden/ordenTrabajo/{idOrdenTrabajo}` | Lista los de una ordenTrabajo | 200 |
| POST | `/api/v1/historial-estados-orden` | Crea | 201 / 404 si una relación no existe |
| PUT | `/api/v1/historial-estados-orden/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/historial-estados-orden/{id}` | Elimina | 204 |

### RepuestoUtilizado — `/api/v1/repuestos-utilizados`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/repuestos-utilizados` | Lista todos | 200 |
| GET | `/api/v1/repuestos-utilizados/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/repuestos-utilizados/ordenTrabajo/{idOrdenTrabajo}` | Lista los de una ordenTrabajo | 200 |
| POST | `/api/v1/repuestos-utilizados` | Crea | 201 / 404 si la orden o el inventario de la variante no existe / 409 si no hay stock suficiente / 400 si la cantidad no es válida |
| PUT | `/api/v1/repuestos-utilizados/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/repuestos-utilizados/{id}` | Elimina | 204 |

### NotificacionTaller — `/api/v1/notificaciones-taller`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/notificaciones-taller` | Lista todos | 200 |
| GET | `/api/v1/notificaciones-taller/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/notificaciones-taller/ordenTrabajo/{idOrdenTrabajo}` | Lista los de una ordenTrabajo | 200 |
| POST | `/api/v1/notificaciones-taller` | Crea | 201 / 404 si una relación no existe |
| PUT | `/api/v1/notificaciones-taller/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/notificaciones-taller/{id}` | Elimina | 204 |

### CalificacionServicio — `/api/v1/calificaciones-servicio`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/calificaciones-servicio` | Lista todos | 200 |
| GET | `/api/v1/calificaciones-servicio/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/calificaciones-servicio/ordenTrabajo/{idOrdenTrabajo}` | Lista los de una ordenTrabajo | 200 |
| POST | `/api/v1/calificaciones-servicio` | Crea | 201 / 404 si una relación no existe / 409 si el valor único ya existe / 409 si el servicio no está entregado o ya fue calificado / 400 si la puntuación no está entre 1 y 5 |
| PUT | `/api/v1/calificaciones-servicio/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe / 400 si la puntuación no está entre 1 y 5 |
| DELETE | `/api/v1/calificaciones-servicio/{id}` | Elimina | 204 |

### Ejemplo: OrdenTrabajo

Entrada (POST / PUT). Las relaciones se envían solo con su id:

```json
{
  "codigo": "OT-00001",
  "fechaIngreso": "2026-10-07T10:00:00",
  "fechaEstimadaEntrega": "2026-10-09",
  "fechaEntrega": null,
  "estado": "RECIBIDA",
  "nombreCliente": "Juan Pérez",
  "telefonoCliente": "912345678",
  "emailCliente": "juan@correo.cl",
  "rutCliente": "12345678-5",
  "diagnostico": "Pastillas traseras gastadas",
  "costoManoObra": 25000,
  "idEmpleado": 3,
  "bicicleta": {
    "idBicicleta": 1
  },
  "tipoServicio": {
    "idTipoServicio": 1
  },
  "solicitudServicio": null
}
```

Respuesta HATEOAS (las relaciones vuelven completas):

```json
{
  "idOrdenTrabajo": 1,
  "codigo": "OT-00001",
  "fechaIngreso": "2026-10-07T10:00:00",
  "fechaEstimadaEntrega": "2026-10-09",
  "fechaEntrega": null,
  "estado": "RECIBIDA",
  "nombreCliente": "Juan Pérez",
  "telefonoCliente": "912345678",
  "emailCliente": "juan@correo.cl",
  "rutCliente": "12345678-5",
  "diagnostico": "Pastillas traseras gastadas",
  "costoManoObra": 25000,
  "idEmpleado": 3,
  "bicicleta": {
    "idBicicleta": 1,
    "marca": "Trek",
    "modelo": "Marlin 7",
    "tipo": "MTB",
    "aro": "29",
    "color": "Rojo",
    "numeroSerie": "WTU123456",
    "rutCliente": "12345678-5"
  },
  "tipoServicio": {
    "idTipoServicio": 1,
    "nombre": "Mantención básica",
    "nivel": "BASICO",
    "descripcion": "Ajuste general y lubricación",
    "incluye": "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión",
    "precio": 25000,
    "diasEstimados": 1,
    "activo": true
  },
  "solicitudServicio": null,
  "_links": {
    "self": {
      "href": "http://localhost:9015/api/v1/ordenes-trabajo/1"
    },
    "ordenesTrabajo": {
      "href": "http://localhost:9015/api/v1/ordenes-trabajo"
    }
  }
}
```

### Ejemplo: RepuestoUtilizado

Entrada (POST / PUT). Las relaciones se envían solo con su id:

```json
{
  "idVariante": 20,
  "cantidad": 1,
  "precioUnitario": 15990,
  "fechaRegistro": "2026-10-08T10:00:00",
  "ordenTrabajo": {
    "idOrdenTrabajo": 1
  }
}
```

Respuesta HATEOAS (las relaciones vuelven completas):

```json
{
  "idRepuestoUtilizado": 1,
  "idVariante": 20,
  "cantidad": 1,
  "precioUnitario": 15990,
  "fechaRegistro": "2026-10-08T10:00:00",
  "ordenTrabajo": {
    "idOrdenTrabajo": 1,
    "codigo": "OT-00001",
    "fechaIngreso": "2026-10-07T10:00:00",
    "fechaEstimadaEntrega": "2026-10-09",
    "fechaEntrega": null,
    "estado": "RECIBIDA",
    "nombreCliente": "Juan Pérez",
    "telefonoCliente": "912345678",
    "emailCliente": "juan@correo.cl",
    "rutCliente": "12345678-5",
    "diagnostico": "Pastillas traseras gastadas",
    "costoManoObra": 25000,
    "idEmpleado": 3,
    "bicicleta": {
      "idBicicleta": 1,
      "marca": "Trek",
      "modelo": "Marlin 7",
      "tipo": "MTB",
      "aro": "29",
      "color": "Rojo",
      "numeroSerie": "WTU123456",
      "rutCliente": "12345678-5"
    },
    "tipoServicio": {
      "idTipoServicio": 1,
      "nombre": "Mantención básica",
      "nivel": "BASICO",
      "descripcion": "Ajuste general y lubricación",
      "incluye": "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión",
      "precio": 25000,
      "diasEstimados": 1,
      "activo": true
    },
    "solicitudServicio": null
  },
  "_links": {
    "self": {
      "href": "http://localhost:9015/api/v1/repuestos-utilizados/1"
    },
    "repuestosUtilizados": {
      "href": "http://localhost:9015/api/v1/repuestos-utilizados"
    }
  }
}
```

### Ejemplo de listado HATEOAS (TipoServicio)

```json
{
  "_embedded": {
    "tipoServicioList": [
      {
        "idTipoServicio": 1,
        "nombre": "Mantención básica",
        "nivel": "BASICO",
        "descripcion": "Ajuste general y lubricación",
        "incluye": "Ajuste de frenos y cambios, lubricación de cadena y revisión de presión",
        "precio": 25000,
        "diasEstimados": 1,
        "activo": true,
        "_links": {
          "self": {
            "href": "http://localhost:9015/api/v1/tipos-servicio/1"
          }
        }
      }
    ]
  },
  "_links": {
    "self": {
      "href": "http://localhost:9015/api/v1/tipos-servicio"
    }
  }
}
```

## Modelo de datos

### TipoServicio (tabla `tipos_servicio`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idTipoServicio | Long | id_tipo_servicio | PK, autoincremental |
| nombre | String | nombre | NOT NULL, único, máx. 60 |
| nivel | NivelServicio (enum) | nivel | NOT NULL: `BASICO`, `MEDIANO`, `FULL` |
| descripcion | String | descripcion | NOT NULL, máx. 255 |
| incluye | String | incluye | NOT NULL, máx. 500 |
| precio | Integer | precio | NOT NULL |
| diasEstimados | Integer | dias_estimados | NOT NULL |
| activo | Boolean | activo | NOT NULL |

### Bicicleta (tabla `bicicletas`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idBicicleta | Long | id_bicicleta | PK, autoincremental |
| marca | String | marca | NOT NULL, máx. 50 |
| modelo | String | modelo | NOT NULL, máx. 80 |
| tipo | TipoBicicleta (enum) | tipo | NOT NULL: `MTB`, `RUTA`, `GRAVEL`, `URBANA`, `ELECTRICA`, `INFANTIL` |
| aro | String | aro | NOT NULL, máx. 10 |
| color | String | color | NOT NULL, máx. 30 |
| numeroSerie | String | numero_serie | opcional, único, máx. 40 |
| rutCliente | String | rut_cliente | opcional, máx. 12 |

### SolicitudServicio (tabla `solicitudes_servicio`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idSolicitudServicio | Long | id_solicitud_servicio | PK, autoincremental |
| nombreContacto | String | nombre_contacto | NOT NULL, máx. 100 |
| telefonoContacto | String | telefono_contacto | NOT NULL, máx. 15 |
| emailContacto | String | email_contacto | opcional, máx. 100 |
| rutCliente | String | rut_cliente | opcional, máx. 12 |
| descripcionFalla | String | descripcion_falla | NOT NULL, máx. 1000 |
| fechaSolicitud | LocalDateTime | fecha_solicitud | NOT NULL |
| fechaPreferida | LocalDate | fecha_preferida | opcional |
| estado | EstadoSolicitud (enum) | estado | NOT NULL: `PENDIENTE`, `AGENDADA`, `CONVERTIDA_EN_ORDEN`, `CANCELADA` |
| tipoServicio | TipoServicio | id_tipo_servicio | FK a TipoServicio, NOT NULL |

### FotoSolicitud (tabla `fotos_solicitud`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idFotoSolicitud | Long | id_foto_solicitud | PK, autoincremental |
| url | String | url | NOT NULL, máx. 255 |
| formato | String | formato | NOT NULL, máx. 10 |
| tamanoKb | Integer | tamano_kb | NOT NULL |
| solicitudServicio | SolicitudServicio | id_solicitud_servicio | FK a SolicitudServicio, NOT NULL |

### OrdenTrabajo (tabla `ordenes_trabajo`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idOrdenTrabajo | Long | id_orden_trabajo | PK, autoincremental |
| codigo | String | codigo | opcional, único, máx. 20 |
| fechaIngreso | LocalDateTime | fecha_ingreso | NOT NULL |
| fechaEstimadaEntrega | LocalDate | fecha_estimada_entrega | NOT NULL |
| fechaEntrega | LocalDateTime | fecha_entrega | opcional |
| estado | EstadoOrden (enum) | estado | NOT NULL: `RECIBIDA`, `EN_REVISION`, `EN_REPARACION`, `LISTA`, `ENTREGADA`, `CANCELADA` |
| nombreCliente | String | nombre_cliente | NOT NULL, máx. 100 |
| telefonoCliente | String | telefono_cliente | NOT NULL, máx. 15 |
| emailCliente | String | email_cliente | opcional, máx. 100 |
| rutCliente | String | rut_cliente | opcional, máx. 12 |
| diagnostico | String | diagnostico | opcional, máx. 1000 |
| costoManoObra | Integer | costo_mano_obra | NOT NULL |
| idEmpleado | Long | id_empleado | NOT NULL |
| bicicleta | Bicicleta | id_bicicleta | FK a Bicicleta, NOT NULL |
| tipoServicio | TipoServicio | id_tipo_servicio | FK a TipoServicio, NOT NULL |
| solicitudServicio | SolicitudServicio | id_solicitud_servicio | FK a SolicitudServicio, opcional |

### HistorialEstadoOrden (tabla `historial_estados_orden`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idHistorialEstadoOrden | Long | id_historial_estado_orden | PK, autoincremental |
| estadoAnterior | EstadoOrden (enum) | estado_anterior | opcional: `RECIBIDA`, `EN_REVISION`, `EN_REPARACION`, `LISTA`, `ENTREGADA`, `CANCELADA` |
| estadoNuevo | EstadoOrden (enum) | estado_nuevo | NOT NULL: `RECIBIDA`, `EN_REVISION`, `EN_REPARACION`, `LISTA`, `ENTREGADA`, `CANCELADA` |
| fechaCambio | LocalDateTime | fecha_cambio | NOT NULL |
| idEmpleado | Long | id_empleado | opcional |
| comentario | String | comentario | opcional, máx. 255 |
| ordenTrabajo | OrdenTrabajo | id_orden_trabajo | FK a OrdenTrabajo, NOT NULL |

### RepuestoUtilizado (tabla `repuestos_utilizados`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idRepuestoUtilizado | Long | id_repuesto_utilizado | PK, autoincremental |
| idVariante | Long | id_variante | NOT NULL |
| cantidad | Integer | cantidad | NOT NULL |
| precioUnitario | Integer | precio_unitario | NOT NULL |
| fechaRegistro | LocalDateTime | fecha_registro | NOT NULL |
| ordenTrabajo | OrdenTrabajo | id_orden_trabajo | FK a OrdenTrabajo, NOT NULL |

### NotificacionTaller (tabla `notificaciones_taller`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idNotificacionTaller | Long | id_notificacion_taller | PK, autoincremental |
| tipo | String | tipo | NOT NULL, máx. 30 |
| destinatario | String | destinatario | NOT NULL, máx. 100 |
| mensaje | String | mensaje | NOT NULL, máx. 255 |
| fechaEnvio | LocalDateTime | fecha_envio | NOT NULL |
| enviada | Boolean | enviada | NOT NULL |
| ordenTrabajo | OrdenTrabajo | id_orden_trabajo | FK a OrdenTrabajo, NOT NULL |

### CalificacionServicio (tabla `calificaciones_servicio`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idCalificacionServicio | Long | id_calificacion_servicio | PK, autoincremental |
| puntuacion | Integer | puntuacion | NOT NULL |
| comentario | String | comentario | opcional, máx. 500 |
| fechaCalificacion | LocalDateTime | fecha_calificacion | NOT NULL |
| ordenTrabajo | OrdenTrabajo | id_orden_trabajo | FK a OrdenTrabajo, NOT NULL, único |

## Tests

Los tests usan el perfil `test` (`src/test/resources/application-test.properties`) con H2 en memoria, así que **no necesitan MySQL ni los otros microservicios**: el `RestTemplate` se reemplaza por un mock (`@Mock` en el test de service y `@MockitoBean` en el de integración).

```bash
./mvnw test
```

Reporte de cobertura JaCoCo: `target/site/jacoco/index.html`

Por cada clase hay tres archivos de test:

| Test | Tipo | Qué cubre |
|---|---|---|
| `<Clase>ServiceTest` | Unitario (Mockito) | Todos los métodos del service, casos no existentes y relaciones inexistentes, más las reglas del taller (código de la orden, historial, aviso de bicicleta lista, stock de repuestos, fotos y calificación) |
| `<Clase>ControllerTest` | `@WebMvcTest` | Códigos HTTP, campos, enlaces HATEOAS, 400, 404 y 409 |
| `<Clase>ControllerIT` | Integración (`@SpringBootTest` + H2) | Crear + listar + búsqueda, actualizar, eliminar + 404; en las clases con reglas también el 400 o 409 correspondiente |

Además, `ServicioTecnicoApplicationTests` prueba la carga del contexto, y `LimpiezaBaseDatos` vacía las tablas antes de cada test de integración en el orden correcto, primero los registros que dependen de otros.

## Estructura del proyecto

```
ms-servicio-tecnico/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/ridertapia/serviciotecnico/
    │   │   ├── ServicioTecnicoApplication.java
    │   │   ├── controller/   (9 controllers, uno por clase)
    │   │   ├── model/        (9 entidades + 4 enums)
    │   │   ├── repository/   (9 repositories)
    │   │   └── service/      (9 services)
    │   └── resources/application.properties
    └── test/
        ├── java/com/ridertapia/serviciotecnico/
        │   ├── ServicioTecnicoApplicationTests.java
        │   ├── LimpiezaBaseDatos.java
        │   ├── controller/   (<Clase>ControllerTest y <Clase>ControllerIT)
        │   └── service/      (<Clase>ServiceTest)
        └── resources/application-test.properties
```
