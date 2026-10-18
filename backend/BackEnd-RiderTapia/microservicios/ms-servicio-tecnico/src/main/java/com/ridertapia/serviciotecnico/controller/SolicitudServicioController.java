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

import com.ridertapia.serviciotecnico.model.SolicitudServicio;
import com.ridertapia.serviciotecnico.service.SolicitudServicioService;

@RestController
@RequestMapping("/api/v1/solicitudes-servicio")
public class SolicitudServicioController {

    @Autowired
    private SolicitudServicioService solicitudServicioService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<SolicitudServicio>>> listarSolicitudesServicio() {
        CollectionModel<EntityModel<SolicitudServicio>> coleccion = CollectionModel.of(
                toModelList(solicitudServicioService.listarSolicitudesServicio()),
                linkTo(methodOn(SolicitudServicioController.class).listarSolicitudesServicio()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<SolicitudServicio>> obtenerPorId(@PathVariable Long id) {
        return solicitudServicioService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/telefonoContacto/{telefonoContacto}")
    public ResponseEntity<CollectionModel<EntityModel<SolicitudServicio>>> obtenerPorTelefonoContacto(@PathVariable String telefonoContacto) {
        CollectionModel<EntityModel<SolicitudServicio>> coleccion = CollectionModel.of(
                toModelList(solicitudServicioService.findByTelefonoContacto(telefonoContacto)),
                linkTo(methodOn(SolicitudServicioController.class).obtenerPorTelefonoContacto(telefonoContacto)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<SolicitudServicio>> crearSolicitudServicio(@RequestBody SolicitudServicio solicitudServicio) {
        try {
            SolicitudServicio nuevo = solicitudServicioService.guardarSolicitudServicio(solicitudServicio);
            return ResponseEntity
                    .created(linkTo(methodOn(SolicitudServicioController.class).obtenerPorId(nuevo.getIdSolicitudServicio())).toUri())
                    .body(toModel(nuevo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<SolicitudServicio>> actualizarSolicitudServicio(@PathVariable Long id, @RequestBody SolicitudServicio solicitudServicio) {
        try {
            SolicitudServicio actualizado = solicitudServicioService.actualizarSolicitudServicio(id, solicitudServicio);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarSolicitudServicio(@PathVariable Long id) {
        try {
            solicitudServicioService.eliminarSolicitudServicio(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<SolicitudServicio>> toModelList(List<SolicitudServicio> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(SolicitudServicioController.class).obtenerPorId(x.getIdSolicitudServicio())).withSelfRel()))
                .toList();
    }

    private EntityModel<SolicitudServicio> toModel(SolicitudServicio solicitudServicio) {
        return EntityModel.of(solicitudServicio,
                linkTo(methodOn(SolicitudServicioController.class).obtenerPorId(solicitudServicio.getIdSolicitudServicio())).withSelfRel(),
                linkTo(methodOn(SolicitudServicioController.class).listarSolicitudesServicio()).withRel("solicitudesServicio"));
    }
}
