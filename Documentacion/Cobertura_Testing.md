# Documento de cobertura de testing (Sprint 10)

Proyecto: Rider Tapia Biker · Frontend React + TypeScript
Herramientas: Vitest (ejecutor y aserciones), React Testing Library (componentes), mocks de Vitest (`vi.mock`, `vi.fn`, `vi.spyOn`) y cobertura V8 (`@vitest/coverage-v8`).

## 1. Cómo ejecutar

```
npm test              # suite completa, una vez
npm run test:watch    # modo vigilancia mientras se programa
npm run coverage      # suite + informe de cobertura (texto en consola y HTML en coverage/index.html)
```

## 2. Resumen de la suite

| Archivo | Tests | Qué prueba | Mocks |
|---|---:|---|---|
| `services/carrito.service.test.ts` | 23 | Agregar, cambiar cantidad, eliminar, totales y validación de stock del carrito (HU-12, 13, 14) | — |
| `services/auth.service.test.ts` | 26 | Registro, login único con detección de rol, cuenta desactivada, perfil y contraseña (HU-1, 3, 5, 8, 9) | `PedidoService` |
| `services/pedido.service.test.ts` | 27 | Crear pedido, estados, cancelación con devolución de stock, historial (HU-2, 17–19, 21–23) | `InventarioService` |
| `utils/validaciones.test.ts` | 22 | RUT, nombre, correo, teléfono y tarjeta (HU-1, 2, 3, 19) | — |
| `services/reporte.service.test.ts` | 11 | Ventas por período, más vendidos, inventario e historial de reportes | — |
| `components/ProductCard.test.tsx` | 11 | Tarjeta de producto: precio, oferta, AGOTADO, botón Agregar (HU-12, 28, 29) | `vi.fn` (onAgregar) |
| `services/cliente.service.test.ts` | 9 | Listado de clientes, desactivar/activar y registro de acciones (HU-5) | `PedidoService` |
| `services/producto.service.test.ts` | 9 | Alerta de stock, precio vigente y CRUD de productos (HU-28, 34, 35, 36, 37) | — |
| `services/categoria.service.test.ts` | 8 | Crear, renombrar y eliminar categorías con reasignación (HU-31) | — |
| `utils/exportar.test.ts` | 7 | Exportar reportes: CSV, descarga y ventana imprimible (PDF) | `window.open`, `HTMLAnchorElement.click` |
| `utils/formato.test.ts` | 8 | Precio en CLP, slug, iniciales y fechas | — |
| `services/inventario.service.test.ts` | 7 | Movimientos de stock y ajustes (HU-30, 36) | `MovimientoService` |
| `pages/Login.test.tsx` | 10 | Pantalla de login: éxito, error, validación y login único para cliente y administrador (HU-8, 9) | `useSesion`, `useNavigate` |
| `utils/estadosPedido.test.ts` | 7 | Reglas de estados del pedido (HU-19, 22, 23) | — |
| `services/movimiento.service.test.ts` | 4 | Registro y límite del historial de movimientos (HU-30, 36) | — |
| **Total** | **189** | Cubren 25 historias de usuario | 7 archivos con mocks |

## 3. Las 10 pruebas más significativas (para la demostración)

| # | Test | HU / CA | Por qué importa | Mock |
|---|---|---|---|---|
| 1 | `HU-12 CA2: un producto sin stock no se puede agregar` | HU-12 CA2 | Evita vender lo que no hay | — |
| 2 | `HU-13 CA2: una cantidad mayor al stock no se permite e indica cuántas quedan` | HU-13 CA2 | Regla central del carrito | — |
| 3 | `HU-1 CA2: un correo ya registrado no crea la cuenta` | HU-1 CA2 | Cuentas únicas | — |
| 4 | `HU-9 CA1: un cliente no puede entrar al panel de administración` | HU-9 CA1 | Seguridad por rol | — |
| 5 | `HU-17 CA1: descuenta del stock cada producto comprado` | HU-17 CA1 | Compra → inventario | `InventarioService` |
| 6 | `HU-22 CA1: cancelar devuelve las unidades al stock` | HU-22 CA1 | Cancelación → inventario | `InventarioService` |
| 7 | `HU-22 CA2: un pedido ya retirado no se puede cancelar` | HU-22 CA2 | Estados finales | `InventarioService` |
| 8 | `HU-3 CA1: los pedidos de la cuenta se actualizan con el nombre nuevo` | HU-3 CA1 | Consistencia entre servicios | `PedidoService` |
| 9 | `HU-8 CA2: con una contraseña incorrecta muestra el error y no navega` | HU-8 CA2 | Flujo completo de la pantalla | `useSesion`, `useNavigate` |
| 10 | `HU-31 CA2: con destino, los productos se reasignan y la categoría se elimina` | HU-31 CA2 | Integridad de datos | — |

## 4. Mocks: qué se reemplaza y por qué

| Mock | Dónde | Para qué |
|---|---|---|
| `InventarioService.mover` → `vi.fn()` | `pedido.service.test.ts` | Probar la lógica de pedidos sin tocar productos reales y comprobar "se llamó con (producto, VENTA, −2)". |
| `MovimientoService.registrar` → `vi.fn()` | `inventario.service.test.ts` | Comprobar que cada cambio de stock deja un movimiento, sin escribir historial. |
| `PedidoService` → `{ listar, actualizar }` | `auth.service.test.ts`, `cliente.service.test.ts` | Controlar qué pedidos "existen" y comprobar que el perfil los actualiza. |
| `useSesion` y `useNavigate` | `Login.test.tsx` | Probar la pantalla sin servicio real: cada test decide si el login "responde" bien o mal y se verifica a dónde navega. |
| `onAgregar = vi.fn()` | `ProductCard.test.tsx` | Comprobar que el botón entrega el producto, sin carrito real. |
| `localStorage` (de jsdom) | todos los servicios | Se limpia antes de cada test: pruebas aisladas y repetibles. |

## 5. Cobertura

**Alcance medido:** `src/services` y `src/utils` completos, que es donde están las reglas de negocio. Se excluyen `data/` (datos), `models/` (solo tipos) y `demo.service.ts` (genera ventas de ejemplo). Resultados reales de `npm run coverage` (Vitest + V8):

| Archivo | % Stmts | % Branch | % Funcs | % Lines | Líneas sin cubrir |
|---|---:|---:|---:|---:|---|
| **Todos los archivos** | **96,24** | **84,16** | **99,43** | **96,69** | |
| **services (total)** | 95,89 | 83,07 | 100 | 96,19 | |
| `auth.service.ts` | 95,27 | 85,71 | 100 | 96,11 | 55, 64, 74, 82 |
| `carrito.service.ts` | 98,41 | 84,21 | 100 | 100 | ramas: 31-53, 66-68, 77 |
| `categoria.service.ts` | 93,33 | 77,27 | 100 | 91,66 | 13, 21, 68-69 |
| `cliente.service.ts` | 92 | 81,81 | 100 | 95,34 | 32, 84 |
| `inventario.service.ts` | 100 | 66,66 | 100 | 100 | ramas: 11-20 |
| `movimiento.service.ts` | 95 | 75 | 100 | 94,73 | 21 |
| `pedido.service.ts` | 98,73 | 87,5 | 100 | 98,48 | 26 |
| `producto.service.ts` | 95,34 | 81,25 | 100 | 94,11 | 14, 22 |
| `reporte.service.ts` | 96,61 | 80 | 100 | 96,22 | 98, 115 |
| **utils (total)** | 97,4 | 87,65 | 97,61 | 98,4 | |
| `estadosPedido.ts` | 100 | 100 | 100 | 100 | — |
| `exportar.ts` | 94,28 | 80 | 92,85 | 93,1 | 22-23 |
| `formato.ts` | 100 | 91,66 | 100 | 100 | rama: 15 |
| `validaciones.ts` | 97,22 | 86,84 | 100 | 100 | ramas: 10, 25-30, 85 |
| `volver.ts` | 100 | 84,61 | 100 | 100 | ramas: 7, 10 |

## 6. Análisis de resultados

**Qué está bien cubierto**
- Reglas de negocio con más riesgo: stock del carrito, estados del pedido, devolución de stock al cancelar, acceso por rol y validación de datos. Todas con casos positivos y negativos.
- Los 25 HU probados tienen al menos un criterio de aceptación con test (ver `Trazabilidad_CA_Tests.md`).

**Qué no está cubierto, y por qué**
- **Bloques `catch` de `localStorage`** (almacenamiento lleno o bloqueado): son defensas poco probables; probarlas exige simular errores del navegador. Es la causa de casi todas las líneas sin cubrir.
- **Ramas débiles:** `inventario.service.ts` (66,7 %), `movimiento.service.ts` (75 %) y `categoria.service.ts` (77,3 %). Son valores por defecto (`?? 0`) y caminos alternativos que no cambian el resultado; las funciones y sentencias están cubiertas.
- **`exportar.ts`** quedó en 94 %: falta el `setTimeout` que limpia el enlace de descarga (líneas 22-23).
- **Interfaz (páginas y componentes):** solo `Login` y `ProductCard` tienen tests. Registro, Perfil, Checkout, Carrito y el panel de administración **no** tienen tests de interfaz, por lo que la cobertura global del proyecto es mucho menor que la de la capa de lógica. Las cifras de arriba **no** representan toda la aplicación.
- **HU-15 (cupones):** no existe lógica en el frontend (está en `ms-carrito`).
- **Ramas:** 83,6 % porque en varios `if` solo se prueba un lado cuando el otro no cambia el resultado (por ejemplo valores por defecto con `??`).

**Limitaciones honestas**
- La cobertura alta mide qué líneas se ejecutaron, no que las verificaciones sean buenas. Por eso se prefirió probar mensajes y estados exactos, no solo "no falla".
- Los servicios guardan en `localStorage` (no hay API aún), así que son pruebas de lógica, no de integración con el backend.
- Las HU asociadas a algunos tests son interpretativas (por ejemplo tarjeta → HU-19), porque el documento de HU no define esos detalles.

**Próximos pasos**
1. Tests de `Registro`, `Perfil` y `Checkout` (formularios con mocks de `useSesion`/`useCarrito`).
2. Cubrir los `catch` simulando `localStorage` lleno y las ramas que quedan en inventario, movimientos y categorías.
3. Pruebas de integración contra la API Spring Boot cuando el backend esté estable.
