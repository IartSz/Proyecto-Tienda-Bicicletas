package com.ridertapia.productos.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.*;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.core.io.Resource;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ridertapia.productos.model.ImagenProducto;
import com.ridertapia.productos.service.ArchivoImagenService;
import com.ridertapia.productos.service.ImagenProductoService;

@RestController
@RequestMapping("/api/v1/imagenes")
public class ImagenProductoController {

    @Autowired
    private ImagenProductoService imagenProductoService;

    @Autowired
    private ArchivoImagenService archivoImagenService;

    @GetMapping
    public ResponseEntity<CollectionModel<EntityModel<ImagenProducto>>> listarImagenesProducto() {
        CollectionModel<EntityModel<ImagenProducto>> coleccion = CollectionModel.of(
                toModelList(imagenProductoService.listarImagenesProducto()),
                linkTo(methodOn(ImagenProductoController.class).listarImagenesProducto()).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntityModel<ImagenProducto>> obtenerPorId(@PathVariable Long id) {
        return imagenProductoService.findById(id)
                .map(x -> ResponseEntity.ok(toModel(x)))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/producto/{idProducto}")
    public ResponseEntity<CollectionModel<EntityModel<ImagenProducto>>> obtenerPorProducto(@PathVariable Long idProducto) {
        CollectionModel<EntityModel<ImagenProducto>> coleccion = CollectionModel.of(
                toModelList(imagenProductoService.findByProducto(idProducto)),
                linkTo(methodOn(ImagenProductoController.class).obtenerPorProducto(idProducto)).withSelfRel());
        return ResponseEntity.ok(coleccion);
    }

    @PostMapping
    public ResponseEntity<EntityModel<ImagenProducto>> crearImagenProducto(@RequestBody ImagenProducto imagenProducto) {
        try {
            ImagenProducto nuevo = imagenProductoService.guardarImagenProducto(imagenProducto);
            return ResponseEntity
                    .created(linkTo(methodOn(ImagenProductoController.class).obtenerPorId(nuevo.getIdImagenProducto())).toUri())
                    .body(toModel(nuevo));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<EntityModel<ImagenProducto>> actualizarImagenProducto(@PathVariable Long id, @RequestBody ImagenProducto imagenProducto) {
        try {
            ImagenProducto actualizado = imagenProductoService.actualizarImagenProducto(id, imagenProducto);
            return ResponseEntity.ok(toModel(actualizado));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarImagenProducto(@PathVariable Long id) {
        imagenProductoService.eliminarImagenProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/archivos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, String>> subirArchivo(@RequestParam("archivo") MultipartFile archivo) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", archivoImagenService.guardar(archivo)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("mensaje", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.internalServerError().body(Map.of("mensaje", e.getMessage()));
        }
    }

    @GetMapping("/archivos/{nombre}")
    public ResponseEntity<Resource> obtenerArchivo(@PathVariable String nombre) {
        return archivoImagenService.cargar(nombre)
                .map(archivo -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(archivoImagenService.tipoDe(nombre)))
                        .body(archivo))
                .orElse(ResponseEntity.notFound().build());
    }

    private List<EntityModel<ImagenProducto>> toModelList(List<ImagenProducto> lista) {
        return lista.stream()
                .map(x -> EntityModel.of(x,
                        linkTo(methodOn(ImagenProductoController.class).obtenerPorId(x.getIdImagenProducto())).withSelfRel()))
                .toList();
    }

    private EntityModel<ImagenProducto> toModel(ImagenProducto imagenProducto) {
        return EntityModel.of(imagenProducto,
                linkTo(methodOn(ImagenProductoController.class).obtenerPorId(imagenProducto.getIdImagenProducto())).withSelfRel(),
                linkTo(methodOn(ImagenProductoController.class).listarImagenesProducto()).withRel("imagenes"));
    }
}
