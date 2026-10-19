# reportes-service

Microservicio de **reportes de ventas** y **documentos de venta** de *Rider Tapia Biker*: reportes diarios, semanales y mensuales con los productos más vendidos, y emisión de boletas y facturas.

| | |
|---|---|
| Puerto | `9004` |
| Base de datos | `ridertapia_reportes` (MySQL) |
| Stack | Java 17 · Spring Boot 3.3.5 · Spring Data JPA · Spring HATEOAS · springdoc-openapi · Lombok |
| Depende de | servicio de **pedidos** (lee pedidos y sus detalles) |

## Qué hace

- **Reportes**: suma las ventas de un período (día, semana de lunes a domingo, o mes) y arma el ranking de productos más vendidos, ordenado por unidades y, en empate, por monto. Si el reporte del período ya existía, se recalcula.
- **Documentos de venta**: emite boletas y facturas de pedidos pagados. El total del pedido ya incluye IVA (19%), por eso `neto = total / 1,19`. Cada tipo tiene su propia numeración correlativa. La factura exige los datos de la empresa con RUT válido. El descuento del pedido se agrega como una línea negativa.

Solo cuentan como **venta** los pedidos en los estados de `reportes.estados-venta`; los pendientes, anulados o expirados no suman ni tienen documento.

## Cómo ejecutarlo

Requisitos: **Java 17**, **Maven 3.9+** y **MySQL** corriendo en `localhost:3306`.

```bash
# usuario y clave de tu MySQL (por defecto root y sin clave)
export DB_USER=root
export DB_PASSWORD=tu_clave

mvn spring-boot:run
```

Necesita el servicio de **pedidos** corriendo. Configura su dirección y los estados que cuentan como venta (deben coincidir con tu enum de estados de pedido):
```bash
export PEDIDOS_SERVICE_URL=http://localhost:9006
export ESTADOS_VENTA=PAGADO,ENTREGADO,COMPLETADO
```

La base de datos `ridertapia_reportes` se crea sola la primera vez (`createDatabaseIfNotExist=true`) y las tablas se generan con JPA (`ddl-auto=update`).

Documentación interactiva (Swagger): <http://localhost:9004/swagger-ui.html>

## Estructura

```
src/main/java/cl/ridertapia/reportesservice/
├── controller/   endpoints REST y assemblers HATEOAS
├── dto/          datos de entrada y salida
├── exception/    ApiException y manejo global de errores
├── model/        entidades JPA
├── repository/   acceso a la base de datos
└── service/      reglas de negocio
                  (PedidoRemotoService consulta al servicio de pedidos)
src/test/java/...  pruebas (misma estructura de paquetes)
```

## Endpoints

Base: `/api/v1`. Las respuestas siguen **HATEOAS (HAL)**: cada recurso trae `_links` y los listados vienen en `_embedded.reportes o documentos`. Un listado vacío no trae `_embedded`.

### Reportes — `/api/v1/reportes`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/reportes/diario?fecha=&top=&generadoPor=` | Genera el reporte del día (201) |
| POST | `/reportes/semanal?fecha=&top=&generadoPor=` | Genera el de la semana que contiene la fecha |
| POST | `/reportes/mensual?fecha=&top=&generadoPor=` | Genera el del mes que contiene la fecha |
| GET | `/reportes?tipo=` | Lista, del más reciente al más antiguo (`DIARIO`, `SEMANAL`, `MENSUAL`) |
| GET | `/reportes/{id}` | Reporte con su ranking de más vendidos |
| GET | `/reportes/{id}/mas-vendidos` | Solo el ranking |

Todos los parámetros de generación son opcionales: `fecha` (formato `2026-10-15`, por defecto hoy), `top` (1 a 50, por defecto 10) y `generadoPor`.

### Documentos — `/api/v1/documentos`

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/documentos/boleta` | Emite una boleta (201) |
| POST | `/documentos/factura` | Emite una factura (201) |
| GET | `/documentos?tipo=` | Lista (`BOLETA` o `FACTURA`) |
| GET | `/documentos/{id}` | Documento con sus líneas |
| GET | `/documentos/pedido/{idPedido}` | Documento emitido para un pedido |
| GET | `/documentos/buscar?tipo=&numero=` | Busca por tipo y número |
| GET | `/documentos/cliente/{idCliente}` | Documentos de un cliente |

### Ejemplos

Boleta:
```json
{ "idPedido": 1 }
```

Factura:
```json
{
  "idPedido": 2, "rutEmpresa": "76543210-3", "razonSocial": "Ciclos del Sur SpA",
  "giro": "Venta de bicicletas", "direccionEmpresa": "Av. Colón 1234"
}
```

Reporte (respuesta resumida):
```json
{
  "reporte": { "idReporte": 1, "tipo": "DIARIO", "fechaInicio": "2026-10-15", "fechaFin": "2026-10-15",
               "totalVentas": 238000, "cantidadPedidos": 5 },
  "masVendidos": [ { "idVariante": 100, "nombreProducto": "Variante 100", "cantidadVendida": 3, "totalVendido": 150000 } ]
}
```

## Servicio de pedidos que consume

| Llamada | Para qué |
|---|---|
| `GET /api/v1/pedidos` y `/api/v1/pedidos/{id}` | Armar reportes y validar el pedido a documentar |
| `GET /api/v1/detalles` y `/api/v1/detalles/pedido/{id}` | Productos vendidos y líneas del documento |

Acepta listas simples o respuestas HAL (`_embedded`).

## Formato de errores

Todos los errores responden con el mismo cuerpo:

```json
{ "timestamp": "2026-10-15T12:00:00", "status": 409, "mensaje": "El pedido 1 ya tiene un documento emitido" }
```

| Código | Cuándo ocurre |
|---|---|
| 400 | Fecha mal escrita, `top` fuera de rango, RUT de empresa inválido, pedido sin pagar o sin productos |
| 404 | No existe el reporte, el documento o el pedido |
| 409 | El pedido ya tiene documento, o conflicto al guardar |
| 503 | El servicio de pedidos no está disponible |

## Pruebas

```bash
mvn test      # pruebas unitarias, de controlador y de repositorio
mvn verify    # además ejecuta las pruebas de integración (*IT)
mvn test -Dtest=ReporteControllerIT   # una sola clase
```

| Tipo | Qué prueba | Archivos |
|---|---|---|
| Unitarias (Mockito) | Cálculo de reportes, IVA, numeración, estados de venta | `ReporteVentasServiceTest`, `DocumentoVentaServiceTest`, `CriterioVentaTest` |
| Cliente HTTP | Lectura de pedidos simulada (HAL, arreglo simple, 404, 503) | `PedidoRemotoServiceTest` |
| Controlador (`@WebMvcTest`) | Rutas, validaciones, errores y enlaces HATEOAS | `ReporteControllerTest`, `DocumentoVentaControllerTest` |
| Repositorio (`@DataJpaTest`) | Consultas y restricciones de unicidad | `ReporteVentasRepositoryTest`, `DocumentoVentaRepositoryTest`, `ProductoMasVendidoRepositoryTest` |
| Integración | Flujos completos con H2 (pedidos simulado) | `ReporteControllerIT`, `DocumentoVentaControllerIT` |

Las pruebas de repositorio y de integración usan **H2 en memoria**, no necesitan MySQL.

