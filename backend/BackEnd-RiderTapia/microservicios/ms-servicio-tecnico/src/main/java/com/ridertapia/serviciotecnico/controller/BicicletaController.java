package com.ridertapia.serviciotecnico.controller;

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

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.service.BicicletaService;

@RestController
@RequestMapping("/api/v1/bicicletas")
public class BicicletaController {

    @Autowired
    private BicicletaService bicicletaService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<Bicicleta>>> listarBicicletas() {
        CollectionModel<EntityModel<Bicicleta>> coleccion = CollectionModel.of(
                toModelList(bicicletaService.listarBicicletas()),
                linkTo(methodOn(BicicletaController.class).listarBicicletas()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<Bicicleta>> obtenerPorId(@PathVariable Long id) {
        return bicicletaService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/rutCliente/{rutCliente}")
    public ResponseEntity<CollectionModel<EntityModel<Bicicleta>>> obtenerPorRutCliente(@PathVariable String rutCliente) {
        CollectionModel<EntityModel<Bicicleta>> coleccion = CollectionModel.of(
                toModelList(bicicletaService.findByRutCliente(rutCliente)),
                linkTo(methodOn(BicicletaController.class).obtenerPorRutCliente(rutCliente)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<Bicicleta>> crearBicicleta(@RequestBody Bicicleta bicicleta) {
        try {
            Bicicleta nuevo = bicicletaService.guardarBicicleta(bicicleta);
            return ResponseEntity
                    .created(linkTo(methodOn(BicicletaController.class).obtenerPorId(nuevo.getIdBicicleta())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<Bicicleta>> actualizarBicicleta(@PathVariable Long id, @RequestBody Bicicleta bicicleta) {
        try {
            Bicicleta actualizado = bicicletaService.actualizarBicicleta(id, bicicleta);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarBicicleta(@PathVariable Long id) {
        try {
            bicicletaService.eliminarBicicleta(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<Bicicleta>> toModelList(List<Bicicleta> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(BicicletaController.class).obtenerPorId(x.getIdBicicleta())).withSelfRel()))
                .toList();
    }

    private EntityModel<Bicicleta> toModel(Bicicleta bicicleta) {
        return EntityModel.of(bicicleta,
                linkTo(methodOn(BicicletaController.class).obtenerPorId(bicicleta.getIdBicicleta())).withSelfRel(),
                linkTo(methodOn(BicicletaController.class).listarBicicletas()).withRel("bicicletas"));
    }
}
