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

import com.ridertapia.proveedores.model.EstadoOrdenCompra;
import com.ridertapia.proveedores.model.OrdenCompra;
import com.ridertapia.proveedores.service.OrdenCompraService;

@RestController
@RequestMapping("/api/v1/ordenes-compra")
public class OrdenCompraController {

    @Autowired
    private OrdenCompraService ordenCompraService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<OrdenCompra>>> listarOrdenesCompra() {
        CollectionModel<EntityModel<OrdenCompra>> coleccion = CollectionModel.of(
                toModelList(ordenCompraService.listarOrdenesCompra()),
                linkTo(methodOn(OrdenCompraController.class).listarOrdenesCompra()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<OrdenCompra>> obtenerPorId(@PathVariable Long id) {
        return ordenCompraService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/proveedor/{idProveedor}")
    public ResponseEntity<CollectionModel<EntityModel<OrdenCompra>>> obtenerPorProveedor(@PathVariable Long idProveedor) {
        CollectionModel<EntityModel<OrdenCompra>> coleccion = CollectionModel.of(
                toModelList(ordenCompraService.findByProveedor(idProveedor)),
                linkTo(methodOn(OrdenCompraController.class).obtenerPorProveedor(idProveedor)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/estado/{estado}")
    public ResponseEntity<CollectionModel<EntityModel<OrdenCompra>>> obtenerPorEstado(@PathVariable EstadoOrdenCompra estado) {
        CollectionModel<EntityModel<OrdenCompra>> coleccion = CollectionModel.of(
                toModelList(ordenCompraService.findByEstado(estado)),
                linkTo(methodOn(OrdenCompraController.class).obtenerPorEstado(estado)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<OrdenCompra>> crearOrdenCompra(@RequestBody OrdenCompra ordenCompra) {
        try {
            OrdenCompra nuevo = ordenCompraService.guardarOrdenCompra(ordenCompra);
            return ResponseEntity
                    .created(linkTo(methodOn(OrdenCompraController.class).obtenerPorId(nuevo.getIdOrdenCompra())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<OrdenCompra>> actualizarOrdenCompra(@PathVariable Long id, @RequestBody OrdenCompra ordenCompra) {
        try {
            OrdenCompra actualizado = ordenCompraService.actualizarOrdenCompra(id, ordenCompra);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOrdenCompra(@PathVariable Long id) {
        try {
            ordenCompraService.eliminarOrdenCompra(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<OrdenCompra>> toModelList(List<OrdenCompra> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(OrdenCompraController.class).obtenerPorId(x.getIdOrdenCompra())).withSelfRel()))
                .toList();
    }

    private EntityModel<OrdenCompra> toModel(OrdenCompra ordenCompra) {
        return EntityModel.of(ordenCompra,
                linkTo(methodOn(OrdenCompraController.class).obtenerPorId(ordenCompra.getIdOrdenCompra())).withSelfRel(),
                linkTo(methodOn(OrdenCompraController.class).listarOrdenesCompra()).withRel("ordenesCompra"));
    }
}
