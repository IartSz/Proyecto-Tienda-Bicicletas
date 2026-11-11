package cl.ridertapia.reportesservice.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.hateoas.server.core.Relation;

/** Reporte que el panel exporto a Excel o PDF, con sus filas para volver a descargarlo. */
@Entity
@Table(name = "reportes_exportados")
@Relation(collectionRelation = "reportesExportados", itemRelation = "reporteExportado")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteExportado {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idReporteExportado;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, length = 30)
    private String tipo;

    @Column(length = 100)
    private String categoria;

    @Column(nullable = false, length = 10)
    private String formato;

    @Column(nullable = false)
    private LocalDateTime fecha;

    // Filas en JSON (la primera es el encabezado)
    @Lob
    @Column(nullable = false)
    private String filas;
}
