package com.ridertapia.serviciotecnico.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;
import com.ridertapia.serviciotecnico.service.HistorialEstadoOrdenService;

@RestController
@RequestMapping("/api/v1/historial-estados-orden")
public class HistorialEstadoOrdenController {

    @Autowired
    private HistorialEstadoOrdenService historialEstadoOrdenService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<HistorialEstadoOrden>>> listarHistorialEstadosOrden() {
        CollectionModel<EntityModel<HistorialEstadoOrden>> coleccion = CollectionModel.of(
                toModelList(historialEstadoOrdenService.listarHistorialEstadosOrden()),
                linkTo(methodOn(HistorialEstadoOrdenController.class).listarHistorialEstadosOrden()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<HistorialEstadoOrden>> obtenerPorId(@PathVariable Long id) {
        return historialEstadoOrdenService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenTrabajo/{idOrdenTrabajo}")
    public ResponseEntity<CollectionModel<EntityModel<HistorialEstadoOrden>>> obtenerPorOrdenTrabajo(@PathVariable Long idOrdenTrabajo) {
        CollectionModel<EntityModel<HistorialEstadoOrden>> coleccion = CollectionModel.of(
                toModelList(historialEstadoOrdenService.findByOrdenTrabajo(idOrdenTrabajo)),
                linkTo(methodOn(HistorialEstadoOrdenController.class).obtenerPorOrdenTrabajo(idOrdenTrabajo)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<HistorialEstadoOrden>> crearHistorialEstadoOrden(@RequestBody HistorialEstadoOrden historialEstadoOrden) {
        try {
            HistorialEstadoOrden nuevo = historialEstadoOrdenService.guardarHistorialEstadoOrden(historialEstadoOrden);
            return ResponseEntity
                    .created(linkTo(methodOn(HistorialEstadoOrdenController.class).obtenerPorId(nuevo.getIdHistorialEstadoOrden())).toUri())
                    .body(toModel(nuevo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<HistorialEstadoOrden>> actualizarHistorialEstadoOrden(@PathVariable Long id, @RequestBody HistorialEstadoOrden historialEstadoOrden) {
        try {
            HistorialEstadoOrden actualizado = historialEstadoOrdenService.actualizarHistorialEstadoOrden(id, historialEstadoOrden);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarHistorialEstadoOrden(@PathVariable Long id) {
        historialEstadoOrdenService.eliminarHistorialEstadoOrden(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<HistorialEstadoOrden>> toModelList(List<HistorialEstadoOrden> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(HistorialEstadoOrdenController.class).obtenerPorId(x.getIdHistorialEstadoOrden())).withSelfRel()))
                .toList();
    }

    private EntityModel<HistorialEstadoOrden> toModel(HistorialEstadoOrden historialEstadoOrden) {
        return EntityModel.of(historialEstadoOrden,
                linkTo(methodOn(HistorialEstadoOrdenController.class).obtenerPorId(historialEstadoOrden.getIdHistorialEstadoOrden())).withSelfRel(),
                linkTo(methodOn(HistorialEstadoOrdenController.class).listarHistorialEstadosOrden()).withRel("historialEstadosOrden"));
    }
}
