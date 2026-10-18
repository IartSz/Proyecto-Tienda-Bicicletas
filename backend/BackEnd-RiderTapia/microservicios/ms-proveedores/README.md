# ms-proveedores — Rider Tapia Biker

Microservicio REST de **proveedores** de Rider Tapia Biker. Registra y mantiene los proveedores de la tienda, los asocia a los productos que venden (con su costo y plazo de entrega) y gestiona las órdenes de compra y su recepción. Así se sabe a quién comprarle cada cosa y la reposición queda ordenada. Las respuestas siguen el formato HATEOAS (HAL).

Cuando llega la mercadería, cada producto recibido **suma stock en `ms-inventario`** y deja un ingreso de mercancía con el documento del proveedor.

## Tecnologías

| Tecnología | Versión |
|---|---|
| Java | 25 |
| Spring Boot | 4.0.6 (webmvc, data-jpa, hateoas) |
| springdoc-openapi (Swagger UI) | 3.0.3 |
| MySQL (mysql-connector-j) | runtime |
| H2 | runtime y tests |
| Lombok | gestionado por Spring Boot |
| RestTemplate | cliente HTTP hacia ms-productos y ms-inventario |
| JUnit 5 + Mockito + MockMvc | tests |
| JaCoCo | 0.8.14 |

## Del diagrama al código

| Clase del diagrama | En el código |
|---|---|
| Proveedor, ProductoProveedor, OrdenCompra, DetalleOrdenCompra, RecepcionCompra, DetalleRecepcion | Entidades JPA, cada una con repository, service, controller y tests |
| EstadoOrdenCompra, TipoDocumentoRecepcion | Enums de Java guardados como texto |
| Producto, VarianteProducto | Están en `ms-productos`: se guarda solo `idVariante` y se valida por HTTP |
| ItemInventario, IngresoMercancia | Están en `ms-inventario`: al recibir mercadería se suma el stock por HTTP |
| Empleado | Pertenece a `ms-usuario`: se guarda solo su id (`idEmpleado`) |

Relaciones dentro del microservicio:

- ProductoProveedor y OrdenCompra → Proveedor.
- DetalleOrdenCompra y RecepcionCompra → OrdenCompra.
- DetalleRecepcion → RecepcionCompra y DetalleOrdenCompra.
- Un proveedor no puede tener dos veces la misma variante (`id_proveedor` + `id_variante` es único).

## Rol en la arquitectura

**Consume**:

- `ms-productos` (puerto 9005): antes de asociar una variante a un proveedor llama a `GET /api/v1/variantes/{idVariante}`. Si la variante no existe, no se guarda y responde 404. La URL se configura en `ms.productos.variantes-url`.
- `ms-inventario` (puerto 9008), al registrar un detalle de recepción:
  - `GET /api/v1/items-inventario/idVariante/{idVariante}`: busca el ítem de inventario de la variante (si no tiene, 404).
  - `PUT /api/v1/items-inventario/{id}`: suma las unidades recibidas.
  - `POST /api/v1/ingresos`: deja el ingreso de mercancía con el costo, el documento y el `idProveedor`.
  - Las URLs se configuran en `ms.inventario.items-url` y `ms.inventario.ingresos-url`.

**Es consumido por**:

- Panel administrador: mantención de proveedores, productos por proveedor, órdenes de compra y recepción de mercadería.
- `ms-inventario`: sus ítems e ingresos guardan los ids de proveedor (`idProveedores`, `idProveedor`) de este microservicio; con `GET /api/v1/productos-proveedor/idVariante/{idVariante}` se sabe a quién comprarle cada producto (por ejemplo, ante una alerta de stock bajo, HU-37).

Para crear productos por proveedor en local, `ms-productos` debe estar levantado. Para recibir mercadería, también `ms-inventario`.

## Reglas del negocio

| Regla | Dónde |
|---|---|
| Si la orden de compra llega sin `numero` se genera `OC-00001`, `OC-00002`, etc. Si llega sin `estado` parte en `BORRADOR` | `OrdenCompraService` |
| El IVA (19%) y el total se calculan siempre a partir de `montoNeto`, al crear y al actualizar | `OrdenCompraService` |
| Un detalle de orden de compra parte con `cantidadRecibida = 0` | `DetalleOrdenCompraService` |
| Solo se recibe mercadería de una orden `ENVIADA` o `RECIBIDA_PARCIAL`; si no, responde **409** | `RecepcionCompraService` |
| Un detalle de recepción debe ser de la misma orden de la recepción y no puede superar lo pendiente; si no, responde **409**. La cantidad debe ser mayor a 0 (si no, **400**) | `DetalleRecepcionService` |
| Al registrar un detalle de recepción se suma el stock en `ms-inventario`, se actualiza `cantidadRecibida` y la orden queda `RECIBIDA` cuando llegó todo o `RECIBIDA_PARCIAL` si falta algo. El PUT solo corrige el registro, no vuelve a mover el stock | `DetalleRecepcionService` |

## Configuración

| Propiedad | Valor |
|---|---|
| Puerto | `9011` |
| Base de datos | `ridertapia_proveedores` (MySQL, se crea sola con `createDatabaseIfNotExist=true`) |
| Usuario / clave MySQL | `root` / vacío (ajustar en `application.properties`) |
| URL variantes | `ms.productos.variantes-url=http://localhost:9005/api/v1/variantes` |
| URL ítems de inventario | `ms.inventario.items-url=http://localhost:9008/api/v1/items-inventario` |
| URL ingresos | `ms.inventario.ingresos-url=http://localhost:9008/api/v1/ingresos` |
| Swagger UI | http://localhost:9011/doc/swagger-ui.html |
| OpenAPI JSON | http://localhost:9011/api-docs |

Ejecutar:

```bash
./mvnw spring-boot:run
```

Al crear o actualizar, las relaciones se envían solo con su id (por ejemplo `"proveedor": {"idProveedor": 1}`). Si no existe responde 404. Al eliminar un registro que otro está usando (por ejemplo, un proveedor con órdenes de compra) responde 409. Un RUT de proveedor repetido también responde 409.

## Endpoints

Cada clase tiene su propio controller con el mismo patrón: listar, obtener por id, una o dos búsquedas, crear, actualizar y eliminar.

### Proveedor — `/api/v1/proveedores`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/proveedores` | Lista todos | 200 |
| GET | `/api/v1/proveedores/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/proveedores/rut/{rut}` | Busca por rut | 200 / 404 |
| POST | `/api/v1/proveedores` | Crea | 201 / 409 si el valor único ya existe |
| PUT | `/api/v1/proveedores/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/proveedores/{id}` | Elimina | 204 / 409 si está en uso |

### ProductoProveedor — `/api/v1/productos-proveedor`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/productos-proveedor` | Lista todos | 200 |
| GET | `/api/v1/productos-proveedor/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/productos-proveedor/idVariante/{idVariante}` | Lista los que tienen ese idVariante | 200 |
| GET | `/api/v1/productos-proveedor/proveedor/{idProveedor}` | Lista los de un proveedor | 200 |
| POST | `/api/v1/productos-proveedor` | Crea | 201 / 404 si el proveedor o la variante no existe / 409 si el valor único ya existe |
| PUT | `/api/v1/productos-proveedor/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/productos-proveedor/{id}` | Elimina | 204 |

### OrdenCompra — `/api/v1/ordenes-compra`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/ordenes-compra` | Lista todos | 200 |
| GET | `/api/v1/ordenes-compra/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/ordenes-compra/proveedor/{idProveedor}` | Lista los de un proveedor | 200 |
| GET | `/api/v1/ordenes-compra/estado/{estado}` | Lista los que tienen ese estado | 200 |
| POST | `/api/v1/ordenes-compra` | Crea | 201 / 404 si una relación no existe / 409 si el valor único ya existe |
| PUT | `/api/v1/ordenes-compra/{id}` | Actualiza | 200 / 404 / 409 si el valor único ya existe |
| DELETE | `/api/v1/ordenes-compra/{id}` | Elimina | 204 / 409 si está en uso |

### DetalleOrdenCompra — `/api/v1/detalles-orden-compra`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/detalles-orden-compra` | Lista todos | 200 |
| GET | `/api/v1/detalles-orden-compra/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/detalles-orden-compra/ordenCompra/{idOrdenCompra}` | Lista los de una ordenCompra | 200 |
| POST | `/api/v1/detalles-orden-compra` | Crea | 201 / 404 si una relación no existe |
| PUT | `/api/v1/detalles-orden-compra/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/detalles-orden-compra/{id}` | Elimina | 204 / 409 si está en uso |

### RecepcionCompra — `/api/v1/recepciones-compra`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/recepciones-compra` | Lista todos | 200 |
| GET | `/api/v1/recepciones-compra/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/recepciones-compra/ordenCompra/{idOrdenCompra}` | Lista los de una ordenCompra | 200 |
| POST | `/api/v1/recepciones-compra` | Crea | 201 / 404 si una relación no existe / 409 si la orden no está enviada |
| PUT | `/api/v1/recepciones-compra/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/recepciones-compra/{id}` | Elimina | 204 / 409 si está en uso |

### DetalleRecepcion — `/api/v1/detalles-recepcion`

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | `/api/v1/detalles-recepcion` | Lista todos | 200 |
| GET | `/api/v1/detalles-recepcion/{id}` | Obtiene por id | 200 / 404 |
| GET | `/api/v1/detalles-recepcion/recepcionCompra/{idRecepcionCompra}` | Lista los de una recepcionCompra | 200 |
| POST | `/api/v1/detalles-recepcion` | Crea | 201 / 404 si una relación o el inventario de la variante no existe / 409 si es más de lo pendiente o de otra orden / 400 si la cantidad no es válida |
| PUT | `/api/v1/detalles-recepcion/{id}` | Actualiza | 200 / 404 |
| DELETE | `/api/v1/detalles-recepcion/{id}` | Elimina | 204 |

### Ejemplo: OrdenCompra

Entrada (POST / PUT). Las relaciones se envían solo con su id:

```json
{
  "numero": "OC-00001",
  "fechaEmision": "2026-10-08T09:00:00",
  "fechaEntregaEsperada": "2026-10-15",
  "estado": "ENVIADA",
  "montoNeto": 1040000,
  "iva": 197600,
  "total": 1237600,
  "observacion": "Reposición de bicicletas Marlin 7",
  "idEmpleado": 1,
  "proveedor": {
    "idProveedor": 1
  }
}
```

Respuesta HATEOAS (las relaciones vuelven completas):

```json
{
  "idOrdenCompra": 1,
  "numero": "OC-00001",
  "fechaEmision": "2026-10-08T09:00:00",
  "fechaEntregaEsperada": "2026-10-15",
  "estado": "ENVIADA",
  "montoNeto": 1040000,
  "iva": 197600,
  "total": 1237600,
  "observacion": "Reposición de bicicletas Marlin 7",
  "idEmpleado": 1,
  "proveedor": {
    "idProveedor": 1,
    "rut": "76123456-7",
    "razonSocial": "Distribuidora Andes Bike SpA",
    "nombreFantasia": "Andes Bike",
    "giro": "Venta al por mayor de bicicletas y repuestos",
    "email": "ventas@andesbike.cl",
    "telefono": "223456789",
    "direccion": "Av. Vicuña Mackenna 1234",
    "comuna": "Santiago",
    "nombreContacto": "Carolina Muñoz",
    "activo": true
  },
  "_links": {
    "self": {
      "href": "http://localhost:9011/api/v1/ordenes-compra/1"
    },
    "ordenesCompra": {
      "href": "http://localhost:9011/api/v1/ordenes-compra"
    }
  }
}
```

### Ejemplo: DetalleRecepcion

Entrada (POST / PUT). Las relaciones se envían solo con su id:

```json
{
  "cantidadRecibida": 1,
  "recepcionCompra": {
    "idRecepcionCompra": 1
  },
  "detalleOrdenCompra": {
    "idDetalleOrdenCompra": 1
  }
}
```

Respuesta HATEOAS (las relaciones vuelven completas):

```json
{
  "idDetalleRecepcion": 1,
  "cantidadRecibida": 1,
  "recepcionCompra": {
    "idRecepcionCompra": 1,
    "fechaRecepcion": "2026-10-15T11:00:00",
    "tipoDocumento": "FACTURA",
    "numeroDocumento": "FAC-88123",
    "observacion": "Llegó todo en buen estado",
    "idEmpleado": 2,
    "ordenCompra": {
      "idOrdenCompra": 1,
      "numero": "OC-00001",
      "fechaEmision": "2026-10-08T09:00:00",
      "fechaEntregaEsperada": "2026-10-15",
      "estado": "ENVIADA",
      "montoNeto": 1040000,
      "iva": 197600,
      "total": 1237600,
      "observacion": "Reposición de bicicletas Marlin 7",
      "idEmpleado": 1,
      "proveedor": {
        "idProveedor": 1,
        "rut": "76123456-7",
        "razonSocial": "Distribuidora Andes Bike SpA",
        "nombreFantasia": "Andes Bike",
        "giro": "Venta al por mayor de bicicletas y repuestos",
        "email": "ventas@andesbike.cl",
        "telefono": "223456789",
        "direccion": "Av. Vicuña Mackenna 1234",
        "comuna": "Santiago",
        "nombreContacto": "Carolina Muñoz",
        "activo": true
      }
    }
  },
  "detalleOrdenCompra": {
    "idDetalleOrdenCompra": 1,
    "idVariante": 10,
    "cantidadSolicitada": 2,
    "cantidadRecibida": 0,
    "costoUnitario": 520000,
    "ordenCompra": {
      "idOrdenCompra": 1,
      "numero": "OC-00001",
      "fechaEmision": "2026-10-08T09:00:00",
      "fechaEntregaEsperada": "2026-10-15",
      "estado": "ENVIADA",
      "montoNeto": 1040000,
      "iva": 197600,
      "total": 1237600,
      "observacion": "Reposición de bicicletas Marlin 7",
      "idEmpleado": 1,
      "proveedor": {
        "idProveedor": 1,
        "rut": "76123456-7",
        "razonSocial": "Distribuidora Andes Bike SpA",
        "nombreFantasia": "Andes Bike",
        "giro": "Venta al por mayor de bicicletas y repuestos",
        "email": "ventas@andesbike.cl",
        "telefono": "223456789",
        "direccion": "Av. Vicuña Mackenna 1234",
        "comuna": "Santiago",
        "nombreContacto": "Carolina Muñoz",
        "activo": true
      }
    }
  },
  "_links": {
    "self": {
      "href": "http://localhost:9011/api/v1/detalles-recepcion/1"
    },
    "detallesRecepcion": {
      "href": "http://localhost:9011/api/v1/detalles-recepcion"
    }
  }
}
```

### Ejemplo de listado HATEOAS (Proveedor)

```json
{
  "_embedded": {
    "proveedorList": [
      {
        "idProveedor": 1,
        "rut": "76123456-7",
        "razonSocial": "Distribuidora Andes Bike SpA",
        "nombreFantasia": "Andes Bike",
        "giro": "Venta al por mayor de bicicletas y repuestos",
        "email": "ventas@andesbike.cl",
        "telefono": "223456789",
        "direccion": "Av. Vicuña Mackenna 1234",
        "comuna": "Santiago",
        "nombreContacto": "Carolina Muñoz",
        "activo": true,
        "_links": {
          "self": {
            "href": "http://localhost:9011/api/v1/proveedores/1"
          }
        }
      }
    ]
  },
  "_links": {
    "self": {
      "href": "http://localhost:9011/api/v1/proveedores"
    }
  }
}
```

## Modelo de datos

### Proveedor (tabla `proveedores`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idProveedor | Long | id_proveedor | PK, autoincremental |
| rut | String | rut | NOT NULL, único, máx. 12 |
| razonSocial | String | razon_social | NOT NULL, máx. 150 |
| nombreFantasia | String | nombre_fantasia | opcional, máx. 100 |
| giro | String | giro | opcional, máx. 150 |
| email | String | email | NOT NULL, máx. 100 |
| telefono | String | telefono | NOT NULL, máx. 15 |
| direccion | String | direccion | NOT NULL, máx. 200 |
| comuna | String | comuna | NOT NULL, máx. 60 |
| nombreContacto | String | nombre_contacto | opcional, máx. 100 |
| activo | Boolean | activo | NOT NULL |

### ProductoProveedor (tabla `productos_proveedor`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idProductoProveedor | Long | id_producto_proveedor | PK, autoincremental |
| idVariante | Long | id_variante | NOT NULL |
| codigoProveedor | String | codigo_proveedor | opcional, máx. 40 |
| costoUnitario | Integer | costo_unitario | NOT NULL |
| plazoEntregaDias | Integer | plazo_entrega_dias | NOT NULL |
| preferido | Boolean | preferido | NOT NULL |
| proveedor | Proveedor | id_proveedor | FK a Proveedor, NOT NULL |

### OrdenCompra (tabla `ordenes_compra`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idOrdenCompra | Long | id_orden_compra | PK, autoincremental |
| numero | String | numero | opcional, único, máx. 20 |
| fechaEmision | LocalDateTime | fecha_emision | NOT NULL |
| fechaEntregaEsperada | LocalDate | fecha_entrega_esperada | opcional |
| estado | EstadoOrdenCompra (enum) | estado | NOT NULL: `BORRADOR`, `ENVIADA`, `RECIBIDA_PARCIAL`, `RECIBIDA`, `CANCELADA` |
| montoNeto | Integer | monto_neto | NOT NULL |
| iva | Integer | iva | NOT NULL |
| total | Integer | total | NOT NULL |
| observacion | String | observacion | opcional, máx. 255 |
| idEmpleado | Long | id_empleado | NOT NULL |
| proveedor | Proveedor | id_proveedor | FK a Proveedor, NOT NULL |

### DetalleOrdenCompra (tabla `detalles_orden_compra`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idDetalleOrdenCompra | Long | id_detalle_orden_compra | PK, autoincremental |
| idVariante | Long | id_variante | NOT NULL |
| cantidadSolicitada | Integer | cantidad_solicitada | NOT NULL |
| cantidadRecibida | Integer | cantidad_recibida | NOT NULL |
| costoUnitario | Integer | costo_unitario | NOT NULL |
| ordenCompra | OrdenCompra | id_orden_compra | FK a OrdenCompra, NOT NULL |

### RecepcionCompra (tabla `recepciones_compra`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idRecepcionCompra | Long | id_recepcion_compra | PK, autoincremental |
| fechaRecepcion | LocalDateTime | fecha_recepcion | NOT NULL |
| tipoDocumento | TipoDocumentoRecepcion (enum) | tipo_documento | NOT NULL: `FACTURA`, `GUIA_DESPACHO` |
| numeroDocumento | String | numero_documento | NOT NULL, máx. 30 |
| observacion | String | observacion | opcional, máx. 255 |
| idEmpleado | Long | id_empleado | NOT NULL |
| ordenCompra | OrdenCompra | id_orden_compra | FK a OrdenCompra, NOT NULL |

### DetalleRecepcion (tabla `detalles_recepcion`)

| Campo | Tipo | Columna | Restricciones |
|---|---|---|---|
| idDetalleRecepcion | Long | id_detalle_recepcion | PK, autoincremental |
| cantidadRecibida | Integer | cantidad_recibida | NOT NULL |
| recepcionCompra | RecepcionCompra | id_recepcion_compra | FK a RecepcionCompra, NOT NULL |
| detalleOrdenCompra | DetalleOrdenCompra | id_detalle_orden_compra | FK a DetalleOrdenCompra, NOT NULL |

## Tests

Los tests usan el perfil `test` (`src/test/resources/application-test.properties`) con H2 en memoria, así que **no necesitan MySQL ni los otros microservicios**: el `RestTemplate` se reemplaza por un mock (`@Mock` en el test de service y `@MockitoBean` en el de integración).

```bash
./mvnw test
```

Reporte de cobertura JaCoCo: `target/site/jacoco/index.html`

Por cada clase hay tres archivos de test:

| Test | Tipo | Qué cubre |
|---|---|---|
| `<Clase>ServiceTest` | Unitario (Mockito) | Todos los métodos del service, casos no existentes y relaciones inexistentes, más las reglas de compras (número e IVA de la orden, variante inexistente, recepción parcial o completa, cantidad mayor a lo pendiente) |
| `<Clase>ControllerTest` | `@WebMvcTest` | Códigos HTTP, campos, enlaces HATEOAS, 400, 404 y 409 |
| `<Clase>ControllerIT` | Integración (`@SpringBootTest` + H2) | Crear + listar + búsqueda, actualizar, eliminar + 404; en las clases con reglas también el 400 o 409 correspondiente |

Además, `ProveedoresApplicationTests` prueba la carga del contexto, y `LimpiezaBaseDatos` vacía las tablas antes de cada test de integración en el orden correcto, primero los registros que dependen de otros.

## Estructura del proyecto

```
ms-proveedores/
├── pom.xml
├── README.md
└── src/
    ├── main/
    │   ├── java/com/ridertapia/proveedores/
    │   │   ├── ProveedoresApplication.java
    │   │   ├── controller/   (6 controllers, uno por clase)
    │   │   ├── model/        (6 entidades + 2 enums)
    │   │   ├── repository/   (6 repositories)
    │   │   └── service/      (6 services)
    │   └── resources/application.properties
    └── test/
        ├── java/com/ridertapia/proveedores/
        │   ├── ProveedoresApplicationTests.java
        │   ├── LimpiezaBaseDatos.java
        │   ├── controller/   (<Clase>ControllerTest y <Clase>ControllerIT)
        │   └── service/      (<Clase>ServiceTest)
        └── resources/application-test.properties
```
