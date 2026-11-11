# Rider Tapia Biker – Backend

11 microservicios Spring Boot y un API Gateway.

## Requisitos

- JDK 25 y JDK 21 ([adoptium.net](https://adoptium.net))
- MySQL en el puerto 3306 (por ejemplo, XAMPP)

Las bases de datos se crean solas al iniciar. Usuario por defecto: `root` sin contraseña.

## Datos iniciales

Al arrancar, si sus tablas están vacías, `ms-productos` carga el catálogo de la tienda
(`src/main/resources/datos/catalogo-inicial.json`: categorías, marcas, productos, imágenes,
ofertas, especificaciones y variantes) y `ms-inventario` carga el stock de cada variante
(`src/main/resources/datos/stock-inicial.json`, buscando cada variante por su SKU en `ms-productos`).
Si ya hay datos, no se carga nada. Así todos los equipos parten con la misma base.

Para volver al catálogo inicial: detener todo, borrar `ridertapia_productos` y `ridertapia_inventario`
en MySQL e iniciar de nuevo.

## Ejecutar

| Acción | Archivo |
|---|---|
| Iniciar todo | `.\iniciar-todo.ps1` |
| Verificar estado | `.\verificar-todo.ps1` |
| Detener todo | `.\detener-todo.ps1` |

Si el usuario `root` de MySQL tiene contraseña:

```powershell
.\iniciar-todo.ps1 -DbPassword tuClave
```

El gateway usa el puerto 9000. Si está ocupado, usa el 9090.

## Puertos

| Servicio | Puerto | Java |
|---|---|---|
| ms-gateway | 9000 / 9090 | 25 |
| ms-usuario | 9001 | 21 |
| ms-cliente | 9002 | 21 |
| ms-soporte | 9003 | 21 |
| ms-reportes | 9004 | 21 |
| ms-productos | 9005 | 25 |
| ms-pedidos | 9006 | 25 |
| ms-pagos | 9007 | 25 |
| ms-inventario | 9008 | 25 |
| ms-carrito | 9009 | 25 |
| ms-servicio-tecnico | 9015 | 25 |
| ms-proveedores | 9011 | 25 |

## Postman

1. Importar `Documentacion/RiderTapia.postman_collection.json`.
2. Ajustar la variable `gateway` al puerto del gateway.
3. Run collection.

## Documentación

- `Documentacion/Puertos_y_Rutas.md`: rutas, bases de datos y comunicación entre servicios.
- `Documentacion/Ejemplos_Postman.md`: cada endpoint con su JSON.
