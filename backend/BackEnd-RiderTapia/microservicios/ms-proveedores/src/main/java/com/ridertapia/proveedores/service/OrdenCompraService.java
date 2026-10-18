package com.ridertapia.proveedores.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.OrdenCompraRepository;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@Service
public class OrdenCompraService {

    @Autowired
    private OrdenCompraRepository ordenCompraRepository;

    @Autowired
    private ProveedorRepository proveedorRepository;

    private static final double IVA = 0.19;

    // La orden parte como borrador, con número correlativo y totales con IVA
    public OrdenCompra guardarOrdenCompra(OrdenCompra ordenCompra) {
        ordenCompra.setProveedor(resolverProveedor(ordenCompra.getProveedor()));
        if (ordenCompra.getEstado() == null) {
            ordenCompra.setEstado(EstadoOrdenCompra.BORRADOR);
        }
        calcularTotales(ordenCompra);
        OrdenCompra nueva = ordenCompraRepository.save(ordenCompra);
        if (nueva.getNumero() == null) {
            nueva.setNumero(String.format("OC-%05d", nueva.getIdOrdenCompra()));
            nueva = ordenCompraRepository.save(nueva);
        }
        return nueva;
    }

    public List<OrdenCompra> listarOrdenesCompra() {
        return ordenCompraRepository.findAll();
    }

    public Optional<OrdenCompra> findById(Long id) {
        return ordenCompraRepository.findById(id);
    }

    public List<OrdenCompra> findByProveedor(Long idProveedor) {
        return ordenCompraRepository.findByProveedorIdProveedor(idProveedor);
    }

    public List<OrdenCompra> findByEstado(EstadoOrdenCompra estado) {
        return ordenCompraRepository.findByEstado(estado);
    }

    public OrdenCompra actualizarOrdenCompra(Long id, OrdenCompra datos) {
        OrdenCompra ordenCompraActual = ordenCompraRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrdenCompra no encontrada con id: " + id));
        if (datos.getNumero() != null) {
            ordenCompraActual.setNumero(datos.getNumero());
        }
        ordenCompraActual.setFechaEmision(datos.getFechaEmision());
        ordenCompraActual.setFechaEntregaEsperada(datos.getFechaEntregaEsperada());
        ordenCompraActual.setEstado(datos.getEstado());
        ordenCompraActual.setMontoNeto(datos.getMontoNeto());
        ordenCompraActual.setIva(datos.getIva());
        ordenCompraActual.setTotal(datos.getTotal());
        ordenCompraActual.setObservacion(datos.getObservacion());
        ordenCompraActual.setIdEmpleado(datos.getIdEmpleado());
        ordenCompraActual.setProveedor(resolverProveedor(datos.getProveedor()));
        calcularTotales(ordenCompraActual);
        return ordenCompraRepository.save(ordenCompraActual);
    }

    public void eliminarOrdenCompra(Long id) {
        ordenCompraRepository.deleteById(id);
    }

    private Proveedor resolverProveedor(Proveedor proveedor) {
        if (proveedor == null || proveedor.getIdProveedor() == null) {
            throw new RuntimeException("Proveedor no encontrado con id: null");
        }
        return proveedorRepository.findById(proveedor.getIdProveedor())
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id: " + proveedor.getIdProveedor()));
    }

    // IVA de 19% sobre el monto neto
    private void calcularTotales(OrdenCompra ordenCompra) {
        int neto = ordenCompra.getMontoNeto() == null ? 0 : ordenCompra.getMontoNeto();
        int iva = (int) Math.round(neto * IVA);
        ordenCompra.setMontoNeto(neto);
        ordenCompra.setIva(iva);
        ordenCompra.setTotal(neto + iva);
    }
}
