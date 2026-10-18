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

import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.service.TipoServicioService;

@RestController
@RequestMapping("/api/v1/tipos-servicio")
public class TipoServicioController {

    @Autowired
    private TipoServicioService tipoServicioService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<TipoServicio>>> listarTiposServicio() {
        CollectionModel<EntityModel<TipoServicio>> coleccion = CollectionModel.of(
                toModelList(tipoServicioService.listarTiposServicio()),
                linkTo(methodOn(TipoServicioController.class).listarTiposServicio()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<TipoServicio>> obtenerPorId(@PathVariable Long id) {
        return tipoServicioService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/nivel/{nivel}")
    public ResponseEntity<CollectionModel<EntityModel<TipoServicio>>> obtenerPorNivel(@PathVariable NivelServicio nivel) {
        CollectionModel<EntityModel<TipoServicio>> coleccion = CollectionModel.of(
                toModelList(tipoServicioService.findByNivel(nivel)),
                linkTo(methodOn(TipoServicioController.class).obtenerPorNivel(nivel)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<TipoServicio>> crearTipoServicio(@RequestBody TipoServicio tipoServicio) {
        try {
            TipoServicio nuevo = tipoServicioService.guardarTipoServicio(tipoServicio);
            return ResponseEntity
                    .created(linkTo(methodOn(TipoServicioController.class).obtenerPorId(nuevo.getIdTipoServicio())).toUri())
                    .body(toModel(nuevo));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<TipoServicio>> actualizarTipoServicio(@PathVariable Long id, @RequestBody TipoServicio tipoServicio) {
        try {
            TipoServicio actualizado = tipoServicioService.actualizarTipoServicio(id, tipoServicio);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (DataIntegrityViolationException e) {
            // Valor único repetido
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTipoServicio(@PathVariable Long id) {
        try {
            tipoServicioService.eliminarTipoServicio(id);
            return ResponseEntity.noContent().build();
        } catch (DataIntegrityViolationException e) {
            // Está siendo usado por otro registro
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private List<EntityModel<TipoServicio>> toModelList(List<TipoServicio> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(TipoServicioController.class).obtenerPorId(x.getIdTipoServicio())).withSelfRel()))
                .toList();
    }

    private EntityModel<TipoServicio> toModel(TipoServicio tipoServicio) {
        return EntityModel.of(tipoServicio,
                linkTo(methodOn(TipoServicioController.class).obtenerPorId(tipoServicio.getIdTipoServicio())).withSelfRel(),
                linkTo(methodOn(TipoServicioController.class).listarTiposServicio()).withRel("tiposServicio"));
    }
}
