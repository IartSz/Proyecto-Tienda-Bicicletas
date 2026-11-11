# Rider Tapia Biker — Frontend

SPA de la tienda hecha con React + TypeScript + Vite (SWC), Bootstrap y React Router.
Se conecta al backend de microservicios a través del gateway (`http://localhost:9000`).

## Requisitos

- Node.js 20 o superior
- El backend levantado (ver `backend/BackEnd-RiderTapia/microservicios/README.md`)

## Ejecutar

```powershell
npm install
npm run dev
```

Se abre en `http://localhost:5173`. No hace falta crear `.env`: por defecto usa el backend.

## Configuración (opcional)

Copiar `.env.example` como `.env` para cambiar algo:

| Variable | Por defecto | Uso |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:9000` | Dirección del gateway |
| `VITE_USAR_API` | `true` | `false` para trabajar sin backend (datos locales en el navegador) |

Después de cambiar `.env`, reiniciar `npm run dev`.

## Datos

La base de datos se llena sola: al arrancar, `ms-productos` y `ms-inventario` cargan el catálogo
(23 categorías, 105 productos con sus tallas, ofertas e imágenes, y el stock) si sus tablas están vacías.
Si ya hay datos, no se toca nada.

Para volver al catálogo inicial: detener el backend, borrar las bases `ridertapia_productos`
y `ridertapia_inventario` en phpMyAdmin y volver a iniciarlo.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Revisa TypeScript y genera `dist/` |
| `npm run lint` | ESLint |
| `npx tsx scripts/cargar-catalogo.ts` | Carga el catálogo por la API (opcional, solo si la base está vacía) |

## Estructura de `src/`

- `api/`: cliente Axios, lectura de respuestas HATEOAS y conversión de datos del backend
- `services/`: un servicio por entidad (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`)
- `models/`: interfaces con los mismos nombres de campo que las entidades Java
- `hooks/`, `context/`, `components/`, `layouts/`, `pages/`, `utils/`, `styles/`
- `data/`: catálogo inicial (también se usa en modo sin backend)
