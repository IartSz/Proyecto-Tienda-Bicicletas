import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router';
import CartSummary from '../components/CartSummary';
import useCarrito from '../hooks/useCarrito';
import useSesion from '../hooks/useSesion';
import ProductoService from '../services/producto.service';
import AuthService from '../services/auth.service';
import PedidoService, { armarPedido } from '../services/pedido.service';
import { validarStockCarrito } from '../services/carrito.service';
import type { MedioPago, Pedido } from '../models/Pedido';
import { formatoCLP } from '../utils/formato';
import {
  errorCvv, errorEmail, errorNombre, errorRut, errorTarjeta, errorTelefono, errorVencimiento,
  formatearCvv, formatearRut, formatearTarjeta, formatearVencimiento, limpiarNombre
} from '../utils/validaciones';

interface CheckoutFormState {
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  medioPago: MedioPago;
  numTarjeta: string;
  vencimiento: string;
  cvv: string;
  terminos: boolean;
}

type Errores = Partial<Record<keyof CheckoutFormState, string>>;

const initialState: CheckoutFormState = {
  nombre: '',
  apellido: '',
  rut: '',
  email: '',
  telefono: '',
  medioPago: 'TARJETA',
  numTarjeta: '',
  vencimiento: '',
  cvv: '',
  terminos: false
};

const ETIQUETA_PAGO: Record<MedioPago, string> = {
  TARJETA: 'Tarjeta',
  TRANSFERENCIA: 'Transferencia (pendiente)',
  EFECTIVO: 'Efectivo al retirar (pendiente)'
};

const validar = (form: CheckoutFormState): Errores => {
  const errores: Errores = {
    nombre: errorNombre(form.nombre, 'nombre'),
    apellido: errorNombre(form.apellido, 'apellido'),
    rut: errorRut(form.rut),
    email: errorEmail(form.email),
    telefono: errorTelefono(form.telefono),
    terminos: form.terminos ? '' : 'Debes aceptar los términos.'
  };
  // Los datos de tarjeta solo se piden si paga con tarjeta
  if (form.medioPago === 'TARJETA') {
    errores.numTarjeta = errorTarjeta(form.numTarjeta);
    errores.vencimiento = errorVencimiento(form.vencimiento);
    errores.cvv = errorCvv(form.cvv);
  }
  // Solo deja los campos con error
  return Object.fromEntries(Object.entries(errores).filter(([, v]) => v)) as Errores;
};

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totales, vaciar } = useCarrito();
  const { sesion } = useSesion();
  // Con sesion de cliente, el pedido queda a nombre de su cuenta
  const cuenta = sesion?.rol === 'CLIENTE' ? sesion : null;
  const [form, setForm] = useState<CheckoutFormState>(() => ({
    ...initialState,
    nombre: cuenta?.nombre ?? '',
    apellido: cuenta?.apellido ?? '',
    rut: cuenta?.rutUsuario ?? '',
    email: cuenta?.emailCliente ?? '',
    telefono: cuenta?.telefono ?? ''
  }));
  const [intentado, setIntentado] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmado, setConfirmado] = useState<Pedido | null>(null);

  const errores = intentado ? validar(form) : {};

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.target;
    let valor: string | boolean = type === 'checkbox' ? checked : value;
    // Formato mientras se escribe
    if (name === 'nombre' || name === 'apellido') valor = limpiarNombre(value);
    if (name === 'rut') valor = formatearRut(value);
    if (name === 'numTarjeta') valor = formatearTarjeta(value);
    if (name === 'vencimiento') valor = formatearVencimiento(value);
    if (name === 'cvv') valor = formatearCvv(value);
    setForm((prev) => ({ ...prev, [name]: valor }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIntentado(true);
    setError(null);
    if (Object.keys(validar(form)).length > 0) return;

    setLoading(true);
    try {
      // Revisa el stock actual antes de confirmar
      const productos = await ProductoService.listar();
      const errorStock = validarStockCarrito(items, productos);
      if (errorStock) {
        window.alert(`${errorStock} Revisa tu carrito.`);
        navigate('/carrito');
        return;
      }

      // Un cliente desactivado desde el panel no puede comprar
      if (!(await AuthService.cuentaActiva(form.email))) {
        setError(`La cuenta asociada a ${form.email.trim()} está desactivada. Contáctanos para más información.`);
        return;
      }

      const cliente = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        rut: formatearRut(form.rut),
        email: form.email.trim(),
        telefono: form.telefono.trim()
      };
      // De la tarjeta solo se guardan los 4 ultimos digitos
      const pedido = await PedidoService.crear({
        ...armarPedido(items, cliente, form.medioPago, cuenta ? cliente.rut : null),
        ultimosDigitosTarjeta: form.medioPago === 'TARJETA' ? form.numTarjeta.replace(/\D/g, '').slice(-4) : undefined
      });
      vaciar();
      setConfirmado(pedido);
      window.scrollTo(0, 0);
    } catch (err) {
      console.error(err);
      setError('No fue posible registrar tu compra. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const clase = (campo: keyof CheckoutFormState, base = 'form-control'): string =>
    errores[campo] ? `${base} is-invalid` : base;

  // Sin productos no hay nada que comprar
  if (!confirmado && items.length === 0) return <Navigate to="/carrito" replace />;

  return (
    <>
      <section className="store-section py-4">
        <div className="container">
          <h2 className="mb-0"><i className="bi bi-bag-check me-2"></i>Finalizar compra</h2>
        </div>
      </section>

      <section className="py-5 bg-light">
        <div className="container">
          {confirmado ? (
            <div className="bg-white rounded shadow-sm p-4 p-md-5 mx-auto text-center" style={{ maxWidth: '640px' }}>
              <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '4rem' }}></i>
              <h3 className="fw-bold mt-3">¡Gracias por tu compra!</h3>
              <p className="text-muted mb-1">Tu número de pedido es</p>
              <p className="fs-4 fw-bold">{confirmado.numero}</p>
              <p className="mb-4">
                {confirmado.cliente?.nombre}, te enviaremos la confirmación a <strong>{confirmado.cliente?.email}</strong>.
                {confirmado.medioPago === 'TRANSFERENCIA' && (
                  <span className="small d-block mt-3">
                    Transfiere <strong>{formatoCLP(confirmado.total)}</strong> a: Rider Tapia SpA · Banco Ejemplo · Cta. Cte. 00-000-00000-0 · pagos@ridertapia.cl, indicando el pedido {confirmado.numero}.
                  </span>
                )}
                {confirmado.medioPago === 'EFECTIVO' && (
                  <span className="small d-block mt-3">Pagas <strong>{formatoCLP(confirmado.total)}</strong> en la tienda al retirar tu pedido.</span>
                )}
              </p>
              <div className="text-start border rounded p-3 mb-4">
                {(confirmado.items ?? []).map((i) => (
                  <div className="d-flex justify-content-between small mb-1" key={`${i.idProducto}-${i.variante ?? ''}`}>
                    <span>{i.cantidad} × {i.nombre}{i.variante && ` (${i.variante})`}</span>
                    <span>{formatoCLP(i.precioUnitario * i.cantidad)}</span>
                  </div>
                ))}
                <hr className="my-2" />
                <div className="d-flex justify-content-between fw-bold"><span>Total</span><span>{formatoCLP(confirmado.total)}</span></div>
                <hr className="my-2" />
                <div className="small"><strong>Entrega:</strong> Retiro en tienda (Centro, Concepción)</div>
                <div className="small"><strong>Pago:</strong> {confirmado.medioPago ? ETIQUETA_PAGO[confirmado.medioPago] : ''}</div>
                <div className="small"><strong>Cliente:</strong> {confirmado.rutCliente ? 'Cuenta registrada' : 'Invitado'}</div>
              </div>
              <div className="alert alert-secondary small text-start mb-4">
                <i className="bi bi-info-circle me-1"></i>Esta es una <strong>compra simulada</strong>: no se realizó ningún cobro ni se envió ningún correo.
              </div>
              <div className="d-flex justify-content-center gap-2 flex-wrap">
                <Link to="/" className="btn btn-brand">VOLVER A LA TIENDA</Link>
                {confirmado.rutCliente && <Link to="/mis-pedidos" className="btn btn-dark">VER MIS PEDIDOS</Link>}
              </div>
            </div>
          ) : (
            <form className="row g-4" noValidate onSubmit={(event) => void handleSubmit(event)} aria-label="Finalizar compra">
              <div className="col-lg-7">
                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <h5 className="fw-bold mb-3"><span className="badge bg-dark me-2">1</span>¿Cómo quieres comprar?</h5>
                  {cuenta ? (
                    <div className="border border-dark rounded p-3">
                      <div className="fw-semibold"><i className="bi bi-person-check me-1"></i>Comprando como {cuenta.nombre} {cuenta.apellido}</div>
                      <p className="small text-muted mb-0 mt-1">Completamos tus datos con tu cuenta. El pedido quedará en <Link to="/mis-pedidos">Mis pedidos</Link>.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100 border-dark">
                          <div className="fw-semibold"><i className="bi bi-person-walking me-1"></i>Como invitado</div>
                          <p className="small text-muted mb-0 mt-1">Compra rápido sin crear cuenta. Solo necesitamos tus datos de contacto.</p>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border rounded p-3 h-100">
                          <div className="fw-semibold"><i className="bi bi-person-circle me-1"></i>¿Ya tienes cuenta?</div>
                          <p className="small text-muted mb-2 mt-1">Inicia sesión para completar tus datos más rápido (opcional).</p>
                          <Link to="/login?volver=checkout" className="btn btn-dark btn-sm">INICIAR SESIÓN</Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <h5 className="fw-bold mb-3"><span className="badge bg-dark me-2">2</span>Datos de contacto</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="nombre">Nombre</label>
                      <input className={clase('nombre')} id="nombre" name="nombre" maxLength={40} value={form.nombre} onChange={handleChange} />
                      <div className="invalid-feedback">{errores.nombre}</div>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label" htmlFor="apellido">Apellido</label>
                      <input className={clase('apellido')} id="apellido" name="apellido" maxLength={40} value={form.apellido} onChange={handleChange} />
                      <div className="invalid-feedback">{errores.apellido}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="rut">RUT</label>
                      <input className={clase('rut')} id="rut" name="rut" maxLength={12} autoComplete="off" placeholder="12.345.678-5" value={form.rut} onChange={handleChange} readOnly={cuenta !== null} />
                      <div className="invalid-feedback">{errores.rut}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="email">Correo electrónico</label>
                      <input type="email" className={clase('email')} id="email" name="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={handleChange} readOnly={cuenta !== null} />
                      <div className="invalid-feedback">{errores.email}</div>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label" htmlFor="telefono">Teléfono</label>
                      <input type="tel" className={clase('telefono')} id="telefono" name="telefono" placeholder="+56 9 1234 5678" value={form.telefono} onChange={handleChange} />
                      <div className="invalid-feedback">{errores.telefono}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <h5 className="fw-bold mb-3"><span className="badge bg-dark me-2">3</span>Entrega</h5>
                  <div className="border rounded p-3">
                    <i className="bi bi-shop me-2"></i><strong>Retiro en tienda</strong><span className="float-end small text-success">Gratis</span>
                    <div className="small text-muted">Centro, Concepción · Lunes a domingo, 10:30 a 19:30 hrs</div>
                  </div>
                  <p className="small text-muted mt-2 mb-0">Por ahora no hacemos despacho a domicilio. Te avisamos por correo cuando tu pedido esté listo para retirar.</p>
                </div>

                <div className="bg-white rounded shadow-sm p-4 mb-4">
                  <h5 className="fw-bold mb-3"><span className="badge bg-dark me-2">4</span>Pago</h5>
                  <div className="alert alert-warning small py-2">
                    <i className="bi bi-exclamation-triangle me-1"></i>Pago <strong>simulado</strong>: no ingreses datos reales de tarjeta. Usa por ejemplo 4111 1111 1111 1111.
                  </div>
                  <div className="d-flex gap-3 mb-3 flex-wrap">
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="medioPago" id="pagoTarjeta" value="TARJETA" checked={form.medioPago === 'TARJETA'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="pagoTarjeta"><i className="bi bi-credit-card me-1"></i>Tarjeta de débito / crédito</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="medioPago" id="pagoTransferencia" value="TRANSFERENCIA" checked={form.medioPago === 'TRANSFERENCIA'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="pagoTransferencia"><i className="bi bi-bank me-1"></i>Transferencia</label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="radio" name="medioPago" id="pagoEfectivo" value="EFECTIVO" checked={form.medioPago === 'EFECTIVO'} onChange={handleChange} />
                      <label className="form-check-label" htmlFor="pagoEfectivo"><i className="bi bi-cash-coin me-1"></i>Efectivo al retirar</label>
                    </div>
                  </div>

                  {form.medioPago === 'TARJETA' && (
                    <div className="row g-3">
                      <div className="col-12">
                        <label className="form-label" htmlFor="numTarjeta">Número de tarjeta</label>
                        <input className={clase('numTarjeta')} id="numTarjeta" name="numTarjeta" inputMode="numeric" placeholder="0000 0000 0000 0000" maxLength={19} autoComplete="off" value={form.numTarjeta} onChange={handleChange} />
                        <div className="invalid-feedback">{errores.numTarjeta}</div>
                      </div>
                      <div className="col-6">
                        <label className="form-label" htmlFor="vencimiento">Vencimiento</label>
                        <input className={clase('vencimiento')} id="vencimiento" name="vencimiento" placeholder="MM/AA" maxLength={5} autoComplete="off" value={form.vencimiento} onChange={handleChange} />
                        <div className="invalid-feedback">{errores.vencimiento}</div>
                      </div>
                      <div className="col-6">
                        <label className="form-label" htmlFor="cvv">CVV</label>
                        <input className={clase('cvv')} id="cvv" name="cvv" inputMode="numeric" placeholder="123" maxLength={3} autoComplete="off" value={form.cvv} onChange={handleChange} />
                        <div className="invalid-feedback">{errores.cvv}</div>
                      </div>
                    </div>
                  )}
                  {form.medioPago === 'TRANSFERENCIA' && (
                    <div className="small bg-light rounded p-3">
                      Al confirmar te mostraremos los datos para transferir. El pedido se prepara cuando recibamos el pago.
                    </div>
                  )}
                  {form.medioPago === 'EFECTIVO' && (
                    <div className="small bg-light rounded p-3">Pagas en la tienda al momento de retirar tu pedido.</div>
                  )}
                </div>
              </div>

              <div className="col-lg-5">
                <CartSummary
                  titulo="Tu pedido"
                  totales={totales}
                  detalle={
                    <div className="mb-3">
                      {items.map((i) => (
                        <div className="d-flex justify-content-between small mb-2" key={`${i.idProducto}-${i.variante ?? ''}`}>
                          <span>{i.cantidad} × {i.nombre}{i.variante && <span className="text-muted"> ({i.variante})</span>}</span>
                          <span className="ms-2 text-nowrap">{formatoCLP(i.precioUnitario * i.cantidad)}</span>
                        </div>
                      ))}
                    </div>
                  }
                >
                  <div className="form-check mb-3 small">
                    <input className={clase('terminos', 'form-check-input')} type="checkbox" id="terminos" name="terminos" checked={form.terminos} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="terminos">
                      Acepto los <Link to="/politicas/terminos" target="_blank">términos del servicio</Link>
                    </label>
                    <div className="invalid-feedback">{errores.terminos}</div>
                  </div>
                  {error && <div className="alert alert-danger small py-2">{error}</div>}
                  <button type="submit" className="btn btn-brand w-100" disabled={loading}>
                    <i className="bi bi-lock me-2"></i>{loading ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
                  </button>
                  <Link to="/carrito" className="d-block text-center small mt-3"><i className="bi bi-arrow-left me-1"></i>Volver al carrito</Link>
                </CartSummary>
              </div>
            </form>
          )}
        </div>
      </section>
    </>
  );
};

export default Checkout;
