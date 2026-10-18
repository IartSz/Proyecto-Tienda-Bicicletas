package com.ridertapia.carrito.service;

import java.net.URI;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.carrito.dto.AvisoCambio;
import com.ridertapia.carrito.dto.ResultadoValidacionCupon;
import com.ridertapia.carrito.dto.ResumenCarrito;

import com.ridertapia.carrito.model.Carrito;
import com.ridertapia.carrito.model.ItemCarrito;
import com.ridertapia.carrito.model.TipoAviso;
import com.ridertapia.carrito.repository.CarritoRepository;
import com.ridertapia.carrito.repository.ItemCarritoRepository;

@Service
public class CarritoService {

    @Autowired
    private CarritoRepository carritoRepository;

    @Autowired
    private ItemCarritoRepository itemCarritoRepository;

    @Autowired
    private ItemCarritoService itemCarritoService;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.inventario.url}")
    private String inventarioUrl;

    @Value("${ms.productos.cupones-url}")
    private String cuponesUrl;

    @Value("${ms.clientes.url}")
    private String clientesUrl;

    // El carrito se puede crear con sus productos en "items". Se validan todos antes de guardar nada
    public Carrito guardarCarrito(Carrito carrito) {
        validarCliente(carrito.getRutCliente());
        List<ItemCarrito> items = carrito.getItems() == null ? new ArrayList<>() : carrito.getItems();
        for (ItemCarrito item : items) {
            itemCarritoService.validarItem(item);
        }
        carrito.setItems(new ArrayList<>());
        Carrito nuevo = carritoRepository.save(carrito);
        for (ItemCarrito item : items) {
            item.setCarrito(nuevo);
            if (item.getFechaAgregado() == null) {
                item.setFechaAgregado(nuevo.getFechaCreacion());
            }
            nuevo.getItems().add(itemCarritoRepository.save(item));
        }
        return completarItems(nuevo);
    }

    public List<Carrito> listarCarritos() {
        return carritoRepository.findAll().stream().map(this::completarItems).toList();
    }

    public Optional<Carrito> findById(Long id) {
        return carritoRepository.findById(id).map(this::completarItems);
    }

    public List<Carrito> findByRutCliente(String rutCliente) {
        return carritoRepository.findByRutCliente(rutCliente).stream().map(this::completarItems).toList();
    }

    public Carrito actualizarCarrito(Long id, Carrito datos) {
        Carrito carritoActual = carritoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado con id: " + id));
        carritoActual.setRutCliente(datos.getRutCliente());
        carritoActual.setTokenSesion(datos.getTokenSesion());
        carritoActual.setFechaCreacion(datos.getFechaCreacion());
        carritoActual.setFechaActualizacion(datos.getFechaActualizacion());
        carritoActual.setEstado(datos.getEstado());
        carritoActual.setSubtotal(datos.getSubtotal());
        carritoActual.setDescuento(datos.getDescuento());
        carritoActual.setTotal(datos.getTotal());
        carritoActual.setIdCupon(datos.getIdCupon());
        return completarItems(carritoRepository.save(carritoActual));
    }

    public void eliminarCarrito(Long id) {
        carritoRepository.deleteById(id);
    }

    // getResumen() del diagrama: cantidad de productos y total para el mini carrito (HU-25)
    public ResumenCarrito obtenerResumen(Long idCarrito) {
        Carrito carrito = buscarCarrito(idCarrito);
        List<ItemCarrito> items = itemCarritoRepository.findByCarritoIdCarrito(idCarrito);
        int cantidad = items.stream().mapToInt(ItemCarrito::getCantidad).sum();
        int subtotal = items.stream().mapToInt(i -> i.getCantidad() * i.getPrecioUnitario()).sum();
        int descuento = carrito.getDescuento() == null ? 0 : carrito.getDescuento();
        return new ResumenCarrito(cantidad, Math.max(subtotal - descuento, 0));
    }

    // revalidar() del diagrama: revisa el stock de cada ítem antes de pagar (HU-26)
    public List<AvisoCambio> revalidar(Long idCarrito) {
        buscarCarrito(idCarrito);
        List<AvisoCambio> avisos = new ArrayList<>();
        for (ItemCarrito item : itemCarritoRepository.findByCarritoIdCarrito(idCarrito)) {
            int stock = consultarStock(item.getIdVariante());
            if (stock == 0) {
                avisos.add(new AvisoCambio(TipoAviso.SIN_STOCK, "El producto ya no tiene stock",
                        item.getPrecioUnitario(), item.getPrecioUnitario(), 0, item.getIdItemCarrito()));
            } else if (stock < item.getCantidad()) {
                avisos.add(new AvisoCambio(TipoAviso.STOCK_INSUFICIENTE, "Solo quedan " + stock + " unidades",
                        item.getPrecioUnitario(), item.getPrecioUnitario(), stock, item.getIdItemCarrito()));
            }
        }
        return avisos;
    }

    // aplicarCupon() del diagrama: valida el cupón en ms-productos y calcula el descuento (HU-22)
    public ResultadoValidacionCupon validarCupon(Long idCarrito, String codigo) {
        Carrito carrito = buscarCarrito(idCarrito);
        Map<?, ?> cupon;
        try {
            cupon = restTemplate.getForObject(URI.create(cuponesUrl + "/codigo/" + codigo), Map.class);
        } catch (HttpClientErrorException.NotFound e) {
            cupon = null;
        }
        if (cupon == null) {
            return new ResultadoValidacionCupon(false, "El cupón no existe", 0);
        }
        if (!Boolean.TRUE.equals(cupon.get("activo"))) {
            return new ResultadoValidacionCupon(false, "El cupón no está activo", 0);
        }
        if (cupon.get("fechaTermino") != null
                && LocalDate.now().isAfter(LocalDate.parse(cupon.get("fechaTermino").toString()))) {
            return new ResultadoValidacionCupon(false, "El cupón está vencido", 0);
        }
        int limite = numero(cupon.get("limiteUsos"));
        if (limite > 0 && numero(cupon.get("usosActuales")) >= limite) {
            return new ResultadoValidacionCupon(false, "El cupón alcanzó su límite de usos", 0);
        }
        int subtotal = carrito.getSubtotal() == null ? 0 : carrito.getSubtotal();
        int valor = numero(cupon.get("valor"));
        int descuento = "PORCENTAJE".equals(String.valueOf(cupon.get("tipoDescuento")))
                ? subtotal * valor / 100
                : Math.min(valor, subtotal);
        return new ResultadoValidacionCupon(true, "Cupón válido", descuento);
    }

    // Consulta a ms-cliente: GET /api/v1/clientes/{rut}. Los carritos anónimos (sin RUT) no se validan
    private void validarCliente(String rutCliente) {
        if (rutCliente == null) {
            return;
        }
        try {
            restTemplate.getForEntity(URI.create(clientesUrl + "/" + rutCliente), String.class);
        } catch (HttpClientErrorException.NotFound e) {
            throw new RuntimeException("Cliente no encontrado con rut: " + rutCliente);
        }
    }

    // Agrega a cada ítem el id del producto desde ms-productos
    private Carrito completarItems(Carrito carrito) {
        if (carrito.getItems() != null) {
            carrito.getItems().forEach(item -> itemCarritoService.completarDatosProducto(item));
        }
        return carrito;
    }

    private Carrito buscarCarrito(Long idCarrito) {
        return carritoRepository.findById(idCarrito)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado con id: " + idCarrito));
    }

    // Consulta a ms-inventario: GET /api/v1/items-inventario/idVariante/{idVariante}
    private int consultarStock(Long idVariante) {
        try {
            Map<?, ?> item = restTemplate.getForObject(URI.create(inventarioUrl + "/idVariante/" + idVariante), Map.class);
            return (item == null || item.get("stockDisponible") == null) ? 0 : numero(item.get("stockDisponible"));
        } catch (HttpClientErrorException.NotFound e) {
            return 0;
        }
    }

    private int numero(Object valor) {
        return valor == null ? 0 : ((Number) valor).intValue();
    }
}
