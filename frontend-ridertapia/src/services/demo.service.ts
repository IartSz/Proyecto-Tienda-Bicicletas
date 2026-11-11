import type { DatosComprador, EstadoPedido, MedioPago, PedidoPayload } from '../models/Pedido';
import type { ItemCarrito } from '../models/ItemCarrito';
import type { Producto } from '../models/Producto';
import { estadoInicial } from './pedido.service';

// Ventas de ejemplo para que Resumen y Reportes tengan datos
interface ClienteDemo {
  comprador: DatosComprador;
  registrado: boolean;
}

const CLIENTES: ClienteDemo[] = [
  { comprador: { nombre: 'Camila', apellido: 'Rojas', email: 'camila.rojas@correo.cl', telefono: '+56 9 8123 4567', rut: '18.234.567-9' }, registrado: true },
  { comprador: { nombre: 'Matías', apellido: 'González', email: 'mgonzalez@correo.cl', telefono: '+56 9 7654 3210', rut: '17.845.210-K' }, registrado: true },
  { comprador: { nombre: 'Valentina', apellido: 'Muñoz', email: 'vale.munoz@correo.cl', telefono: '+56 9 9988 7766', rut: '19.102.334-K' }, registrado: false },
  { comprador: { nombre: 'Sebastián', apellido: 'Díaz', email: 'sdiaz@correo.cl', telefono: '+56 9 6543 2109', rut: '16.543.876-0' }, registrado: true },
  { comprador: { nombre: 'Francisca', apellido: 'Soto', email: 'fran.soto@correo.cl', telefono: '+56 9 5432 1098', rut: '20.011.456-6' }, registrado: false },
  { comprador: { nombre: 'Diego', apellido: 'Pérez', email: 'dperez@correo.cl', telefono: '+56 9 4321 0987', rut: '15.987.321-8' }, registrado: false },
  { comprador: { nombre: 'Javiera', apellido: 'Contreras', email: 'jcontreras@correo.cl', telefono: '+56 9 3210 9876', rut: '21.456.789-K' }, registrado: true },
  { comprador: { nombre: 'Tomás', apellido: 'Silva', email: 'tsilva@correo.cl', telefono: '+56 9 2109 8765', rut: '14.765.432-4' }, registrado: false }
];

const DIA = 86400000;

// Genera 70 pedidos de los ultimos 6 meses (siempre los mismos, con semilla fija)
export const generarVentasEjemplo = (productos: Producto[]): PedidoPayload[] => {
  const activos = productos.filter((p) => p.estado !== 'OCULTO');
  if (activos.length === 0) return [];
  const hoy = new Date();
  let semilla = 7;
  const azar = (n: number): number => {
    semilla = (semilla * 9301 + 49297) % 233280;
    return Math.floor((semilla / 233280) * n);
  };

  const pedidos: PedidoPayload[] = [];
  for (let i = 0; i < 70; i++) {
    const fecha = new Date(hoy);
    fecha.setDate(fecha.getDate() - azar(180));
    fecha.setHours(10 + azar(9), azar(60));
    const { comprador, registrado } = CLIENTES[azar(CLIENTES.length)];

    const items: ItemCarrito[] = [];
    const cantidadLineas = 1 + azar(3);
    for (let j = 0; j < cantidadLineas; j++) {
      const p = activos[azar(activos.length)];
      if (items.some((x) => x.idProducto === p.idProducto)) continue;
      items.push({
        idProducto: p.idProducto,
        cantidad: 1 + azar(2),
        precioUnitario: p.precioOferta ?? p.precioNormal,
        nombre: p.nombre,
        variante: p.variantes?.valores[0]?.valor,
        imagen: p.imagenPrincipal
      });
    }
    const subtotal = items.reduce((suma, x) => suma + x.precioUnitario * x.cantidad, 0);
    const dias = (hoy.getTime() - fecha.getTime()) / DIA;
    const medioPago: MedioPago = azar(4) === 0 ? 'TRANSFERENCIA' : 'TARJETA';
    const inicial = estadoInicial(medioPago);
    let estado: EstadoPedido = inicial;
    if (dias > 7) estado = azar(15) === 0 ? 'CANCELADO' : 'RETIRADO';
    else if (dias > 3) estado = 'LISTO_PARA_RETIRO';
    else if (dias > 1) estado = 'EN_PREPARACION';

    const ahora = fecha.toISOString();
    pedidos.push({
      numero: `RT-D${1000 + i}`,
      fechaCreacion: ahora,
      fechaExpiracion: null,
      estado,
      canal: 'WEB',
      subtotal,
      descuento: 0,
      total: subtotal,
      motivoAnulacion: null,
      rutCliente: registrado ? comprador.rut : null,
      idCupon: null,
      idEmpleado: null,
      datosVisitante: registrado ? null : { nombre: `${comprador.nombre} ${comprador.apellido}`, correo: comprador.email, telefono: comprador.telefono },
      envio: 0,
      cliente: comprador,
      medioPago,
      items,
      historial: [
        { estado: inicial, fecha: ahora, nota: 'Pedido recibido.' },
        ...(estado !== inicial ? [{ estado, fecha: new Date(Math.min(hoy.getTime(), fecha.getTime() + DIA * 2)).toISOString(), nota: '' }] : [])
      ],
      novedad: false,
      demo: true
    });
  }
  return pedidos;
};
