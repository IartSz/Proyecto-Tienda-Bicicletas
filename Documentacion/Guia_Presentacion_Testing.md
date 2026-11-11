# Guía para presentar el testing (Sprint 10)

## 1. La idea en una frase
Cada criterio de aceptación de una historia de usuario (HU) se convierte en un test automático. Si alguien rompe una regla (por ejemplo "no vender sin stock"), el test falla y dice qué HU se rompió.

## 2. Qué hace cada herramienta

| Herramienta | Para qué sirve | Ejemplo en el proyecto |
|---|---|---|
| **Vitest** | Ejecuta los tests y compara resultados (`expect`). Es rápido y se lleva bien con Vite. | `expect(calcularTotales(carrito).total).toBe(20000)` |
| **React Testing Library** | Prueba componentes como los usa una persona: busca por texto, etiqueta o rol, y hace clic. | `screen.getByRole('button', { name: /Agregar/ })` |
| **jsdom** | Un "navegador falso" dentro de Node para que los componentes y `localStorage` funcionen sin abrir Chrome. | Los servicios guardan en `localStorage` y en los tests se limpia antes de cada uno. |
| **Mocks** | Reemplazan una dependencia por una versión falsa y controlable. | Probar "cancelar devuelve stock" sin tocar el inventario real. |
| **Cobertura (V8)** | Mide qué líneas del código se ejecutaron durante los tests. | `npm run coverage` genera una tabla y un informe HTML. |

## 3. Cómo se lee un test (patrón Arrange – Act – Assert)

```ts
it('HU-12 CA2: un producto sin stock no se puede agregar y el sistema informa', () => {
  const producto = crearProducto({ stockDisponible: 0 });          // 1. Preparar
  const error = validarStock([], producto, 1);                     // 2. Ejecutar
  expect(error).toBe('Este producto no tiene stock disponible.');  // 3. Verificar
});
```
El nombre dice la HU y el criterio, así se arma la tabla "CA y test" sin esfuerzo.

## 4. Qué es un mock (con un ejemplo real)

En `pedido.service.test.ts`:

```ts
vi.mock('./inventario.service', () => ({ default: { mover: vi.fn() } }));
...
await PedidoService.cambiarEstado(pedido.idPedido, 'CANCELADO', 'El cliente lo pidió');
expect(mover).toHaveBeenCalledWith(1, 'AJUSTE', 2, 'admin', `Cancelación pedido ${pedido.numero}`);
```
- `vi.mock` cambia el inventario real por una función falsa (`vi.fn()`).
- La función falsa **anota con qué argumentos la llamaron**.
- Entonces el test comprueba: "al cancelar, el pedido pidió devolver 2 unidades del producto 1".
- Ventaja: el test prueba solo la lógica de pedidos, es rápido y no depende de otros módulos.

Otros mocks: `useSesion` y `useNavigate` en `Login.test.tsx` (la pantalla "recibe" que el login falló o funcionó y se verifica a dónde navega), y `onAgregar = vi.fn()` en `ProductCard`.

## 5. Qué es la cobertura y cómo interpretarla
- **Líneas %:** qué porcentaje de líneas se ejecutó. **Ramas %:** qué porcentaje de los caminos de los `if`/`??` se probó. **Funciones %:** cuántas funciones se llamaron.
- Cobertura **no** es calidad: 100 % sin buenas verificaciones no sirve. Se usa para encontrar lo que **nadie probó**.
- En el informe HTML (`coverage/index.html`) las líneas rojas son las no ejecutadas.
- Alcance medido: `services` y `utils` (reglas de negocio). La interfaz casi no tiene tests: hay que decirlo con claridad.

## 6. Guion de la demostración (≈ 5 min)

1. **Ejecutar la suite:** `npm test`. Mostrar que termina en verde: 189 tests.
2. **Explicar un test:** abrir `carrito.service.test.ts`, test "HU-12 CA2". Leer Dado/Cuando/Entonces del documento de HU y mostrar que el test es lo mismo en código.
3. **Mostrar un mock:** `pedido.service.test.ts`, test "HU-22 CA1: cancelar devuelve las unidades al stock".
4. **Prueba de componente:** `ProductCard.test.tsx` ("AGOTADO" deshabilita el botón) o `Login.test.tsx`.
5. **Fallo controlado:** en `src/data/productos.ts` cambiar `LIMITE_POR_COMPRA` de 10 a 8 y correr `npm test`. Fallan los tests del límite de 10 y el mensaje dice la HU y el CA. Volver a 10.
6. **Cobertura:** `npm run coverage` y abrir `coverage/index.html`. Mostrar la tabla (96,7 % de líneas, 84,2 % de ramas) y explicar qué falta (los `catch` de `localStorage`, algunas ramas y la interfaz, que casi no tiene tests).
7. **Cerrar con la tabla CA y test** (`Trazabilidad_CA_Tests.md`) y los próximos pasos (sección 6 de `Cobertura_Testing.md`).

## 7. Preguntas probables y respuestas

- **¿Por qué mockear?** Para aislar lo que se prueba, controlar escenarios difíciles (por ejemplo "el servidor falla") y verificar interacciones sin depender de otras partes.
- **¿Diferencia entre test unitario y de integración?** Unitario prueba una pieza aislada (`validarStock`); integración prueba varias juntas (por ejemplo `armarPedido` + `calcularTotales`). Aquí la mayoría son unitarios, con algunos de integración liviana.
- **¿Qué es un criterio de aceptación?** La condición que debe cumplirse para dar la HU por terminada; aquí está escrita en Gherkin (Dado/Cuando/Entonces).
- **¿Por qué no hay 100 % de cobertura?** Quedan los `catch` de almacenamiento y pantallas sin tests. Se justifica en `Cobertura_Testing.md`; priorizamos reglas de negocio.
- **¿Por qué `localStorage` y no una base de datos?** El frontend aún no usa la API; los servicios están preparados para cambiarse por la API de Spring Boot cuando esté estable.
- **¿Cómo sé que un test es bueno?** Si lo rompo a propósito (fallo controlado), falla. Y verifica un resultado concreto, no solo que "no explote".
- **¿Qué es `beforeEach`?** Código que corre antes de cada test (aquí limpia `localStorage`) para que los tests no se afecten entre sí.

## 8. Instalación en un computador nuevo

```
cd frontend-ridertapia
npm install
npm install -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```
`@vitest/coverage-v8` debe quedar en la **misma versión** que `vitest`.
