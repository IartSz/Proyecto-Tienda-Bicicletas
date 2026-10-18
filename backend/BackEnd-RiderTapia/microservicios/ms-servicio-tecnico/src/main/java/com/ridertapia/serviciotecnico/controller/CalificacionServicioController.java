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

import com.ridertapia.serviciotecnico.model.CalificacionServicio;
import com.ridertapia.serviciotecnico.service.CalificacionServicioService;

@RestController
@RequestMapping("/api/v1/calificaciones-servicio")
public class CalificacionServicioController {

    @Autowired
    private CalificacionServicioService calificacionServicioService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<CalificacionServicio>>> listarCalificacionesServicio() {
        CollectionModel<EntityModel<CalificacionServicio>> coleccion = CollectionModel.of(
                toModelList(calificacionServicioService.listarCalificacionesServicio()),
                linkTo(methodOn(CalificacionServicioController.class).listarCalificacionesServicio()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<CalificacionServicio>> obtenerPorId(@PathVariable Long id) {
        return calificacionServicioService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenTrabajo/{idOrdenTrabajo}")
    public ResponseEntity<CollectionModel<EntityModel<CalificacionServicio>>> obtenerPorOrdenTrabajo(@PathVariable Long idOrdenTrabajo) {
        CollectionModel<EntityModel<CalificacionServicio>> coleccion = CollectionModel.of(
                toModelList(calificacionServicioService.findByOrdenTrabajo(idOrdenTrabajo)),
                linkTo(methodOn(CalificacionServicioController.class).obtenerPorOrdenTrabajo(idOrdenTrabajo)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<CalificacionServicio>> crearCalificacionServicio(@RequestBody CalificacionServicio calificacionServicio) {
        try {
            CalificacionServicio nuevo = calificacionServicioService.guardarCalificacionServicio(calificacionServicio);
            return ResponseEntity
                    .created(linkTo(methodOn(CalificacionServicioController.class).obtenerPorId(nuevo.getIdCalificacionServicio())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalStateException e) {
            // Servicio no entregado o ya calificado
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Puntuación fuera de rango
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<CalificacionServicio>> actualizarCalificacionServicio(@PathVariable Long id, @RequestBody CalificacionServicio calificacionServicio) {
        try {
            CalificacionServicio actualizado = calificacionServicioService.actualizarCalificacionServicio(id, calificacionServicio);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalStateException e) {
            // Servicio no entregado o ya calificado
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (IllegalArgumentException e) {
            // Puntuación fuera de rango
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCalificacionServicio(@PathVariable Long id) {
        calificacionServicioService.eliminarCalificacionServicio(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<CalificacionServicio>> toModelList(List<CalificacionServicio> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(CalificacionServicioController.class).obtenerPorId(x.getIdCalificacionServicio())).withSelfRel()))
                .toList();
    }

    private EntityModel<CalificacionServicio> toModel(CalificacionServicio calificacionServicio) {
        return EntityModel.of(calificacionServicio,
                linkTo(methodOn(CalificacionServicioController.class).obtenerPorId(calificacionServicio.getIdCalificacionServicio())).withSelfRel(),
                linkTo(methodOn(CalificacionServicioController.class).listarCalificacionesServicio()).withRel("calificacionesServicio"));
    }
}
