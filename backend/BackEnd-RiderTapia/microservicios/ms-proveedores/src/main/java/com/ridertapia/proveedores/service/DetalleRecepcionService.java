package com.ridertapia.proveedores.service;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.model.DetalleRecepcion;
import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.repository.DetalleOrdenCompraRepository;
import com.ridertapia.proveedores.repository.DetalleRecepcionRepository;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.RecepcionCompraRepository;

@Service
public class DetalleRecepcionService {

    @Autowired
    private DetalleRecepcionRepository detalleRecepcionRepository;

    @Autowired
    private RecepcionCompraRepository recepcionCompraRepository;

    @Autowired
    private DetalleOrdenCompraRepository detalleOrdenCompraRepository;

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.inventario.items-url}")
    private String itemsInventarioUrl;

    @Value("${ms.inventario.ingresos-url}")
    private String ingresosUrl;

    // Registra lo que llegó: suma el stock en ms-inventario y actualiza la orden de compra
    public DetalleRecepcion guardarDetalleRecepcion(DetalleRecepcion detalleRecepcion) {
        detalleRecepcion.setRecepcionCompra(resolverRecepcionCompra(detalleRecepcion.getRecepcionCompra()));
        detalleRecepcion.setDetalleOrdenCompra(resolverDetalleOrdenCompra(detalleRecepcion.getDetalleOrdenCompra()));
        RecepcionCompra recepcionCompra = detalleRecepcion.getRecepcionCompra();
        DetalleOrdenCompra detalleOrdenCompra = detalleRecepcion.getDetalleOrdenCompra();
        OrdenCompra ordenCompra = detalleOrdenCompra.getOrdenCompra();
        if (!ordenCompra.getIdOrdenCompra().equals(recepcionCompra.getOrdenCompra().getIdOrdenCompra())) {
            throw new IllegalStateException("El producto no pertenece a la orden de compra recepcionada");
        }
        int cantidad = detalleRecepcion.getCantidadRecibida() == null ? 0 : detalleRecepcion.getCantidadRecibida();
        if (cantidad <= 0) {
            throw new IllegalArgumentException("La cantidad recibida debe ser mayor a 0");
        }
        int recibido = detalleOrdenCompra.getCantidadRecibida() == null ? 0 : detalleOrdenCompra.getCantidadRecibida();
        int pendiente = detalleOrdenCompra.getCantidadSolicitada() - recibido;
        if (cantidad > pendiente) {
            throw new IllegalStateException("Se está recibiendo más de lo pendiente. Pendiente: " + pendiente);
        }
        sumarStock(detalleOrdenCompra, cantidad, recepcionCompra, ordenCompra);
        detalleOrdenCompra.setCantidadRecibida(recibido + cantidad);
        detalleOrdenCompraRepository.save(detalleOrdenCompra);
        actualizarEstadoOrden(ordenCompra);
        return detalleRecepcionRepository.save(detalleRecepcion);
    }

    public List<DetalleRecepcion> listarDetallesRecepcion() {
        return detalleRecepcionRepository.findAll();
    }

    public Optional<DetalleRecepcion> findById(Long id) {
        return detalleRecepcionRepository.findById(id);
    }

    public List<DetalleRecepcion> findByRecepcionCompra(Long idRecepcionCompra) {
        return detalleRecepcionRepository.findByRecepcionCompraIdRecepcionCompra(idRecepcionCompra);
    }

    public DetalleRecepcion actualizarDetalleRecepcion(Long id, DetalleRecepcion datos) {
        DetalleRecepcion detalleRecepcionActual = detalleRecepcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("DetalleRecepcion no encontrado con id: " + id));
        detalleRecepcionActual.setCantidadRecibida(datos.getCantidadRecibida());
        detalleRecepcionActual.setRecepcionCompra(resolverRecepcionCompra(datos.getRecepcionCompra()));
        detalleRecepcionActual.setDetalleOrdenCompra(resolverDetalleOrdenCompra(datos.getDetalleOrdenCompra()));
        return detalleRecepcionRepository.save(detalleRecepcionActual);
    }

    public void eliminarDetalleRecepcion(Long id) {
        detalleRecepcionRepository.deleteById(id);
    }

    private RecepcionCompra resolverRecepcionCompra(RecepcionCompra recepcionCompra) {
        if (recepcionCompra == null || recepcionCompra.getIdRecepcionCompra() == null) {
            throw new RuntimeException("RecepcionCompra no encontrada con id: null");
        }
        return recepcionCompraRepository.findById(recepcionCompra.getIdRecepcionCompra())
                .orElseThrow(() -> new RuntimeException("RecepcionCompra no encontrada con id: " + recepcionCompra.getIdRecepcionCompra()));
    }

    private DetalleOrdenCompra resolverDetalleOrdenCompra(DetalleOrdenCompra detalleOrdenCompra) {
        if (detalleOrdenCompra == null || detalleOrdenCompra.getIdDetalleOrdenCompra() == null) {
            throw new RuntimeException("DetalleOrdenCompra no encontrado con id: null");
        }
        return detalleOrdenCompraRepository.findById(detalleOrdenCompra.getIdDetalleOrdenCompra())
                .orElseThrow(() -> new RuntimeException("DetalleOrdenCompra no encontrado con id: " + detalleOrdenCompra.getIdDetalleOrdenCompra()));
    }

    // La orden queda RECIBIDA cuando llegó todo lo solicitado, si no RECIBIDA_PARCIAL
    private void actualizarEstadoOrden(OrdenCompra ordenCompra) {
        List<DetalleOrdenCompra> detalles = detalleOrdenCompraRepository.findByOrdenCompraIdOrdenCompra(ordenCompra.getIdOrdenCompra());
        boolean completa = detalles.stream()
                .allMatch(d -> d.getCantidadRecibida() != null && d.getCantidadRecibida() >= d.getCantidadSolicitada());
        ordenCompra.setEstado(completa ? EstadoOrdenCompra.RECIBIDA : EstadoOrdenCompra.RECIBIDA_PARCIAL);
        ordenCompraRepository.save(ordenCompra);
    }

    // Consulta ms-inventario, suma lo recibido y deja el ingreso de mercancía
    private void sumarStock(DetalleOrdenCompra detalleOrdenCompra, int cantidad, RecepcionCompra recepcionCompra, OrdenCompra ordenCompra) {
        Map<?, ?> item;
        try {
            item = restTemplate.getForObject(URI.create(itemsInventarioUrl + "/idVariante/" + detalleOrdenCompra.getIdVariante()), Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            item = null;
        }
        if (item == null) {
            throw new RuntimeException("Inventario no encontrado para la variante con id: " + detalleOrdenCompra.getIdVariante());
        }
        int stockAnterior = numero(item.get("stockDisponible"));
        int stockResultante = stockAnterior + cantidad;
        Long idItemInventario = ((Number) item.get("idItemInventario")).longValue();
        String ahora = LocalDateTime.now().withNano(0).toString();

        // PUT /api/v1/items-inventario/{id} con el stock sumado
        Map<String, Object> itemActualizado = new HashMap<>();
        itemActualizado.put("idVariante", item.get("idVariante"));
        itemActualizado.put("stockDisponible", stockResultante);
        itemActualizado.put("stockReservado", item.get("stockReservado"));
        itemActualizado.put("stockMinimo", item.get("stockMinimo"));
        itemActualizado.put("costoPromedio", item.get("costoPromedio"));
        itemActualizado.put("fechaActualizacion", ahora);
        itemActualizado.put("idProveedores", item.get("idProveedores"));
        restTemplate.put(URI.create(itemsInventarioUrl + "/" + idItemInventario), itemActualizado);

        // POST /api/v1/ingresos para dejar el ingreso de mercancía con su documento
        Map<String, Object> ingreso = new HashMap<>();
        ingreso.put("tipo", "INGRESO");
        ingreso.put("cantidad", cantidad);
        ingreso.put("stockAnterior", stockAnterior);
        ingreso.put("stockResultante", stockResultante);
        ingreso.put("fecha", ahora);
        ingreso.put("observacion", "Recepción de la orden de compra " + ordenCompra.getNumero());
        ingreso.put("idEmpleado", recepcionCompra.getIdEmpleado());
        ingreso.put("itemInventario", Map.of("idItemInventario", idItemInventario));
        ingreso.put("costoUnitario", detalleOrdenCompra.getCostoUnitario());
        ingreso.put("numeroDocumento", recepcionCompra.getNumeroDocumento());
        ingreso.put("idProveedor", ordenCompra.getProveedor().getIdProveedor());
        restTemplate.postForEntity(URI.create(ingresosUrl), ingreso, String.class);
    }

    private int numero(Object valor) {
        return valor == null ? 0 : ((Number) valor).intValue();
    }
}
