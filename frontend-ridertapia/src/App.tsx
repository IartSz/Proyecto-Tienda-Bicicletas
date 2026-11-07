import { Route, Routes } from 'react-router';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Categoria from './pages/Categoria';
import Ofertas from './pages/Ofertas';
import Productos from './pages/admin/Productos';
import ProductForm from './components/admin/ProductForm';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import { CarritoProvider } from './context/CarritoContext';

// Secciones del panel que aun no estan migradas
const pendiente = (
  <div className="panel">
    <p className="panel-note mb-0">Esta sección aún no está disponible.</p>
  </div>
);

const App = () => {
  return (
    <CarritoProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:slug" element={<Categoria />} />
          <Route path="/ofertas" element={<Ofertas />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/checkout" element={<Checkout />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={pendiente} />
          <Route path="productos" element={<Productos />} />
          <Route path="productos/nuevo" element={<ProductForm mode="creacion" />} />
          <Route path="productos/:id/editar" element={<ProductForm mode="edicion" />} />
          <Route path="*" element={pendiente} />
        </Route>
      </Routes>
    </CarritoProvider>
  );
};

export default App;
