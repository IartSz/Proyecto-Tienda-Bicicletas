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

import com.ridertapia.serviciotecnico.model.OrdenTrabajo;
import com.ridertapia.serviciotecnico.service.OrdenTrabajoService;

@RestController
@RequestMapping("/api/v1/ordenes-trabajo")
public class OrdenTrabajoController {

    @Autowired
    private OrdenTrabajoService ordenTrabajoService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<OrdenTrabajo>>> listarOrdenesTrabajo() {
        CollectionModel<EntityModel<OrdenTrabajo>> coleccion = CollectionModel.of(
                toModelList(ordenTrabajoService.listarOrdenesTrabajo()),
                linkTo(methodOn(OrdenTrabajoController.class).listarOrdenesTrabajo()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<OrdenTrabajo>> obtenerPorId(@PathVariable Long id) {
        return ordenTrabajoService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefonoCliente/{telefonoCliente}")
    public ResponseEntity<CollectionModel<EntityModel<OrdenTrabajo>>> obtenerPorTelefonoCliente(@PathVariable String telefonoCliente) {
        CollectionModel<EntityModel<OrdenTrabajo>> coleccion = CollectionModel.of(
                toModelList(ordenTrabajoService.findByTelefonoCliente(telefonoCliente)),
                linkTo(methodOn(OrdenTrabajoController.class).obtenerPorTelefonoCliente(telefonoCliente)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<OrdenTrabajo>> crearOrdenTrabajo(@RequestBody OrdenTrabajo ordenTrabajo) {
        try {
            OrdenTrabajo nuevo = ordenTrabajoService.guardarOrdenTrabajo(ordenTrabajo);
            return ResponseEntity
                    .created(linkTo(methodOn(OrdenTrabajoController.class).obtenerPorId(nuevo.getIdOrdenTrabajo())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<OrdenTrabajo>> actualizarOrdenTrabajo(@PathVariable Long id, @RequestBody OrdenTrabajo ordenTrabajo) {
        try {
            OrdenTrabajo actualizado = ordenTrabajoService.actualizarOrdenTrabajo(id, ordenTrabajo);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarOrdenTrabajo(@PathVariable Long id) {
        try {
            ordenTrabajoService.eliminarOrdenTrabajo(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<OrdenTrabajo>> toModelList(List<OrdenTrabajo> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(OrdenTrabajoController.class).obtenerPorId(x.getIdOrdenTrabajo())).withSelfRel()))
                .toList();
    }

    private EntityModel<OrdenTrabajo> toModel(OrdenTrabajo ordenTrabajo) {
        return EntityModel.of(ordenTrabajo,
                linkTo(methodOn(OrdenTrabajoController.class).obtenerPorId(ordenTrabajo.getIdOrdenTrabajo())).withSelfRel(),
                linkTo(methodOn(OrdenTrabajoController.class).listarOrdenesTrabajo()).withRel("ordenesTrabajo"));
    }
}
