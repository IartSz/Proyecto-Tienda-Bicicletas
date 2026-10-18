package com.ridertapia.serviciotecnico.service;

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

import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;
import com.ridertapia.serviciotecnico.repository.OrdenTrabajoRepository;
import com.ridertapia.serviciotecnico.repository.RepuestoUtilizadoRepository;

@Service
public class RepuestoUtilizadoService {

    @Autowired
    private RepuestoUtilizadoRepository repuestoUtilizadoRepository;

    @Autowired
    private OrdenTrabajoRepository ordenTrabajoRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.inventario.items-url}")
    private String itemsInventarioUrl;

    @Value("${ms.inventario.movimientos-url}")
    private String movimientosUrl;

    // HU-44: el repuesto se descuenta del inventario al registrarlo en la orden
    public RepuestoUtilizado guardarRepuestoUtilizado(RepuestoUtilizado repuestoUtilizado) {
        repuestoUtilizado.setOrdenTrabajo(resolverOrdenTrabajo(repuestoUtilizado.getOrdenTrabajo()));
        if (repuestoUtilizado.getCantidad() == null || repuestoUtilizado.getCantidad() <= 0) {
            throw new IllegalArgumentException("La cantidad debe ser mayor a 0");
        }
        descontarStock(repuestoUtilizado);
        return repuestoUtilizadoRepository.save(repuestoUtilizado);
    }

    public List<RepuestoUtilizado> listarRepuestosUtilizados() {
        return repuestoUtilizadoRepository.findAll();
    }

    public Optional<RepuestoUtilizado> findById(Long id) {
        return repuestoUtilizadoRepository.findById(id);
    }

    public List<RepuestoUtilizado> findByOrdenTrabajo(Long idOrdenTrabajo) {
        return repuestoUtilizadoRepository.findByOrdenTrabajoIdOrdenTrabajo(idOrdenTrabajo);
    }

    public RepuestoUtilizado actualizarRepuestoUtilizado(Long id, RepuestoUtilizado datos) {
        RepuestoUtilizado repuestoUtilizadoActual = repuestoUtilizadoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("RepuestoUtilizado no encontrado con id: " + id));
        repuestoUtilizadoActual.setIdVariante(datos.getIdVariante());
        repuestoUtilizadoActual.setCantidad(datos.getCantidad());
        repuestoUtilizadoActual.setPrecioUnitario(datos.getPrecioUnitario());
        repuestoUtilizadoActual.setFechaRegistro(datos.getFechaRegistro());
        repuestoUtilizadoActual.setOrdenTrabajo(resolverOrdenTrabajo(datos.getOrdenTrabajo()));
        return repuestoUtilizadoRepository.save(repuestoUtilizadoActual);
    }

    public void eliminarRepuestoUtilizado(Long id) {
        repuestoUtilizadoRepository.deleteById(id);
    }

    private OrdenTrabajo resolverOrdenTrabajo(OrdenTrabajo ordenTrabajo) {
        if (ordenTrabajo == null || ordenTrabajo.getIdOrdenTrabajo() == null) {
            throw new RuntimeException("OrdenTrabajo no encontrada con id: null");
        }
        return ordenTrabajoRepository.findById(ordenTrabajo.getIdOrdenTrabajo())
                .orElseThrow(() -> new RuntimeException("OrdenTrabajo no encontrada con id: " + ordenTrabajo.getIdOrdenTrabajo()));
    }

    // Consulta ms-inventario, valida el stock disponible, lo descuenta y deja el movimiento USO_TALLER
    private void descontarStock(RepuestoUtilizado repuestoUtilizado) {
        Map<?, ?> item;
        try {
            item = restTemplate.getForObject(URI.create(itemsInventarioUrl + "/idVariante/" + repuestoUtilizado.getIdVariante()), Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            item = null;
        }
        if (item == null) {
            throw new RuntimeException("Inventario no encontrado para la variante con id: " + repuestoUtilizado.getIdVariante());
        }
        int stockAnterior = numero(item.get("stockDisponible"));
        if (stockAnterior < repuestoUtilizado.getCantidad()) {
            throw new IllegalStateException("Stock insuficiente. Disponible: " + stockAnterior);
        }
        int stockResultante = stockAnterior - repuestoUtilizado.getCantidad();
        Long idItemInventario = ((Number) item.get("idItemInventario")).longValue();
        String ahora = LocalDateTime.now().withNano(0).toString();

        // PUT /api/v1/items-inventario/{id} con el stock descontado
        Map<String, Object> itemActualizado = new HashMap<>();
        itemActualizado.put("idVariante", item.get("idVariante"));
        itemActualizado.put("stockDisponible", stockResultante);
        itemActualizado.put("stockReservado", item.get("stockReservado"));
        itemActualizado.put("stockMinimo", item.get("stockMinimo"));
        itemActualizado.put("costoPromedio", item.get("costoPromedio"));
        itemActualizado.put("fechaActualizacion", ahora);
        itemActualizado.put("idProveedores", item.get("idProveedores"));
        restTemplate.put(URI.create(itemsInventarioUrl + "/" + idItemInventario), itemActualizado);

        // POST /api/v1/movimientos para dejar el registro del uso en taller
        OrdenTrabajo ordenTrabajo = repuestoUtilizado.getOrdenTrabajo();
        Map<String, Object> movimiento = new HashMap<>();
        movimiento.put("tipo", "USO_TALLER");
        movimiento.put("cantidad", repuestoUtilizado.getCantidad());
        movimiento.put("stockAnterior", stockAnterior);
        movimiento.put("stockResultante", stockResultante);
        movimiento.put("fecha", ahora);
        movimiento.put("observacion", "Repuesto usado en la orden " + ordenTrabajo.getCodigo());
        movimiento.put("idEmpleado", ordenTrabajo.getIdEmpleado());
        movimiento.put("idOrdenTrabajo", ordenTrabajo.getIdOrdenTrabajo());
        movimiento.put("itemInventario", Map.of("idItemInventario", idItemInventario));
        restTemplate.postForEntity(URI.create(movimientosUrl), movimiento, String.class);
    }

    private int numero(Object valor) {
        return valor == null ? 0 : ((Number) valor).intValue();
    }
}
