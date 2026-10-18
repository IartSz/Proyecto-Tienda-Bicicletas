package com.ridertapia.proveedores.service;

import java.net.URI;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import com.ridertapia.proveedores.model.ProductoProveedor;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProductoProveedorRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@Service
public class ProductoProveedorService {

    @Autowired
    private ProductoProveedorRepository productoProveedorRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${ms.productos.variantes-url}")
    private String varianteUrl;

    public ProductoProveedor guardarProductoProveedor(ProductoProveedor productoProveedor) {
        productoProveedor.setProveedor(resolverProveedor(productoProveedor.getProveedor()));
        if (!existeVariante(productoProveedor.getIdVariante())) {
            throw new RuntimeException("Variante no encontrada con id: " + productoProveedor.getIdVariante());
        }
        return productoProveedorRepository.save(productoProveedor);
    }

    public List<ProductoProveedor> listarProductosProveedor() {
        return productoProveedorRepository.findAll();
    }

    public Optional<ProductoProveedor> findById(Long id) {
        return productoProveedorRepository.findById(id);
    }

    public List<ProductoProveedor> findByIdVariante(Long idVariante) {
        return productoProveedorRepository.findByIdVariante(idVariante);
    }

    public List<ProductoProveedor> findByProveedor(Long idProveedor) {
        return productoProveedorRepository.findByProveedorIdProveedor(idProveedor);
    }

    public ProductoProveedor actualizarProductoProveedor(Long id, ProductoProveedor datos) {
        ProductoProveedor productoProveedorActual = productoProveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("ProductoProveedor no encontrado con id: " + id));
        productoProveedorActual.setIdVariante(datos.getIdVariante());
        productoProveedorActual.setCodigoProveedor(datos.getCodigoProveedor());
        productoProveedorActual.setCostoUnitario(datos.getCostoUnitario());
        productoProveedorActual.setPlazoEntregaDias(datos.getPlazoEntregaDias());
        productoProveedorActual.setPreferido(datos.getPreferido());
        productoProveedorActual.setProveedor(resolverProveedor(datos.getProveedor()));
        return productoProveedorRepository.save(productoProveedorActual);
    }

    public void eliminarProductoProveedor(Long id) {
        productoProveedorRepository.deleteById(id);
    }

    private Proveedor resolverProveedor(Proveedor proveedor) {
        if (proveedor == null || proveedor.getIdProveedor() == null) {
            throw new RuntimeException("Proveedor no encontrado con id: null");
        }
        return proveedorRepository.findById(proveedor.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id: " + proveedor.getIdProveedor()));
    }

    // Consulta a ms-productos: GET /api/v1/variantes/{id}
    private boolean existeVariante(Long id) {
        try {
            restTemplate.getForEntity(URI.create(varianteUrl + "/" + id), String.class);
            return true;
        } catch (HttpClientErrorException.NotFound e) {
            return false;
        }
    }
}
