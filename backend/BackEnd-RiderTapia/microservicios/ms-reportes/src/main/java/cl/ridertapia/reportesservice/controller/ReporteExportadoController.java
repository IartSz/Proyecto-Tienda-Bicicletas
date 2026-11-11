package cl.ridertapia.reportesservice.controller;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;
import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.methodOn;

import cl.ridertapia.reportesservice.dto.ReporteExportadoRequest;
import cl.ridertapia.reportesservice.model.ReporteExportado;
import cl.ridertapia.reportesservice.service.ReporteExportadoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reportes-exportados")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Solo para desarrollo
@Tag(name = "Reportes exportados", description = "Historial de reportes descargados desde el panel")
public class ReporteExportadoController {

    private final ReporteExportadoService service;

    @Operation(summary = "Guardar un reporte exportado")
    @ApiResponse(responseCode = "201", description = "Reporte guardado")
    @ApiResponse(responseCode = "400", description = "Datos inválidos")
    @PostMapping
    public ResponseEntity<EntityModel<ReporteExportado>> guardar(@Valid @RequestBody ReporteExportadoRequest request) {
        EntityModel<ReporteExportado> modelo = toModel(service.guardar(request));
        return ResponseEntity.created(modelo.getRequiredLink("self").toUri()).body(modelo);
    }

    @Operation(summary = "Listar los reportes exportados", description = "Del más reciente al más antiguo.")
    @ApiResponse(responseCode = "200", description = "Lista de reportes")
    @GetMapping
    public CollectionModel<EntityModel<ReporteExportado>> listar() {
        return CollectionModel.of(service.listar().stream().map(this::toModel).toList(),
                linkTo(methodOn(ReporteExportadoController.class).listar()).withSelfRel());
    }

    @Operation(summary = "Obtener un reporte exportado")
    @ApiResponse(responseCode = "200", description = "Reporte encontrado")
    @ApiResponse(responseCode = "404", description = "No existe el reporte")
    @GetMapping("/{id}")
    public EntityModel<ReporteExportado> findById(@PathVariable Long id) {
        return toModel(service.findById(id));
    }

    private EntityModel<ReporteExportado> toModel(ReporteExportado reporte) {
        return EntityModel.of(reporte,
                linkTo(methodOn(ReporteExportadoController.class).findById(reporte.getIdReporteExportado())).withSelfRel(),
                linkTo(methodOn(ReporteExportadoController.class).listar()).withRel("reportesExportados"));
    }
}
