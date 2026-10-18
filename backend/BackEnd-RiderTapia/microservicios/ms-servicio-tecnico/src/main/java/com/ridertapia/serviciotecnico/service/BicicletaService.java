package com.ridertapia.serviciotecnico.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ridertapia.serviciotecnico.model.Bicicleta;
import com.ridertapia.serviciotecnico.repository.BicicletaRepository;

@Service
public class BicicletaService {

    @Autowired
    private BicicletaRepository bicicletaRepository;

    public Bicicleta guardarBicicleta(Bicicleta bicicleta) {
        return bicicletaRepository.save(bicicleta);
    }

    public List<Bicicleta> listarBicicletas() {
        return bicicletaRepository.findAll();
    }

    public Optional<Bicicleta> findById(Long id) {
        return bicicletaRepository.findById(id);
    }

    public List<Bicicleta> findByRutCliente(String rutCliente) {
        return bicicletaRepository.findByRutCliente(rutCliente);
    }

    public Bicicleta actualizarBicicleta(Long id, Bicicleta datos) {
        Bicicleta bicicletaActual = bicicletaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bicicleta no encontrada con id: " + id));
        bicicletaActual.setMarca(datos.getMarca());
        bicicletaActual.setModelo(datos.getModelo());
        bicicletaActual.setTipo(datos.getTipo());
        bicicletaActual.setAro(datos.getAro());
        bicicletaActual.setColor(datos.getColor());
        bicicletaActual.setNumeroSerie(datos.getNumeroSerie());
        bicicletaActual.setRutCliente(datos.getRutCliente());
        return bicicletaRepository.save(bicicletaActual);
    }

    public void eliminarBicicleta(Long id) {
        bicicletaRepository.deleteById(id);
    }
}
