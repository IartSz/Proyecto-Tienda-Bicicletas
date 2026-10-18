package com.ridertapia.proveedores.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ridertapia.proveedores.model.Proveedor;
import com.ridertapia.proveedores.service.ProveedorService;

@RestController
@RequestMapping("/api/v1/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<Proveedor>>> listarProveedores() {
        CollectionModel<EntityModel<Proveedor>> coleccion = CollectionModel.of(
                toModelList(proveedorService.listarProveedores()),
                linkTo(methodOn(ProveedorController.class).listarProveedores()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<Proveedor>> obtenerPorId(@PathVariable Long id) {
        return proveedorService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rut/{rut}")
    public ResponseEntity<EntityModel<Proveedor>> obtenerPorRut(@PathVariable String rut) {
        Proveedor proveedor = proveedorService.findByRut(rut);
        if (proveedor == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(toModel(proveedor));
    }

    @PostMapping
    public ResponseEntity<EntityModel<Proveedor>> crearProveedor(@RequestBody Proveedor proveedor) {
        try {
            Proveedor nuevo = proveedorService.guardarProveedor(proveedor);
            return ResponseEntity
                    .created(linkTo(methodOn(ProveedorController.class).obtenerPorId(nuevo.getIdProveedor())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<Proveedor>> actualizarProveedor(@PathVariable Long id, @RequestBody Proveedor proveedor) {
        try {
            Proveedor actualizado = proveedorService.actualizarProveedor(id, proveedor);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProveedor(@PathVariable Long id) {
        try {
            proveedorService.eliminarProveedor(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<Proveedor>> toModelList(List<Proveedor> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(ProveedorController.class).obtenerPorId(x.getIdProveedor())).withSelfRel()))
                .toList();
    }

    private EntityModel<Proveedor> toModel(Proveedor proveedor) {
        return EntityModel.of(proveedor,
                linkTo(methodOn(ProveedorController.class).obtenerPorId(proveedor.getIdProveedor())).withSelfRel(),
                linkTo(methodOn(ProveedorController.class).listarProveedores()).withRel("proveedores"));
    }
}
