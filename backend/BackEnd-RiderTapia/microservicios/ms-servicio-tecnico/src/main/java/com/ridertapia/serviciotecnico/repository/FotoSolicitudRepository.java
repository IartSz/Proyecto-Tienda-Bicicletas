package com.ridertapia.serviciotecnico.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.ridertapia.serviciotecnico.model.FotoSolicitud;

@Repository
public interface FotoSolicitudRepository extends JpaRepository<FotoSolicitud, Long> {

    List<FotoSolicitud> findBySolicitudServicioIdSolicitudServicio(Long idSolicitudServicio);
}
