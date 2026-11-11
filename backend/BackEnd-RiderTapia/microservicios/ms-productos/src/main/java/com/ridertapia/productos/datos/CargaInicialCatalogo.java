package com.ridertapia.productos.datos;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.ridertapia.productos.model.Categoria;
import com.ridertapia.productos.model.EspecificacionTecnica;
import com.ridertapia.productos.model.EstadoPublicacion;
import com.ridertapia.productos.model.ImagenProducto;
import com.ridertapia.productos.model.Marca;
import com.ridertapia.productos.model.Oferta;
import com.ridertapia.productos.model.Producto;
import com.ridertapia.productos.model.VarianteProducto;
import com.ridertapia.productos.repository.CategoriaRepository;
import com.ridertapia.productos.repository.EspecificacionTecnicaRepository;
import com.ridertapia.productos.repository.ImagenProductoRepository;
import com.ridertapia.productos.repository.MarcaRepository;
import com.ridertapia.productos.repository.OfertaRepository;
import com.ridertapia.productos.repository.ProductoRepository;
import com.ridertapia.productos.repository.VarianteProductoRepository;

import tools.jackson.databind.ObjectMapper;

// Al arrancar, si la BD no tiene productos, carga el catálogo de la tienda.
// Si ya hay datos no hace nada, así no duplica ni pisa cambios.
// Se apaga con ridertapia.carga-inicial=false (los tests lo usan).
@Component
@ConditionalOnProperty(name = "ridertapia.carga-inicial", havingValue = "true", matchIfMissing = true)
public class CargaInicialCatalogo implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CargaInicialCatalogo.class);
    private static final String ARCHIVO = "datos/catalogo-inicial.json";

    private final ObjectMapper objectMapper;
    private final CategoriaRepository categoriaRepository;
    private final MarcaRepository marcaRepository;
    private final ProductoRepository productoRepository;
    private final ImagenProductoRepository imagenRepository;
    private final OfertaRepository ofertaRepository;
    private final EspecificacionTecnicaRepository especificacionRepository;
    private final VarianteProductoRepository varianteRepository;

    public CargaInicialCatalogo(ObjectMapper objectMapper, CategoriaRepository categoriaRepository,
            MarcaRepository marcaRepository, ProductoRepository productoRepository,
            ImagenProductoRepository imagenRepository, OfertaRepository ofertaRepository,
            EspecificacionTecnicaRepository especificacionRepository, VarianteProductoRepository varianteRepository) {
        this.objectMapper = objectMapper;
        this.categoriaRepository = categoriaRepository;
        this.marcaRepository = marcaRepository;
        this.productoRepository = productoRepository;
        this.imagenRepository = imagenRepository;
        this.ofertaRepository = ofertaRepository;
        this.especificacionRepository = especificacionRepository;
        this.varianteRepository = varianteRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (productoRepository.count() > 0 || categoriaRepository.count() > 0) {
            log.info("Catálogo inicial: la base ya tiene datos, no se carga nada.");
            return;
        }

        CatalogoInicial catalogo;
        try (InputStream entrada = new ClassPathResource(ARCHIVO).getInputStream()) {
            catalogo = objectMapper.readValue(entrada, CatalogoInicial.class);
        }

        // Categorías: primero las que no tienen padre
        Map<Integer, Categoria> categorias = new HashMap<>();
        catalogo.categorias().stream()
                .sorted(Comparator.comparing(c -> c.padre() != null))
                .forEach(c -> {
                    Categoria categoria = new Categoria();
                    categoria.setNombre(c.nombre());
                    categoria.setDescripcion(c.descripcion());
                    categoria.setActiva(c.activa());
                    categoria.setCategoriaPadre(c.padre() == null ? null : categorias.get(c.padre()));
                    categorias.put(c.clave(), categoriaRepository.save(categoria));
                });

        Map<Integer, Marca> marcas = new HashMap<>();
        catalogo.marcas().forEach(m -> {
            Marca marca = new Marca();
            marca.setNombre(m.nombre());
            marca.setActiva(m.activa());
            marcas.put(m.clave(), marcaRepository.save(marca));
        });

        LocalDate hoy = LocalDate.now();
        int variantes = 0;
        for (CatalogoInicial.ProductoInicial p : catalogo.productos()) {
            Producto producto = new Producto();
            producto.setNombre(p.nombre());
            producto.setDescripcion(p.descripcion());
            producto.setPrecioNormal(p.precioNormal());
            producto.setEstado(EstadoPublicacion.valueOf(p.estado()));
            producto.setDestacado(p.destacado());
            producto.setOrdenDestacado(p.ordenDestacado());
            producto.setLimitePorCompra(p.limitePorCompra());
            producto.setFechaCreacion(LocalDateTime.parse(p.fechaCreacion()));
            producto.setCategoria(categorias.get(p.categoria()));
            producto.setMarca(marcas.get(p.marca()));
            producto.setCompatibilidades(new ArrayList<>());
            producto = productoRepository.save(producto);

            if (p.imagen() != null) {
                ImagenProducto imagen = new ImagenProducto();
                imagen.setUrl(p.imagen());
                imagen.setOrden(1);
                imagen.setEsPrincipal(true);
                imagen.setProducto(producto);
                imagenRepository.save(imagen);
            }

            // Oferta vigente por un año desde que se carga
            if (p.precioOferta() != null) {
                Oferta oferta = new Oferta();
                oferta.setPrecioOferta(p.precioOferta());
                oferta.setFechaInicio(hoy);
                oferta.setFechaTermino(hoy.plusYears(1));
                oferta.setProducto(producto);
                ofertaRepository.save(oferta);
            }

            for (CatalogoInicial.EspecificacionInicial e : p.especificaciones()) {
                EspecificacionTecnica especificacion = new EspecificacionTecnica();
                especificacion.setNombre(e.nombre());
                especificacion.setValor(e.valor());
                especificacion.setProducto(producto);
                especificacionRepository.save(especificacion);
            }

            for (CatalogoInicial.VarianteInicial v : p.variantes()) {
                VarianteProducto variante = new VarianteProducto();
                variante.setSku(v.sku());
                variante.setTalla(v.talla());
                variante.setColor(v.color());
                variante.setProducto(producto);
                varianteRepository.save(variante);
                variantes++;
            }
        }

        log.info("Catálogo inicial cargado: {} categorías, {} marcas, {} productos, {} variantes.",
                categorias.size(), marcas.size(), catalogo.productos().size(), variantes);
    }
}
