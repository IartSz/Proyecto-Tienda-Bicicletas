import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router';
import useCategorias from '../../hooks/useCategorias';
import useProductos from '../../hooks/useProductos';
import useAviso from '../../hooks/useAviso';
import useModal from '../../hooks/useModal';
import CategoriaService, { slugLibre } from '../../services/categoria.service';
import type { Categoria } from '../../models/Categoria';
import { categoriasConProductos } from '../../data/categorias';
import { slugify } from '../../utils/formato';

const ICONOS: { valor: string; texto: string }[] = [
  { valor: 'bi-tag', texto: 'Etiqueta' },
  { valor: 'bi-bicycle', texto: 'Bicicleta' },
  { valor: 'bi-gear', texto: 'Engranaje' },
  { valor: 'bi-tools', texto: 'Herramientas' },
  { valor: 'bi-person-arms-up', texto: 'Ropa' },
  { valor: 'bi-cup-straw', texto: 'Botella' },
  { valor: 'bi-backpack2', texto: 'Mochila' },
  { valor: 'bi-lightning', texto: 'Rayo' }
];

const Categorias = () => {
  const { categorias, recargar: recargarCategorias } = useCategorias();
  const { productos, recargar: recargarProductos } = useProductos();
  const { aviso, mostrar } = useAviso();
  const modalRenombrar = useModal('modalRenombrar');
  const modalEliminar = useModal('modalEliminar');
  const [nombre, setNombre] = useState<string>('');
  const [icono, setIcono] = useState<string>('bi-tag');
  const [errorNueva, setErrorNueva] = useState<string>('');
  // Categoria que se renombra o elimina
  const [actual, setActual] = useState<Categoria | null>(null);
  const [nombreEdicion, setNombreEdicion] = useState<string>('');
  const [frase, setFrase] = useState<string>('');
  const [errorEdicion, setErrorEdicion] = useState<string>('');
  const [destino, setDestino] = useState<string>('');
  const [errorDestino, setErrorDestino] = useState<string>('');

  const lista = categoriasConProductos(categorias);
  const cantidad = (c: Categoria): number => productos.filter((p) => p.categoria.idCategoria === c.idCategoria).length;
  const repetida = (texto: string, excepto?: number): boolean =>
    categorias.some((c) => c.idCategoria !== excepto && c.nombre.toLowerCase() === texto.toLowerCase());

  const handleCrear = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const limpio = nombre.trim();
    if (!limpio) return setErrorNueva('Ingresa un nombre.');
    if (repetida(limpio)) return setErrorNueva('Ya existe esa categoría.');
    try {
      await CategoriaService.crear({
        nombre: limpio,
        descripcion: '',
        activa: true,
        categoriaPadre: null,
        slug: slugLibre(slugify(limpio), categorias),
        icono
      });
      setNombre('');
      setErrorNueva('');
      mostrar({ texto: `Categoría ${limpio} creada. Ya puedes asignarle productos.`, tipo: 'success' });
      await recargarCategorias();
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudo crear la categoría.', tipo: 'danger' });
    }
  };

  const abrirRenombrar = (categoria: Categoria) => {
    setActual(categoria);
    setNombreEdicion(categoria.nombre);
    setFrase(categoria.descripcion ?? '');
    setErrorEdicion('');
    modalRenombrar.mostrar();
  };

  const handleRenombrar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actual) return;
    const limpio = nombreEdicion.trim();
    if (!limpio) return setErrorEdicion('Ingresa un nombre.');
    if (repetida(limpio, actual.idCategoria)) return setErrorEdicion('Ya existe esa categoría.');
    try {
      await CategoriaService.actualizar(actual.idCategoria, { ...actual, nombre: limpio, descripcion: frase.trim() });
      modalRenombrar.ocultar();
      mostrar({ texto: 'Categoría actualizada. El nuevo nombre ya se ve en la tienda.', tipo: 'success' });
      await Promise.all([recargarCategorias(), recargarProductos()]);
    } catch (err) {
      console.error(err);
      mostrar({ texto: 'No se pudo actualizar la categoría.', tipo: 'danger' });
    }
  };

  const abrirEliminar = (categoria: Categoria) => {
    setActual(categoria);
    setDestino('');
    setErrorDestino('');
    modalEliminar.mostrar();
  };

  const handleEliminar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!actual) return;
    const productosActual = cantidad(actual);
    if (productosActual > 0 && !destino) return setErrorDestino('Elige la categoría de destino.');
    try {
      await CategoriaService.eliminar(actual.idCategoria, destino ? Number(destino) : undefined);
      modalEliminar.ocultar();
      const nombreDestino = lista.find((c) => String(c.idCategoria) === destino)?.nombre;
      mostrar({
        texto: productosActual > 0
          ? `Productos movidos a ${nombreDestino ?? 'la categoría elegida'} y categoría ${actual.nombre} eliminada.`
          : `Categoría ${actual.nombre} eliminada.`,
        tipo: 'warning'
      });
      await Promise.all([recargarCategorias(), recargarProductos()]);
    } catch (err) {
      console.error(err);
      mostrar({ texto: err instanceof Error ? err.message : 'No se pudo eliminar la categoría.', tipo: 'danger' });
    }
  };

  const cantidadActual = actual ? cantidad(actual) : 0;

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="panel">
            <h2 className="mb-3">Nueva categoría</h2>
            <form noValidate onSubmit={(event) => void handleCrear(event)} aria-label="Nueva categoría">
              <label className="form-label" htmlFor="catNombre">Nombre</label>
              <input id="catNombre" type="text" className={errorNueva ? 'form-control is-invalid' : 'form-control'} maxLength={40} value={nombre} onChange={(e: ChangeEvent<HTMLInputElement>) => { setNombre(e.target.value); setErrorNueva(''); }} />
              <div className="invalid-feedback">{errorNueva}</div>
              <label className="form-label mt-3" htmlFor="catIcono">Ícono</label>
              <select id="catIcono" className="form-select" value={icono} onChange={(e) => setIcono(e.target.value)}>
                {ICONOS.map((i) => <option key={i.valor} value={i.valor}>{i.texto}</option>)}
              </select>
              <button className="btn btn-brand mt-3" type="submit"><i className="bi bi-plus-lg me-1"></i>Crear categoría</button>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="panel panel-flush">
            <div className="table-responsive">
              <table className="table adm-table">
                <thead>
                  <tr><th>Categoría</th><th className="num">Productos</th><th>Página en la tienda</th><th className="text-end">Acciones</th></tr>
                </thead>
                <tbody>
                  {lista.map((c) => (
                    <tr key={c.idCategoria}>
                      <td><i className={`bi ${c.icono ?? 'bi-tag'} me-2`}></i><strong>{c.nombre}</strong></td>
                      <td className="num">{cantidad(c)}</td>
                      <td><Link to={`/categoria/${c.slug ?? ''}`} target="_blank" className="small">/categoria/{c.slug} <i className="bi bi-box-arrow-up-right"></i></Link></td>
                      <td>
                        <div className="actions">
                          <button className="btn-icon" type="button" title="Renombrar" aria-label={`Renombrar ${c.nombre}`} onClick={() => abrirRenombrar(c)}><i className="bi bi-pencil"></i></button>
                          <button className="btn-icon danger" type="button" title="Eliminar" aria-label={`Eliminar ${c.nombre}`} onClick={() => abrirEliminar(c)}><i className="bi bi-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="table-foot">Una categoría con productos no se puede eliminar hasta reasignarlos a otra. Las categorías nuevas tienen su página en la tienda, pero para que aparezcan en el menú superior hay que agregar el enlace en el Navbar.</p>
        </div>
      </div>

      {/* Renombrar */}
      <div className="modal fade" id="modalRenombrar" tabIndex={-1} aria-labelledby="modalCategoriaTitulo" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" noValidate onSubmit={(event) => void handleRenombrar(event)}>
            <div className="modal-header">
              <h2 className="modal-title" id="modalCategoriaTitulo">Renombrar categoría</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              <label className="form-label" htmlFor="ecNombre">Nombre</label>
              <input id="ecNombre" className={errorEdicion ? 'form-control is-invalid' : 'form-control'} maxLength={40} value={nombreEdicion} onChange={(e) => { setNombreEdicion(e.target.value); setErrorEdicion(''); }} />
              <div className="invalid-feedback">{errorEdicion}</div>
              <label className="form-label mt-3" htmlFor="ecSub">Frase de la página</label>
              <input id="ecSub" className="form-control" maxLength={80} placeholder="Ej: Protección para ciudad, trail y enduro." value={frase} onChange={(e) => setFrase(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-brand">Guardar</button>
            </div>
          </form>
        </div>
      </div>

      {/* Eliminar (con o sin productos) */}
      <div className="modal fade" id="modalEliminar" tabIndex={-1} aria-labelledby="modalEliminarTitulo" aria-hidden="true">
        <div className="modal-dialog">
          <form className="modal-content" noValidate onSubmit={(event) => void handleEliminar(event)}>
            <div className="modal-header">
              <h2 className="modal-title" id="modalEliminarTitulo">Eliminar categoría</h2>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {cantidadActual === 0 ? (
                <p className="m-0">¿Eliminar la categoría <strong>{actual?.nombre}</strong>? No tiene productos asociados.</p>
              ) : (
                <>
                  <p><strong>{actual?.nombre}</strong> tiene {cantidadActual} productos. Elige a qué categoría moverlos antes de eliminarla.</p>
                  <label className="form-label" htmlFor="raDestino">Mover los productos a</label>
                  <select id="raDestino" className={errorDestino ? 'form-select is-invalid' : 'form-select'} value={destino} onChange={(e) => { setDestino(e.target.value); setErrorDestino(''); }}>
                    <option value="">Elige la categoría de destino</option>
                    {lista.filter((c) => c.idCategoria !== actual?.idCategoria).map((c) => <option key={c.idCategoria} value={c.idCategoria}>{c.nombre}</option>)}
                  </select>
                  <div className="invalid-feedback">{errorDestino}</div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-light" data-bs-dismiss="modal">Cancelar</button>
              <button type="submit" className="btn btn-danger">{cantidadActual === 0 ? 'Eliminar' : 'Reasignar y eliminar'}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Categorias;
