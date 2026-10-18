package com.ridertapia.serviciotecnico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.serviciotecnico.model.CalificacionServicio;

@Repository
public interface CalificacionServicioRepository extends JpaRepository<CalificacionServicio, Long> {

    List<CalificacionServicio> findByOrdenTrabajoIdOrdenTrabajo(Long idOrdenTrabajo);

    boolean existsByOrdenTrabajoIdOrdenTrabajo(Long idOrdenTrabajo);
}
