package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.NivelServicio;
import com.ridertapia.serviciotecnico.model.TipoServicio;
import com.ridertapia.serviciotecnico.repository.TipoServicioRepository;

@Service
public class TipoServicioService {

    @Autowired
    private TipoServicioRepository tipoServicioRepository;

    public TipoServicio guardarTipoServicio(TipoServicio tipoServicio) {
        return tipoServicioRepository.save(tipoServicio);
    }

    public List<TipoServicio> listarTiposServicio() {
        return tipoServicioRepository.findAll();
    }

    public Optional<TipoServicio> findById(Long id) {
        return tipoServicioRepository.findById(id);
    }

    public List<TipoServicio> findByNivel(NivelServicio nivel) {
        return tipoServicioRepository.findByNivel(nivel);
    }

    public TipoServicio actualizarTipoServicio(Long id, TipoServicio datos) {
        TipoServicio tipoServicioActual = tipoServicioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("TipoServicio no encontrado con id: " + id));
        tipoServicioActual.setNombre(datos.getNombre());
        tipoServicioActual.setNivel(datos.getNivel());
        tipoServicioActual.setDescripcion(datos.getDescripcion());
        tipoServicioActual.setIncluye(datos.getIncluye());
        tipoServicioActual.setPrecio(datos.getPrecio());
        tipoServicioActual.setDiasEstimados(datos.getDiasEstimados());
        tipoServicioActual.setActivo(datos.getActivo());
        return tipoServicioRepository.save(tipoServicioActual);
    }

    public void eliminarTipoServicio(Long id) {
        tipoServicioRepository.deleteById(id);
    }
}
