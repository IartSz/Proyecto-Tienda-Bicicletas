package com.ridertapia.serviciotecnico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.serviciotecnico.model.HistorialEstadoOrden;

@Repository
public interface HistorialEstadoOrdenRepository extends JpaRepository<HistorialEstadoOrden, Long> {

    List<HistorialEstadoOrden> findByOrdenTrabajoIdOrdenTrabajo(Long idOrdenTrabajo);
}
