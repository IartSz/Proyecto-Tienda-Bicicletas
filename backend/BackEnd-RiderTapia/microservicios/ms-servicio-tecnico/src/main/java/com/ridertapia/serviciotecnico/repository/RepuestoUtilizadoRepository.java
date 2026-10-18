package com.ridertapia.serviciotecnico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.serviciotecnico.model.RepuestoUtilizado;

@Repository
public interface RepuestoUtilizadoRepository extends JpaRepository<RepuestoUtilizado, Long> {

    List<RepuestoUtilizado> findByOrdenTrabajoIdOrdenTrabajo(Long idOrdenTrabajo);
}
