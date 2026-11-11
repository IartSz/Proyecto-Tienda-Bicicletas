import { Route, Routes } from 'react-router';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import Home from './pages/Home';
import Categoria from './pages/Categoria';
import Ofertas from './pages/Ofertas';
import Productos from './pages/admin/Productos';
import Resumen from './pages/admin/Resumen';
import PedidosAdmin from './pages/admin/Pedidos';
import Inventario from './pages/admin/Inventario';
import Categorias from './pages/admin/Categorias';
import Clientes from './pages/admin/Clientes';
import Reportes from './pages/admin/Reportes';
import ProductForm from './components/admin/ProductForm';
import ProductoDetalle from './pages/ProductoDetalle';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Recuperar from './pages/Recuperar';
import Perfil from './pages/Perfil';
import MisPedidos from './pages/MisPedidos';
import Politica from './pages/Politica';
import NotFound from './pages/NotFound';
import RutaCliente from './components/RutaCliente';
import RutaAdmin from './components/RutaAdmin';
import RestaurarScroll from './components/RestaurarScroll';
import { CarritoProvider } from './context/CarritoContext';
import { SesionProvider } from './context/SesionContext';

const App = () => {
  return (
    <SesionProvider>
      <CarritoProvider>
        <RestaurarScroll />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<Recuperar />} />

          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/categoria/:slug" element={<Categoria />} />
            <Route path="/ofertas" element={<Ofertas />} />
            <Route path="/producto/:id" element={<ProductoDetalle />} />
            <Route path="/carrito" element={<Carrito />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/politicas/:tipo" element={<Politica />} />
            <Route element={<RutaCliente />}>
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/mis-pedidos" element={<MisPedidos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>

          <Route element={<RutaAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Resumen />} />
              <Route path="pedidos" element={<PedidosAdmin />} />
              <Route path="productos" element={<Productos />} />
              <Route path="productos/nuevo" element={<ProductForm mode="creacion" />} />
              <Route path="productos/:id/editar" element={<ProductForm mode="edicion" />} />
              <Route path="inventario" element={<Inventario />} />
              <Route path="categorias" element={<Categorias />} />
              <Route path="clientes" element={<Clientes />} />
              <Route path="reportes" element={<Reportes />} />
              <Route path="*" element={<NotFound ruta="/admin" texto="Volver al panel" />} />
            </Route>
          </Route>
        </Routes>
      </CarritoProvider>
    </SesionProvider>
  );
};

export default App;
