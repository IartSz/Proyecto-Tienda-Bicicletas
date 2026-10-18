package com.ridertapia.proveedores.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
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

import com.ridertapia.proveedores.model.DetalleRecepcion;
import com.ridertapia.proveedores.service.DetalleRecepcionService;

@RestController
@RequestMapping("/api/v1/detalles-recepcion")
public class DetalleRecepcionController {

    @Autowired
    private DetalleRecepcionService detalleRecepcionService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<DetalleRecepcion>>> listarDetallesRecepcion() {
        CollectionModel<EntityModel<DetalleRecepcion>> coleccion = CollectionModel.of(
                toModelList(detalleRecepcionService.listarDetallesRecepcion()),
                linkTo(methodOn(DetalleRecepcionController.class).listarDetallesRecepcion()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<DetalleRecepcion>> obtenerPorId(@PathVariable Long id) {
        return detalleRecepcionService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recepcionCompra/{idRecepcionCompra}")
    public ResponseEntity<CollectionModel<EntityModel<DetalleRecepcion>>> obtenerPorRecepcionCompra(@PathVariable Long idRecepcionCompra) {
        CollectionModel<EntityModel<DetalleRecepcion>> coleccion = CollectionModel.of(
                toModelList(detalleRecepcionService.findByRecepcionCompra(idRecepcionCompra)),
                linkTo(methodOn(DetalleRecepcionController.class).obtenerPorRecepcionCompra(idRecepcionCompra)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<DetalleRecepcion>> crearDetalleRecepcion(@RequestBody DetalleRecepcion detalleRecepcion) {
        try {
            DetalleRecepcion nuevo = detalleRecepcionService.guardarDetalleRecepcion(detalleRecepcion);
            return ResponseEntity
                    .created(linkTo(methodOn(DetalleRecepcionController.class).obtenerPorId(nuevo.getIdDetalleRecepcion())).toUri())
                    .body(toModel(nuevo));
        } catch (IllegalStateException e) {
            // Más de lo pendiente o de otra orden
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Cantidad no válida
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<DetalleRecepcion>> actualizarDetalleRecepcion(@PathVariable Long id, @RequestBody DetalleRecepcion detalleRecepcion) {
        try {
            DetalleRecepcion actualizado = detalleRecepcionService.actualizarDetalleRecepcion(id, detalleRecepcion);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (IllegalStateException e) {
            // Más de lo pendiente o de otra orden
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Cantidad no válida
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDetalleRecepcion(@PathVariable Long id) {
        detalleRecepcionService.eliminarDetalleRecepcion(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<DetalleRecepcion>> toModelList(List<DetalleRecepcion> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(DetalleRecepcionController.class).obtenerPorId(x.getIdDetalleRecepcion())).withSelfRel()))
                .toList();
    }

    private EntityModel<DetalleRecepcion> toModel(DetalleRecepcion detalleRecepcion) {
        return EntityModel.of(detalleRecepcion,
                linkTo(methodOn(DetalleRecepcionController.class).obtenerPorId(detalleRecepcion.getIdDetalleRecepcion())).withSelfRel(),
                linkTo(methodOn(DetalleRecepcionController.class).listarDetallesRecepcion()).withRel("detallesRecepcion"));
    }
}
