package com.ridertapia.serviciotecnico.controller;

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

import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;
import com.ridertapia.serviciotecnico.service.RepuestoUtilizadoService;

@RestController
@RequestMapping("/api/v1/repuestos-utilizados")
public class RepuestoUtilizadoController {

    @Autowired
    private RepuestoUtilizadoService repuestoUtilizadoService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<RepuestoUtilizado>>> listarRepuestosUtilizados() {
        CollectionModel<EntityModel<RepuestoUtilizado>> coleccion = CollectionModel.of(
                toModelList(repuestoUtilizadoService.listarRepuestosUtilizados()),
                linkTo(methodOn(RepuestoUtilizadoController.class).listarRepuestosUtilizados()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<RepuestoUtilizado>> obtenerPorId(@PathVariable Long id) {
        return repuestoUtilizadoService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenTrabajo/{idOrdenTrabajo}")
    public ResponseEntity<CollectionModel<EntityModel<RepuestoUtilizado>>> obtenerPorOrdenTrabajo(@PathVariable Long idOrdenTrabajo) {
        CollectionModel<EntityModel<RepuestoUtilizado>> coleccion = CollectionModel.of(
                toModelList(repuestoUtilizadoService.findByOrdenTrabajo(idOrdenTrabajo)),
                linkTo(methodOn(RepuestoUtilizadoController.class).obtenerPorOrdenTrabajo(idOrdenTrabajo)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<RepuestoUtilizado>> crearRepuestoUtilizado(@RequestBody RepuestoUtilizado repuestoUtilizado) {
        try {
            RepuestoUtilizado nuevo = repuestoUtilizadoService.guardarRepuestoUtilizado(repuestoUtilizado);
            return ResponseEntity
                    .created(linkTo(methodOn(RepuestoUtilizadoController.class).obtenerPorId(nuevo.getIdRepuestoUtilizado())).toUri())
                    .body(toModel(nuevo));
        } catch (IllegalStateException e) {
            // Stock insuficiente
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Cantidad no válida
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<RepuestoUtilizado>> actualizarRepuestoUtilizado(@PathVariable Long id, @RequestBody RepuestoUtilizado repuestoUtilizado) {
        try {
            RepuestoUtilizado actualizado = repuestoUtilizadoService.actualizarRepuestoUtilizado(id, repuestoUtilizado);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (IllegalStateException e) {
            // Stock insuficiente
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Cantidad no válida
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRepuestoUtilizado(@PathVariable Long id) {
        repuestoUtilizadoService.eliminarRepuestoUtilizado(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<RepuestoUtilizado>> toModelList(List<RepuestoUtilizado> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(RepuestoUtilizadoController.class).obtenerPorId(x.getIdRepuestoUtilizado())).withSelfRel()))
                .toList();
    }

    private EntityModel<RepuestoUtilizado> toModel(RepuestoUtilizado repuestoUtilizado) {
        return EntityModel.of(repuestoUtilizado,
                linkTo(methodOn(RepuestoUtilizadoController.class).obtenerPorId(repuestoUtilizado.getIdRepuestoUtilizado())).withSelfRel(),
                linkTo(methodOn(RepuestoUtilizadoController.class).listarRepuestosUtilizados()).withRel("repuestosUtilizados"));
    }
}
