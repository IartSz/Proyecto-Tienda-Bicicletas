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

import com.ridertapia.proveedores.model.RecepcionCompra;
import com.ridertapia.proveedores.service.RecepcionCompraService;

@RestController
@RequestMapping("/api/v1/recepciones-compra")
public class RecepcionCompraController {

    @Autowired
    private RecepcionCompraService recepcionCompraService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<RecepcionCompra>>> listarRecepcionesCompra() {
        CollectionModel<EntityModel<RecepcionCompra>> coleccion = CollectionModel.of(
                toModelList(recepcionCompraService.listarRecepcionesCompra()),
                linkTo(methodOn(RecepcionCompraController.class).listarRecepcionesCompra()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<RecepcionCompra>> obtenerPorId(@PathVariable Long id) {
        return recepcionCompraService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenCompra/{idOrdenCompra}")
    public ResponseEntity<CollectionModel<EntityModel<RecepcionCompra>>> obtenerPorOrdenCompra(@PathVariable Long idOrdenCompra) {
        CollectionModel<EntityModel<RecepcionCompra>> coleccion = CollectionModel.of(
                toModelList(recepcionCompraService.findByOrdenCompra(idOrdenCompra)),
                linkTo(methodOn(RecepcionCompraController.class).obtenerPorOrdenCompra(idOrdenCompra)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<RecepcionCompra>> crearRecepcionCompra(@RequestBody RecepcionCompra recepcionCompra) {
        try {
            RecepcionCompra nuevo = recepcionCompraService.guardarRecepcionCompra(recepcionCompra);
            return ResponseEntity
                    .created(linkTo(methodOn(RecepcionCompraController.class).obtenerPorId(nuevo.getIdRecepcionCompra())).toUri())
                    .body(toModel(nuevo));
        } catch (IllegalStateException e) {
            // La orden no está enviada
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<RecepcionCompra>> actualizarRecepcionCompra(@PathVariable Long id, @RequestBody RecepcionCompra recepcionCompra) {
        try {
            RecepcionCompra actualizado = recepcionCompraService.actualizarRecepcionCompra(id, recepcionCompra);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (IllegalStateException e) {
            // La orden no está enviada
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRecepcionCompra(@PathVariable Long id) {
        try {
            recepcionCompraService.eliminarRecepcionCompra(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<RecepcionCompra>> toModelList(List<RecepcionCompra> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(RecepcionCompraController.class).obtenerPorId(x.getIdRecepcionCompra())).withSelfRel()))
                .toList();
    }

    private EntityModel<RecepcionCompra> toModel(RecepcionCompra recepcionCompra) {
        return EntityModel.of(recepcionCompra,
                linkTo(methodOn(RecepcionCompraController.class).obtenerPorId(recepcionCompra.getIdRecepcionCompra())).withSelfRel(),
                linkTo(methodOn(RecepcionCompraController.class).listarRecepcionesCompra()).withRel("recepcionesCompra"));
    }
}
