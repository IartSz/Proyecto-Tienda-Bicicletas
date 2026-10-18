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

import com.ridertapia.proveedores.model.DetalleOrdenCompra;
import com.ridertapia.proveedores.service.DetalleOrdenCompraService;

@RestController
@RequestMapping("/api/v1/detalles-orden-compra")
public class DetalleOrdenCompraController {

    @Autowired
    private DetalleOrdenCompraService detalleOrdenCompraService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<DetalleOrdenCompra>>> listarDetallesOrdenCompra() {
        CollectionModel<EntityModel<DetalleOrdenCompra>> coleccion = CollectionModel.of(
                toModelList(detalleOrdenCompraService.listarDetallesOrdenCompra()),
                linkTo(methodOn(DetalleOrdenCompraController.class).listarDetallesOrdenCompra()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<DetalleOrdenCompra>> obtenerPorId(@PathVariable Long id) {
        return detalleOrdenCompraService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenCompra/{idOrdenCompra}")
    public ResponseEntity<CollectionModel<EntityModel<DetalleOrdenCompra>>> obtenerPorOrdenCompra(@PathVariable Long idOrdenCompra) {
        CollectionModel<EntityModel<DetalleOrdenCompra>> coleccion = CollectionModel.of(
                toModelList(detalleOrdenCompraService.findByOrdenCompra(idOrdenCompra)),
                linkTo(methodOn(DetalleOrdenCompraController.class).obtenerPorOrdenCompra(idOrdenCompra)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<DetalleOrdenCompra>> crearDetalleOrdenCompra(@RequestBody DetalleOrdenCompra detalleOrdenCompra) {
        try {
            DetalleOrdenCompra nuevo = detalleOrdenCompraService.guardarDetalleOrdenCompra(detalleOrdenCompra);
            return ResponseEntity
                    .created(linkTo(methodOn(DetalleOrdenCompraController.class).obtenerPorId(nuevo.getIdDetalleOrdenCompra())).toUri())
                    .body(toModel(nuevo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<DetalleOrdenCompra>> actualizarDetalleOrdenCompra(@PathVariable Long id, @RequestBody DetalleOrdenCompra detalleOrdenCompra) {
        try {
            DetalleOrdenCompra actualizado = detalleOrdenCompraService.actualizarDetalleOrdenCompra(id, detalleOrdenCompra);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarDetalleOrdenCompra(@PathVariable Long id) {
        try {
            detalleOrdenCompraService.eliminarDetalleOrdenCompra(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<DetalleOrdenCompra>> toModelList(List<DetalleOrdenCompra> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(DetalleOrdenCompraController.class).obtenerPorId(x.getIdDetalleOrdenCompra())).withSelfRel()))
                .toList();
    }

    private EntityModel<DetalleOrdenCompra> toModel(DetalleOrdenCompra detalleOrdenCompra) {
        return EntityModel.of(detalleOrdenCompra,
                linkTo(methodOn(DetalleOrdenCompraController.class).obtenerPorId(detalleOrdenCompra.getIdDetalleOrdenCompra())).withSelfRel(),
                linkTo(methodOn(DetalleOrdenCompraController.class).listarDetallesOrdenCompra()).withRel("detallesOrdenCompra"));
    }
}
