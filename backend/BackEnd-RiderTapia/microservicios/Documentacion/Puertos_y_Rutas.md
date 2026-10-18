# Puertos, bases de datos y rutas

## Servicios

| Servicio | Puerto | Base de datos |
|---|---|---|
| ms-gateway | 9000 / 9090 | — |
| ms-usuario | 9001 | `ridertapia_usuarios` |
| ms-cliente | 9002 | `ridertapia_clientes` |
| ms-soporte | 9003 | `ridertapia_soporte` |
| ms-reportes | 9004 | `ridertapia_reportes` |
| ms-productos | 9005 | `ridertapia_productos` |
| ms-pedidos | 9006 | `ridertapia_pedidos` |
| ms-pagos | 9007 | `ridertapia_pagos` |
| ms-inventario | 9008 | `ridertapia_inventario` |
| ms-carrito | 9009 | `ridertapia_carrito` |
| ms-servicio-tecnico | 9015 | `ridertapia_servicio_tecnico` |
| ms-proveedores | 9011 | `ridertapia_proveedores` |

Credenciales de MySQL: variables `DB_USER` (por defecto `root`) y `DB_PASSWORD` (por defecto vacía).

## Rutas del gateway

| Servicio | Rutas (`/api/v1/...`) |
|---|---|
| ms-usuario | `usuarios/**` |
| ms-cliente | `clientes/**` |
| ms-soporte | `garantias/**`, `devoluciones/**`, `contactos/**`, `seguimientos/**`, `soporte/**` |
| ms-reportes | `reportes/**`, `documentos/**` |
| ms-productos | `productos/**`, `categorias/**`, `marcas/**`, `variantes/**`, `imagenes/**`, `especificaciones/**`, `compatibilidades/**`, `ofertas/**`, `resenas/**`, `avisos-stock/**`, `cupones/**` |
| ms-pedidos | `pedidos/**`, `detalles/**`, `historial-estados/**`, `boletas/**`, `facturas/**`, `notificaciones/**`, `visitantes/**` |
| ms-pagos | `pagos-webpay/**`, `pagos-transferencia/**`, `pagos-presenciales/**`, `cierres-caja/**` |
| ms-inventario | `items-inventario/**`, `movimientos/**`, `ingresos/**`, `ajustes/**`, `alertas-stock/**`, `tomas-inventario/**`, `detalles-conteo/**`, `cargas-masivas/**`, `errores-carga/**` |
| ms-carrito | `carritos/**`, `items-carrito/**` |
| ms-servicio-tecnico | `tipos-servicio/**`, `bicicletas/**`, `solicitudes-servicio/**`, `fotos-solicitud/**`, `ordenes-trabajo/**`, `historial-estados-orden/**`, `repuestos-utilizados/**`, `notificaciones-taller/**`, `calificaciones-servicio/**` |
| ms-proveedores | `proveedores/**`, `productos-proveedor/**`, `ordenes-compra/**`, `detalles-orden-compra/**`, `recepciones-compra/**`, `detalles-recepcion/**` |

CORS habilitado para `http://localhost:5500` y `http://127.0.0.1:5500`.

## Comunicación entre servicios

| Origen | Destino | Endpoint | Propiedad |
|---|---|---|---|
| ms-cliente | ms-usuario | `GET /api/v1/usuarios/{rut}` | `usuario.service.url` |
| ms-soporte | ms-usuario | `GET /api/v1/usuarios/{rut}` | `usuario.service.url` |
| ms-reportes | ms-pedidos | `GET /api/v1/pedidos`, `GET /api/v1/detalles` | `pedidos.service.url` |
| ms-inventario | ms-productos | `GET /api/v1/variantes/{id}` | `ms.productos.variantes-url` |
| ms-pagos | ms-pedidos | `GET /api/v1/pedidos/{id}` | `ms.pedidos.url` |
| ms-pedidos | ms-cliente | `GET /api/v1/clientes/{rut}` | `ms.clientes.url` |
| ms-carrito | ms-productos | `GET /api/v1/variantes/{id}`, `GET /api/v1/cupones/codigo/{codigo}` | `ms.productos.variantes-url`, `ms.productos.cupones-url` |
| ms-carrito | ms-inventario | `GET /api/v1/items-inventario/idVariante/{id}` | `ms.inventario.url` |
| ms-carrito | ms-cliente | `GET /api/v1/clientes/{rut}` | `ms.clientes.url` |
| ms-servicio-tecnico | ms-cliente | `GET /api/v1/clientes/{rut}` | `ms.clientes.url` |
| ms-servicio-tecnico | ms-inventario | `GET /api/v1/items-inventario/idVariante/{id}`, `PUT /api/v1/items-inventario/{id}`, `POST /api/v1/movimientos` | `ms.inventario.items-url`, `ms.inventario.movimientos-url` |
| ms-proveedores | ms-productos | `GET /api/v1/variantes/{id}` | `ms.productos.variantes-url` |
| ms-proveedores | ms-inventario | `GET /api/v1/items-inventario/idVariante/{id}`, `PUT /api/v1/items-inventario/{id}`, `POST /api/v1/ingresos` | `ms.inventario.items-url`, `ms.inventario.ingresos-url` |

## Orden de inicio

1. ms-usuario
2. ms-cliente
3. ms-productos
4. ms-inventario
5. ms-pedidos
6. ms-pagos
7. ms-carrito
8. ms-proveedores
9. ms-servicio-tecnico
10. ms-soporte
11. ms-reportes
12. ms-gateway
