package com.ridertapia.proveedores.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.repository.ProveedorRepository;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public Proveedor guardarProveedor(Proveedor proveedor) {
        return proveedorRepository.save(proveedor);
    }

    public List<Proveedor> listarProveedores() {
        return proveedorRepository.findAll();
    }

    public Optional<Proveedor> findById(Long id) {
        return proveedorRepository.findById(id);
    }

    public Proveedor findByRut(String rut) {
        return proveedorRepository.findByRut(rut).orElse(null);
    }

    public Proveedor actualizarProveedor(Long id, Proveedor datos) {
        Proveedor proveedorActual = proveedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado con id: " + id));
        proveedorActual.setRut(datos.getRut());
        proveedorActual.setRazonSocial(datos.getRazonSocial());
        proveedorActual.setNombreFantasia(datos.getNombreFantasia());
        proveedorActual.setGiro(datos.getGiro());
        proveedorActual.setEmail(datos.getEmail());
        proveedorActual.setTelefono(datos.getTelefono());
        proveedorActual.setDireccion(datos.getDireccion());
        proveedorActual.setComuna(datos.getComuna());
        proveedorActual.setNombreContacto(datos.getNombreContacto());
        proveedorActual.setActivo(datos.getActivo());
        return proveedorRepository.save(proveedorActual);
    }

    public void eliminarProveedor(Long id) {
        proveedorRepository.deleteById(id);
    }
}
