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

import com.ridertapia.proveedores.model.ProductoProveedor;
import com.ridertapia.proveedores.service.ProductoProveedorService;

@RestController
@RequestMapping("/api/v1/productos-proveedor")
public class ProductoProveedorController {

    @Autowired
    private ProductoProveedorService productoProveedorService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<ProductoProveedor>>> listarProductosProveedor() {
        CollectionModel<EntityModel<ProductoProveedor>> coleccion = CollectionModel.of(
                toModelList(productoProveedorService.listarProductosProveedor()),
                linkTo(methodOn(ProductoProveedorController.class).listarProductosProveedor()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<ProductoProveedor>> obtenerPorId(@PathVariable Long id) {
        return productoProveedorService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/idVariante/{idVariante}")
    public ResponseEntity<CollectionModel<EntityModel<ProductoProveedor>>> obtenerPorIdVariante(@PathVariable Long idVariante) {
        CollectionModel<EntityModel<ProductoProveedor>> coleccion = CollectionModel.of(
                toModelList(productoProveedorService.findByIdVariante(idVariante)),
                linkTo(methodOn(ProductoProveedorController.class).obtenerPorIdVariante(idVariante)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/proveedor/{idProveedor}")
    public ResponseEntity<CollectionModel<EntityModel<ProductoProveedor>>> obtenerPorProveedor(@PathVariable Long idProveedor) {
        CollectionModel<EntityModel<ProductoProveedor>> coleccion = CollectionModel.of(
                toModelList(productoProveedorService.findByProveedor(idProveedor)),
                linkTo(methodOn(ProductoProveedorController.class).obtenerPorProveedor(idProveedor)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<ProductoProveedor>> crearProductoProveedor(@RequestBody ProductoProveedor productoProveedor) {
        try {
            ProductoProveedor nuevo = productoProveedorService.guardarProductoProveedor(productoProveedor);
            return ResponseEntity
                    .created(linkTo(methodOn(ProductoProveedorController.class).obtenerPorId(nuevo.getIdProductoProveedor())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<ProductoProveedor>> actualizarProductoProveedor(@PathVariable Long id, @RequestBody ProductoProveedor productoProveedor) {
        try {
            ProductoProveedor actualizado = productoProveedorService.actualizarProductoProveedor(id, productoProveedor);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarProductoProveedor(@PathVariable Long id) {
        productoProveedorService.eliminarProductoProveedor(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<ProductoProveedor>> toModelList(List<ProductoProveedor> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(ProductoProveedorController.class).obtenerPorId(x.getIdProductoProveedor())).withSelfRel()))
                .toList();
    }

    private EntityModel<ProductoProveedor> toModel(ProductoProveedor productoProveedor) {
        return EntityModel.of(productoProveedor,
                linkTo(methodOn(ProductoProveedorController.class).obtenerPorId(productoProveedor.getIdProductoProveedor())).withSelfRel(),
                linkTo(methodOn(ProductoProveedorController.class).listarProductosProveedor()).withRel("productosProveedor"));
    }
}
