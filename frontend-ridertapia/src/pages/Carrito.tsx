import { useState } from 'react';
import { Link } from 'react-router';
import CartItemRow from '../components/CartItemRow';
import CartSummary from '../components/CartSummary';
import useCarrito from '../hooks/useCarrito';
import useProductos from '../hooks/useProductos';

interface AvisoLinea {
  indice: number;
  texto: string;
}

const Carrito = () => {
  const { items, totales, cantidadTotal, cambiarCantidad, eliminar, vaciar } = useCarrito();
  const { productos } = useProductos();
  const [aviso, setAviso] = useState<AvisoLinea | null>(null);

  const handleCantidad = (indice: number, cantidad: number) => {
    const error = cambiarCantidad(indice, cantidad);
    setAviso(error ? { indice, texto: error } : null);
  };

  const handleEliminar = (indice: number) => {
    eliminar(indice);
    setAviso(null);
  };

  const handleVaciar = () => {
    if (window.confirm('¿Vaciar todo el carrito?')) {
      vaciar();
      setAviso(null);
    }
  };

  return (
    <>
      <section className="store-section py-4">
        <div className="container">
          <h2 className="mb-0"><i className="bi bi-cart3 me-2"></i>Tu carrito</h2>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          {items.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-cart-x" style={{ fontSize: '3.5rem', color: '#999' }}></i>
              <h4 className="mt-3">Tu carrito está vacío</h4>
              <p className="text-muted">Agrega productos para comenzar tu compra.</p>
              <Link to="/" className="btn btn-brand mt-2">Ir a la tienda</Link>
            </div>
          ) : (
            <div className="row g-4">
              <div className="col-lg-8">
                <div className="bg-white rounded shadow-sm p-3 p-md-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">{cantidadTotal} {cantidadTotal === 1 ? 'producto' : 'productos'}</h5>
                    <button className="btn btn-link btn-sm text-danger" type="button" onClick={handleVaciar}>
                      <i className="bi bi-trash me-1"></i>Vaciar carrito
                    </button>
                  </div>
                  {items.map((item, indice) => (
                    <CartItemRow
                      key={`${item.idProducto}-${item.variante ?? ''}`}
                      item={item}
                      nombreVariante={productos.find((p) => p.idProducto === item.idProducto)?.variantes?.nombre}
                      mensaje={aviso?.indice === indice ? aviso.texto : null}
                      onCambiarCantidad={(cantidad) => handleCantidad(indice, cantidad)}
                      onEliminar={() => handleEliminar(indice)}
                    />
                  ))}
                </div>
                <Link to="/" className="d-inline-block mt-3"><i className="bi bi-arrow-left me-1"></i>Seguir comprando</Link>
              </div>

              <div className="col-lg-4">
                <CartSummary totales={totales}>
                  <Link to="/checkout" className="btn btn-brand w-100">CONTINUAR COMPRA</Link>
                  <p className="text-center text-muted small mt-3 mb-0">
                    <i className="bi bi-person-check me-1"></i>Puedes comprar como invitado, sin crear cuenta.
                  </p>
                </CartSummary>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Carrito;
