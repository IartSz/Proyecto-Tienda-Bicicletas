# Trazabilidad: criterio de aceptación → test (Sprints 9 y 10)

Herramientas: Vitest + React Testing Library (entorno jsdom).
Ejecutar: `npm test` (una vez) o `npm run test:watch` (modo vigilancia), dentro de `frontend-ridertapia`.
Cada test se llama `HU-n CAm: ...` según `Historias_de_Usuario_Gherkin.md`.

## carrito.service (`src/services/carrito.service.test.ts`)

| HU | CA | Criterio (resumen) | Test(s) | Tipo |
|---|---|---|---|---|
| HU-12 | CA1 | Producto con stock aparece en el carrito con la cantidad y el total se actualiza | `HU-12 CA1: un producto con stock aparece en el carrito…`, `…el total del carrito se actualiza al agregar`, `…misma variante suma la cantidad`, `…variante distinta crea una línea nueva`, `…no modifica el carrito original` | Positivo |
| HU-12 | CA2 | Producto sin stock: informa y no lo agrega | `HU-12 CA2: un producto sin stock no se puede agregar…`, `…no publicado se trata como no disponible` | Negativo |
| HU-13 | CA1 | Al cambiar la cantidad, subtotal y total se recalculan | `HU-13 CA1: al cambiar la cantidad…`, `…nunca baja de 1`, `…nunca pasa de 10` | Positivo / límites |
| HU-13 | CA2 | Cantidad mayor al stock: no se permite e indica el máximo | `HU-13 CA2: una cantidad mayor al stock…`, `…descuenta lo que ya hay en el carrito`, `…ya tiene todo el stock`, `…no deja superar 10 unidades`, `…máximo de una línea`, `…revisión detecta stock insuficiente`, `…producto no publicado`, `…stock suficiente pasa la revisión` | Negativo (+1 positivo) |
| HU-13 | CA3 | Eliminar: desaparece y el total se recalcula | `HU-13 CA3: eliminar un producto lo quita…` | Positivo |
| HU-14 | CA1 | Detalle con total general (y cantidades) | `HU-14 CA1: el total general suma…`, `…cuenta las unidades de todas las líneas` | Positivo |
| HU-14 | CA2 | Carrito vacío | `HU-14 CA2: un carrito vacío tiene total 0…`, `…vaciar deja el carrito sin productos` | Borde |

## validaciones (`src/utils/validaciones.test.ts`)

| HU | CA | Criterio (resumen) | Test(s) | Tipo |
|---|---|---|---|---|
| HU-1 | CA1 | Registro con datos válidos | `HU-1 CA1: nombre, apellido, RUT y correo válidos…`, nombre con números/una letra, `limpiarNombre`, cálculo de DV, formatos de RUT, regla de la K | Positivo / negativo |
| HU-1 | CA3 | Campo obligatorio vacío: informa el faltante | `HU-1 CA3: un nombre vacío…`, `…RUT vacío…`, `…correo vacío…`, `…RUT con dígito verificador incorrecto`, `…RUT con formato inválido` | Negativo |
| HU-2 | CA1 | Visitante con correo o teléfono válido continúa | `HU-2 CA1: un correo válido…`, `…un teléfono chileno válido…` | Positivo |
| HU-2 | CA2 | Sin medio de contacto no avanza | `HU-2 CA2: sin correo ni teléfono…` | Negativo |
| HU-3 | CA1 | Datos válidos se aceptan | `HU-3 CA1: un correo y teléfono válidos…` | Positivo |
| HU-3 | CA2 | Correo o teléfono con formato inválido: error | `HU-3 CA2: un correo sin arroba…`, `…teléfono con formato inválido` | Negativo |
| HU-19 | CA1 / CA2 | Datos de tarjeta del pago simulado: válidos se aceptan, inválidos se rechazan | `HU-19 CA1: datos de tarjeta válidos…`, `HU-19 CA2: una tarjeta incompleta…`, `HU-19 CA1: da formato…` | Positivo / negativo |

## ProductCard (`src/components/ProductCard.test.tsx`)

| HU | CA | Criterio (resumen) | Test(s) | Tipo |
|---|---|---|---|---|
| HU-28 | CA1 | Nombre, precio en CLP, imagen y enlace a la ficha | `HU-28 CA1: muestra nombre, marca y precio…`, `…enlaza a la ficha…`, `…muestra la imagen…`, `…si la imagen falla…` | Positivo / borde |
| HU-28 | CA2 | Oferta: precio rebajado y original tachado | `HU-28 CA2: un producto en oferta…`, `…sin oferta no muestra precio tachado` | Positivo / negativo |
| HU-29 | CA1 | Insignia OFERTA en productos con oferta | `HU-29 CA1: …muestra la insignia OFERTA`, `…sin oferta no muestra la insignia` | Positivo / negativo |
| HU-12 | CA1 | Agregar entrega el producto al carrito | `HU-12 CA1: al presionar Agregar…`, `…sin onAgregar no se muestra el botón` | Positivo |
| HU-12 | CA2 | Sin stock: AGOTADO y botón deshabilitado | `HU-12 CA2: un producto sin stock muestra AGOTADO…` | Negativo |


## Sprint 10: servicios de sesión, pedidos, inventario, categorías y clientes

| HU | CA | Criterio (resumen) | Test (archivo) | Tipo |
|---|---|---|---|---|
| HU-1 | CA1 | Cuenta creada, sesión iniciada, contraseña con hash | `HU-1 CA1: crea la cuenta…`, `…la contraseña se guarda con hash…` (`auth.service.test.ts`) | Positivo |
| HU-1 | CA2 | Correo (o RUT) ya registrado | `HU-1 CA2: un correo ya registrado…`, `…un RUT ya registrado…` (`auth.service.test.ts`) | Negativo |
| HU-3 | CA1 | Perfil actualizado y reflejado; pedidos de la cuenta al día | `HU-3 CA1: guarda los cambios…`, `…los pedidos de la cuenta se actualizan…` (mock `PedidoService`); contraseña nueva (`auth.service.test.ts`) | Positivo |
| HU-3 | CA2 | RUT de otra cuenta / cuenta inexistente | `HU-3 CA2: no deja usar un RUT…`, `…una cuenta que no existe…` | Negativo |
| HU-5 | CA1 | Desactivar y activar con registro de acciones | `HU-5 CA1: desactivar marca…`, `…activar de nuevo…`, `…hasta 100 entradas` (`cliente.service.test.ts`) | Positivo |
| HU-5 | CA2 | Cuenta desactivada no inicia sesión | `HU-5 CA2: una cuenta desactivada no puede iniciar sesión` (`auth.service.test.ts`) | Negativo |
| HU-8 | CA1 | Credenciales correctas inician sesión (servicio y pantalla) | `HU-8 CA1: con credenciales correctas…` (`auth.service.test.ts`, `Login.test.tsx`; mocks `useSesion`, `useNavigate`) | Positivo |
| HU-8 | CA2 | Contraseña incorrecta, correo sin cuenta, datos inválidos | `HU-8 CA2: …` (`auth.service.test.ts`, `Login.test.tsx`) | Negativo |
| HU-9 | CA1 / CA2 | Un solo login que detecta el rol (admin → panel, cliente → inicio); contraseña de admin incorrecta | `HU-9 CA1: …`, `HU-9 CA2: …` (`auth.service.test.ts`, `Login.test.tsx`) | Positivo / negativo |
| HU-17 | CA1 | Crear pedido descuenta stock | `HU-17 CA1: …descuenta del stock…` (`pedido.service.test.ts`; mock `InventarioService`) | Positivo |
| HU-18 / HU-19 | CA1 / CA2 | Totales, número de pedido, estado inicial según medio de pago | `HU-18 CA1…`, `HU-19 CA1…`, `HU-19 CA2…` (`pedido.service.test.ts`, `estadosPedido.test.ts`) | Positivo |
| HU-21 | CA1 / CA3 | Historial del cliente y lista vacía | `HU-21 CA1…`, `HU-21 CA3…` (`pedido.service.test.ts`) | Positivo / borde |
| HU-22 | CA1 | Cancelar devuelve stock; anular exige motivo; demo no devuelve | `HU-22 CA1: …` (`pedido.service.test.ts`) | Positivo |
| HU-22 | CA2 | Estado final no se puede cancelar | `HU-22 CA2: un pedido ya retirado…` | Negativo |
| HU-23 | CA1 / CA2 | Cambio de estado y trazabilidad | `HU-23 CA1…`, `HU-23 CA2…` (`pedido.service.test.ts`) | Positivo |
| HU-30 / HU-36 | CA1 / CA2 | Ajustes y movimientos de stock; nunca bajo cero | `HU-30 CA1…`, `HU-36 CA1…`, `HU-36 CA2…` (`inventario.service.test.ts`, `movimiento.service.test.ts`; mock `MovimientoService`) | Positivo / límite |
| HU-31 | CA1 / CA2 | Crear/renombrar categoría; eliminar con reasignación | `HU-31 CA1…`, `HU-31 CA2…` (`categoria.service.test.ts`) | Positivo / negativo |
| HU-34 / HU-35 | CA1 | Agregar y eliminar productos | `HU-34 CA1…`, `HU-35 CA1…` (`producto.service.test.ts`) | Positivo |
| HU-37 | CA1 / CA2 | Alerta de stock bajo y sin alerta sobre el mínimo | `HU-37 CA1…`, `HU-37 CA2…` (`producto.service.test.ts`, `reporte.service.test.ts`) | Positivo / negativo |

Tests de `reporte.service.test.ts` (ventas por período, más vendidos, historial de reportes) llevan el prefijo `Reportes:` porque el documento de HU no tiene una historia propia para ellos.

## Fuera de alcance (no hay código de frontend que probar todavía)
- **HU-15 (cupones):** el frontend no tiene lógica de cupones; está en `ms-carrito` (backend).
- **HU-4 (recuperar contraseña), HU-20 (boleta) y el resto de las HU del taller (HU-39 a HU-46):** no tienen lógica de frontend probada todavía.
- **Nota:** los tests de tarjeta se asocian a HU-19 por cercanía (el pago es simulado); la HU no define estos formatos explícitamente.
