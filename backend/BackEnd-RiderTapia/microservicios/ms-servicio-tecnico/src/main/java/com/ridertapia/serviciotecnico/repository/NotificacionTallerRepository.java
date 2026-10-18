package com.ridertapia.serviciotecnico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.serviciotecnico.model.NotificacionTaller;

@Repository
public interface NotificacionTallerRepository extends JpaRepository<NotificacionTaller, Long> {

    List<NotificacionTaller> findByOrdenTrabajoIdOrdenTrabajo(Long idOrdenTrabajo);
}
