import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router';
import { Carousel } from 'bootstrap';
import CategoryGrid, { type ItemCategoria } from '../components/CategoryGrid';
import ProductList from '../components/ProductList';
import useProductos from '../hooks/useProductos';

interface Slide {
    subtitulo: string;
    titulo: [string, string];
    icono: string;
    fondo: string;
    ruta: string;

}

const SLIDES: Slide[] = [
  { subtitulo: 'TODO LO QUE NECESITAS PARA TI Y TU BICI', titulo: ['¡Equípate y conquista', 'el camino!'], icono: 'bi-bicycle', fondo: 'linear-gradient(135deg,#2b2b2b,#555)', ruta: '/categoria/indumentaria' },
  { subtitulo: 'QUE LA NOCHE NO PARE LA RUTA', titulo: ['Luces para hacer', 'de día'], icono: 'bi-lightbulb', fondo: 'linear-gradient(135deg,#1a1a2e,#3a3a5c)', ruta: '/categoria/luces' },
  { subtitulo: 'COMPONENTES QUE MANTIENEN TU BICI EN MARCHA', titulo: ['¡Cambia, reemplaza', 'y sigue rodando!'], icono: 'bi-gear-wide-connected', fondo: 'linear-gradient(135deg,#26313a,#4c5c66)', ruta: '/categoria/componentes' },
  { subtitulo: 'EXTIENDE LA VIDA DE TU BICI', titulo: ['Tu bicicleta como', 'nueva ¡Siempre!'], icono: 'bi-droplet', fondo: 'linear-gradient(135deg,#20303a,#3f6b5c)', ruta: '/categoria/mantenimiento' },
  { subtitulo: 'ACCESORIOS QUE TE LLEVAN MÁS LEJOS', titulo: ['¡Poder y estilo', 'a tu bici!'], icono: 'bi-backpack2', fondo: 'linear-gradient(135deg,#3a2a1a,#6b4c2f)', ruta: '/categoria/accesorios' }
];

const CATEGORIAS_INICIO: ItemCategoria[] = [
  { titulo: 'Indumentaria', icono: 'bi-person-arms-up', fondo: 'linear-gradient(135deg,#333,#666)', ruta: '/categoria/indumentaria' },
  { titulo: 'Accesorios', icono: 'bi-backpack2', fondo: 'linear-gradient(135deg,#2c3e50,#4a6580)', ruta: '/categoria/accesorios' },
  { titulo: 'Componentes', icono: 'bi-gear-wide-connected', fondo: 'linear-gradient(135deg,#26313a,#4c5c66)', ruta: '/categoria/componentes' },
  { titulo: 'Mantenimiento', icono: 'bi-tools', fondo: 'linear-gradient(135deg,#3a2f1f,#6b5a3a)', ruta: '/categoria/mantenimiento' }
];

const Home = () => {
    const carruselRef = useRef<HTMLDivElement>(null);
    const {hash} = useLocation();
    const { productos } = useProductos();

    // Productos destacados
    const destacados = productos
        .filter((p) => p.destacado && p.estado === 'PUBLICADO')
        .sort((a, b) => (a.ordenDestacado ?? 0) - (b.ordenDestacado ?? 0));

// Activa el avance automatico del carrusel
useEffect(() => {
    if (!carruselRef.current) return;
    const carrusel = Carousel.getOrCreateInstance(carruselRef.current, { ride: 'carousel' });
    return () => carrusel.dispose();
  }, []);

// Baja a la seccion indicada en la url 
useEffect(() => {
    if (!hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
  }, [hash]);

  return (
    <>
      <div id="heroCarousel" className="carousel slide" ref={carruselRef}>
        <div className="carousel-indicators">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.ruta}
              type="button"
              data-bs-target="#heroCarousel"
              data-bs-slide-to={i}
              className={i === 0 ? 'active' : undefined}
            ></button>
          ))}
        </div>
        <div className="carousel-inner">
          {SLIDES.map((slide, i) => (
            <div key={slide.ruta} className={i === 0 ? 'carousel-item active' : 'carousel-item'}>
              <div className="hero-slide" style={{ background: slide.fondo }}>
                <i className={`bi ${slide.icono} hero-icon`}></i>
                <div className="container">
                  <p className="subtitle mb-2">{slide.subtitulo}</p>
                  <h1 className="mb-4">{slide.titulo[0]}<br />{slide.titulo[1]}</h1>
                  <Link to={slide.ruta} className="btn btn-brand">VER MÁS</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      <section className="py-5">
        <div className="container">
          <p className="section-eyebrow text-center mb-1">Explora por</p>
          <h2 className="section-title text-center mb-4">Categorías</h2>
          <CategoryGrid items={CATEGORIAS_INICIO} />
        </div>
      </section>

      <section className="store-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <h2 className="mb-3">¡Hola Rider!</h2>
              <p className="mb-4" style={{ maxWidth: '520px', opacity: 0.9 }}>
                Ven a nuestra tienda y taller, y deja tu bicicleta en manos expertas.
                📍 Centro, Concepción. Te esperamos de lunes a domingo, de 10:30 a 19:30 hrs.
              </p>
              <a href="#" className="btn btn-whatsapp"><i className="bi bi-whatsapp me-2"></i>Enviar Mensaje</a>
            </div>
            <div className="col-lg-5">
              <div className="rounded d-flex align-items-center justify-content-center" style={{ height: '280px', background: 'linear-gradient(135deg,#2a2a2a,#484848)' }}>
                <i className="bi bi-tools" style={{ fontSize: '5rem', color: 'rgba(255,255,255,.7)' }}></i>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-5 bg-light" id="destacados">
        <div className="container">
          <p className="section-eyebrow text-center mb-1">Lo más pedido</p>
          <h2 className="section-title text-center mb-4">Productos destacados</h2>
          <ProductList productos={destacados} mensajeVacio="No hay productos destacados." />
        </div>
      </section>
    </>
  );
};

export default Home;