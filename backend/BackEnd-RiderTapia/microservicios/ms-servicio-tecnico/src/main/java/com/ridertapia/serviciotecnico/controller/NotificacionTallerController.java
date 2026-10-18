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

import com.ridertapia.serviciotecnico.model.NotificacionTaller;
import com.ridertapia.serviciotecnico.service.NotificacionTallerService;

@RestController
@RequestMapping("/api/v1/notificaciones-taller")
public class NotificacionTallerController {

    @Autowired
    private NotificacionTallerService notificacionTallerService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<NotificacionTaller>>> listarNotificacionesTaller() {
        CollectionModel<EntityModel<NotificacionTaller>> coleccion = CollectionModel.of(
                toModelList(notificacionTallerService.listarNotificacionesTaller()),
                linkTo(methodOn(NotificacionTallerController.class).listarNotificacionesTaller()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<NotificacionTaller>> obtenerPorId(@PathVariable Long id) {
        return notificacionTallerService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/ordenTrabajo/{idOrdenTrabajo}")
    public ResponseEntity<CollectionModel<EntityModel<NotificacionTaller>>> obtenerPorOrdenTrabajo(@PathVariable Long idOrdenTrabajo) {
        CollectionModel<EntityModel<NotificacionTaller>> coleccion = CollectionModel.of(
                toModelList(notificacionTallerService.findByOrdenTrabajo(idOrdenTrabajo)),
                linkTo(methodOn(NotificacionTallerController.class).obtenerPorOrdenTrabajo(idOrdenTrabajo)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<NotificacionTaller>> crearNotificacionTaller(@RequestBody NotificacionTaller notificacionTaller) {
        try {
            NotificacionTaller nuevo = notificacionTallerService.guardarNotificacionTaller(notificacionTaller);
            return ResponseEntity
                    .created(linkTo(methodOn(NotificacionTallerController.class).obtenerPorId(nuevo.getIdNotificacionTaller())).toUri())
                    .body(toModel(nuevo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<NotificacionTaller>> actualizarNotificacionTaller(@PathVariable Long id, @RequestBody NotificacionTaller notificacionTaller) {
        try {
            NotificacionTaller actualizado = notificacionTallerService.actualizarNotificacionTaller(id, notificacionTaller);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarNotificacionTaller(@PathVariable Long id) {
        notificacionTallerService.eliminarNotificacionTaller(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<NotificacionTaller>> toModelList(List<NotificacionTaller> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(NotificacionTallerController.class).obtenerPorId(x.getIdNotificacionTaller())).withSelfRel()))
                .toList();
    }

    private EntityModel<NotificacionTaller> toModel(NotificacionTaller notificacionTaller) {
        return EntityModel.of(notificacionTaller,
                linkTo(methodOn(NotificacionTallerController.class).obtenerPorId(notificacionTaller.getIdNotificacionTaller())).withSelfRel(),
                linkTo(methodOn(NotificacionTallerController.class).listarNotificacionesTaller()).withRel("notificacionesTaller"));
    }
}
