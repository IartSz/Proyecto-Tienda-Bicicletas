import { useEffect } from 'react';
import { Link, useParams } from 'react-router';
import NotFound from './NotFound';

type TipoPolitica = 'privacidad' | 'terminos' | 'reembolso' | 'retiro' | 'contacto';

interface ContenidoPolitica {
  titulo: string;
  subtitulo: string;
}

const POLITICAS: Record<TipoPolitica, ContenidoPolitica> = {
  privacidad: { titulo: 'Política de privacidad', subtitulo: 'TUS DATOS, PROTEGIDOS' },
  terminos: { titulo: 'Términos del servicio', subtitulo: 'CONDICIONES DE USO' },
  reembolso: { titulo: 'Política de reembolso', subtitulo: 'CAMBIOS Y DEVOLUCIONES' },
  retiro: { titulo: 'Retiro en tienda', subtitulo: 'CÓMO RECIBIR TU PEDIDO' },
  contacto: { titulo: 'Información de contacto', subtitulo: 'ESTAMOS PARA AYUDARTE' }
};

const esTipo = (valor: string | undefined): valor is TipoPolitica =>
  valor !== undefined && Object.prototype.hasOwnProperty.call(POLITICAS, valor);

// Texto de relleno de las politicas, igual que en el sitio original
const TEXTO_EJEMPLO: string[] = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque mattis hendrerit nulla, at pretium lacus hendrerit fermentum. Aliquam id est urna. Phasellus sit amet condimentum dolor, semper varius lectus. Sed egestas felis facilisis dolor scelerisque, ut tristique massa tristique. Nunc a imperdiet leo. Proin sed mattis odio. Sed eleifend vestibulum posuere. Morbi condimentum arcu nibh, rutrum ultricies erat auctor vel. Quisque ligula quam, mollis eu nunc ac, sodales tincidunt enim.',
  'Donec non diam lobortis, pulvinar tortor eu, feugiat mauris. Integer justo mi, scelerisque cursus metus nec, pulvinar convallis purus. Ut lacus nunc, pharetra a tellus a, facilisis elementum velit. Vivamus aliquet vel dui et porttitor. Phasellus ac sagittis tellus. Nulla placerat enim ut lacus elementum, molestie cursus massa interdum. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.',
  'Aliquam sollicitudin non nisi sit amet convallis. Nam vel nibh lectus. Vivamus quis lectus mollis, vulputate nulla ut, dapibus erat. Curabitur dignissim leo in felis gravida, quis interdum urna tristique. Duis quam eros, porttitor sit amet arcu non, tempus ornare libero. In hac habitasse platea dictumst. Aliquam ultrices nulla nec semper ullamcorper.',
  'Praesent consectetur orci molestie ex bibendum tempor. Phasellus pulvinar a dui ut viverra. Vivamus rutrum nisi posuere, tempus mi eu, rutrum elit. Sed ac commodo orci, rhoncus faucibus justo. Fusce velit urna, porta id dolor eu, volutpat consectetur dui. Nam ut justo metus. Nulla enim ante, imperdiet scelerisque gravida non, dignissim sit amet arcu.',
  'Cras tristique non tortor vel congue. Phasellus sed sem suscipit, elementum quam nec, imperdiet metus. Proin eget eleifend risus. Nam lobortis vestibulum erat, ut elementum leo scelerisque et. Maecenas bibendum bibendum faucibus. Aliquam a est imperdiet, efficitur lectus id, dignissim orci. Sed efficitur felis eget augue ultrices, at blandit arcu dapibus.'
];

const Contacto = () => (
  <>
    <div className="row g-3 mb-4">
      <div className="col-md-4"><div className="p-3 bg-light rounded h-100"><i className="bi bi-geo-alt fs-4 d-block mb-2"></i><strong>Dirección</strong><br />Centro, Concepción</div></div>
      <div className="col-md-4"><div className="p-3 bg-light rounded h-100"><i className="bi bi-clock fs-4 d-block mb-2"></i><strong>Horario</strong><br />Lunes a domingo, 10:30 a 19:30 hrs</div></div>
      <div className="col-md-4">
        <div className="p-3 bg-light rounded h-100">
          <i className="bi bi-whatsapp fs-4 d-block mb-2"></i><strong>WhatsApp</strong><br />
          <a href="#" className="btn btn-whatsapp btn-sm mt-2"><i className="bi bi-whatsapp me-2"></i>Enviar Mensaje</a>
        </div>
      </div>
    </div>
    <h4 className="fw-bold mt-2 mb-3">Sobre el proyecto</h4>
    <p><strong>Rider Tapia</strong> es un proyecto de tienda de bicicletas online: una página donde puedes ver productos, armar tu carrito y hacer una compra de prueba, con su propio panel de administración para manejar el stock, los pedidos y los clientes.</p>
    <p>El nombre viene de <strong>Pepe Tapia</strong>, un meme muy particular. En el video sale un niño andando en bicicleta que quiere hacer un truco, pero le sale mal y termina en el suelo. Su amigo, que lo estaba grabando, no aguanta y se larga a reír. Esa mezcla del intento con toda la confianza, la caída y la risa de fondo es lo que lo hace tan chistoso.</p>
    <div className="ratio ratio-16x9 rounded overflow-hidden my-4">
      <iframe
        src="https://www.youtube.com/embed/K_VehQ05AtA"
        title="Meme de Pepe Tapia"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      ></iframe>
    </div>
    <p className="small text-muted">¿No se ve el video? <a href="https://www.youtube.com/watch?v=K_VehQ05AtA" target="_blank" rel="noopener noreferrer">Míralo en YouTube</a>.</p>
    <p>Nos gustó la idea de usarlo como inspiración porque representa algo que todos los que andan en bici conocen: nadie aprende sin caerse alguna vez. Por eso la tienda tiene de todo para que te equipes bien, desde cascos y rodilleras hasta repuestos y mantenciones, y así tus trucos terminen mejor que el de Pepe.</p>
    <p className="text-muted small">Las compras de esta página son simuladas: no se hacen cobros reales ni se envían productos.</p>
  </>
);

// Una sola pagina para las 5 politicas: /politicas/:tipo
const Politica = () => {
  const { tipo } = useParams<{ tipo: string }>();
  const politica = esTipo(tipo) ? POLITICAS[tipo] : undefined;

  useEffect(() => {
    if (politica) document.title = `${politica.titulo} - Rider Tapia`;
  }, [politica]);

  if (!esTipo(tipo) || !politica) return <NotFound />;

  return (
    <>
      <section className="store-section py-5">
        <div className="container">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-2" style={{ fontSize: '.85rem' }}>
              <li className="breadcrumb-item"><Link to="/" style={{ color: 'inherit', opacity: 0.8 }}>Inicio</Link></li>
              <li className="breadcrumb-item active" aria-current="page" style={{ color: 'inherit' }}>{politica.titulo}</li>
            </ol>
          </nav>
          <p className="subtitle mb-2" style={{ opacity: 0.8, letterSpacing: '1px', fontSize: '.85rem' }}>{politica.subtitulo}</p>
          <h2 className="mb-0">{politica.titulo}</h2>
        </div>
      </section>

      <section className="py-5">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-9" style={{ lineHeight: 1.8 }}>
              {tipo === 'contacto'
                ? <Contacto />
                : TEXTO_EJEMPLO.map((parrafo, i) => <p key={i}>{parrafo}</p>)}
              <Link to="/" className="btn btn-brand mt-3"><i className="bi bi-arrow-left me-2"></i>Volver al inicio</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Politica;
