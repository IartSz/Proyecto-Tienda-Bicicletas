# Proyecto Tienda de Bicicletas #

# Integrantes:
# Juan Pablo Jofre
# Matias Durán Dominguez

## Cómo ejecutar

Requisitos: JDK 25 y JDK 21, Node.js 20 o superior y MySQL en el puerto 3306 (por ejemplo, XAMPP).

1. Encender MySQL.
2. Backend (crea las bases y carga el catálogo la primera vez):
   ```powershell
   cd backend\BackEnd-RiderTapia\microservicios
   .\iniciar-todo.ps1
   ```
3. Frontend, en otra terminal:
   ```powershell
   cd frontend-ridertapia
   npm install
   npm run dev
   ```
4. Abrir `http://localhost:5173`.
