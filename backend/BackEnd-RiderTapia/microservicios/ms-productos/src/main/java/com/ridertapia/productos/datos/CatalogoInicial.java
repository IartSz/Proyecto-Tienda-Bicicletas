package com.ridertapia.productos.datos;

import java.util.List;

// Estructura de resources/datos/catalogo-inicial.json
// "clave" es un id propio del archivo; la BD genera los ids reales
public record CatalogoInicial(
        List<CategoriaInicial> categorias,
        List<MarcaInicial> marcas,
        List<ProductoInicial> productos) {

    public record CategoriaInicial(Integer clave, String nombre, String descripcion, Boolean activa, Integer padre) {
    }

    public record MarcaInicial(Integer clave, String nombre, Boolean activa) {
    }

    public record EspecificacionInicial(String nombre, String valor) {
    }

    public record VarianteInicial(String sku, String talla, String color) {
    }

    public record ProductoInicial(
            String nombre,
            String descripcion,
            Integer precioNormal,
            String estado,
            Boolean destacado,
            Integer ordenDestacado,
            Integer limitePorCompra,
            String fechaCreacion,
            Integer categoria,
            Integer marca,
            String imagen,
            Integer precioOferta,
            List<EspecificacionInicial> especificaciones,
            List<VarianteInicial> variantes) {
    }
}
