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

import com.ridertapia.serviciotecnico.model.FotoSolicitud;
import com.ridertapia.serviciotecnico.service.FotoSolicitudService;

@RestController
@RequestMapping("/api/v1/fotos-solicitud")
public class FotoSolicitudController {

    @Autowired
    private FotoSolicitudService fotoSolicitudService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<FotoSolicitud>>> listarFotosSolicitud() {
        CollectionModel<EntityModel<FotoSolicitud>> coleccion = CollectionModel.of(
                toModelList(fotoSolicitudService.listarFotosSolicitud()),
                linkTo(methodOn(FotoSolicitudController.class).listarFotosSolicitud()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<FotoSolicitud>> obtenerPorId(@PathVariable Long id) {
        return fotoSolicitudService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/solicitudServicio/{idSolicitudServicio}")
    public ResponseEntity<CollectionModel<EntityModel<FotoSolicitud>>> obtenerPorSolicitudServicio(@PathVariable Long idSolicitudServicio) {
        CollectionModel<EntityModel<FotoSolicitud>> coleccion = CollectionModel.of(
                toModelList(fotoSolicitudService.findBySolicitudServicio(idSolicitudServicio)),
                linkTo(methodOn(FotoSolicitudController.class).obtenerPorSolicitudServicio(idSolicitudServicio)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<FotoSolicitud>> crearFotoSolicitud(@RequestBody FotoSolicitud fotoSolicitud) {
        try {
            FotoSolicitud nuevo = fotoSolicitudService.guardarFotoSolicitud(fotoSolicitud);
            return ResponseEntity
                    .created(linkTo(methodOn(FotoSolicitudController.class).obtenerPorId(nuevo.getIdFotoSolicitud())).toUri())
                    .body(toModel(nuevo));
        } catch (IllegalArgumentException e) {
            // Formato o tamaño de imagen no permitido
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<FotoSolicitud>> actualizarFotoSolicitud(@PathVariable Long id, @RequestBody FotoSolicitud fotoSolicitud) {
        try {
            FotoSolicitud actualizado = fotoSolicitudService.actualizarFotoSolicitud(id, fotoSolicitud);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (IllegalArgumentException e) {
            // Formato o tamaño de imagen no permitido
            return ResponseEntity.badRequest().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarFotoSolicitud(@PathVariable Long id) {
        fotoSolicitudService.eliminarFotoSolicitud(id);
        return ResponseEntity.noContent().build();
    }

    private List<EntityModel<FotoSolicitud>> toModelList(List<FotoSolicitud> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(FotoSolicitudController.class).obtenerPorId(x.getIdFotoSolicitud())).withSelfRel()))
                .toList();
    }

    private EntityModel<FotoSolicitud> toModel(FotoSolicitud fotoSolicitud) {
        return EntityModel.of(fotoSolicitud,
                linkTo(methodOn(FotoSolicitudController.class).obtenerPorId(fotoSolicitud.getIdFotoSolicitud())).withSelfRel(),
                linkTo(methodOn(FotoSolicitudController.class).listarFotosSolicitud()).withRel("fotosSolicitud"));
    }
}
