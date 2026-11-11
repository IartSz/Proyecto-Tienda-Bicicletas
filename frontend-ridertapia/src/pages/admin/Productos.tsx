import { useEffect, useState, type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import ProductTable from '../../components/admin/ProductTable';
import useProductos from '../../hooks/useProductos';
import useCategorias from '../../hooks/useCategorias';
import ProductoService, { estadoStock, type EstadoStock } from '../../services/producto.service';
import { categoriasConProductos } from '../../data/categorias';
import type { Producto } from '../../models/Producto';

const POR_PAGINA = 10;

type FiltroEstado = 'activo' | 'baja' | '';

interface Filtros {
  buscar: string;
  categoria: string; // nombre de la categoria
  stock: EstadoStock | '';
  estado: FiltroEstado;
}

interface Aviso {
  texto: string;
  tipo: 'success' | 'warning' | 'danger';
}

const filtrosIniciales: Filtros = { buscar: '', categoria: '', stock: '', estado: 'activo' };

const Productos = () => {
  const navigate = useNavigate();
  const { productos, loading, error, recargar } = useProductos();
  const { categorias } = useCategorias();
  const CATEGORIAS = categoriasConProductos(categorias);
  const [filtros, setFiltros] = useState<Filtros>(filtrosIniciales);
  const [pagina, setPagina] = useState<number>(1);
  const [aviso, setAviso] = useState<Aviso | null>(null);

  // El aviso se oculta solo
  useEffect(() => {
    if (!aviso) return;
    const timer = window.setTimeout(() => setAviso(null), 3500);
    return () => window.clearTimeout(timer);
  }, [aviso]);

  const handleFiltro = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
    setPagina(1);
  };

  const texto = filtros.buscar.trim().toLowerCase();
  const filtrados = productos.filter((p) =>
    (!texto || [p.nombre, p.sku ?? '', p.marca.nombre].join(' ').toLowerCase().includes(texto)) &&
    (!filtros.categoria || p.categoria.nombre === filtros.categoria) &&
    (!filtros.stock || estadoStock(p) === filtros.stock) &&
    (filtros.estado === '' || (filtros.estado === 'activo' ? p.estado !== 'OCULTO' : p.estado === 'OCULTO'))
  );

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, paginas);
  const visibles = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const handleEditar = (producto: Producto) => {
    navigate(`/admin/productos/${producto.idProducto}/editar`);
  };

  // Dar de baja o reactivar
  const handleCambiarEstado = async (producto: Producto) => {
    const darDeBaja = producto.estado !== 'OCULTO';
    if (darDeBaja && !window.confirm(`¿Dar de baja "${producto.nombre}"? Ya no se mostrará en la tienda.`)) return;
    try {
      await ProductoService.actualizar(producto.idProducto, { ...producto, estado: darDeBaja ? 'OCULTO' : 'PUBLICADO' });
      setAviso(darDeBaja
        ? { texto: `${producto.nombre} dado de baja. Ya no se muestra en la tienda.`, tipo: 'warning' }
        : { texto: `${producto.nombre} reactivado.`, tipo: 'success' });
      await recargar();
    } catch (err) {
      console.error(err);
      setAviso({ texto: 'No se pudo cambiar el estado del producto.', tipo: 'danger' });
    }
  };

  // Borrado definitivo (DELETE)
  const handleEliminar = async (producto: Producto) => {
    if (!window.confirm(`¿Eliminar definitivamente "${producto.nombre}"? Esta acción no se puede deshacer.`)) return;
    try {
      await ProductoService.eliminar(producto.idProducto);
      setAviso({ texto: `${producto.nombre} eliminado.`, tipo: 'warning' });
      await recargar();
    } catch (err) {
      console.error(err);
      setAviso({ texto: 'No se pudo eliminar el producto.', tipo: 'danger' });
    }
  };

  return (
    <>
      {aviso && <div className={`alert alert-${aviso.tipo} py-2`}>{aviso.texto}</div>}

      <div className="toolbar">
        <div className="input-icon">
          <i className="bi bi-search"></i>
          <input name="buscar" type="search" className="form-control" placeholder="Buscar por nombre, código o marca" aria-label="Buscar producto" value={filtros.buscar} onChange={handleFiltro} />
        </div>
        <select name="categoria" className="form-select" aria-label="Filtrar por categoría" value={filtros.categoria} onChange={handleFiltro}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => (
            <option key={c.idCategoria} value={c.nombre}>{c.nombre}</option>
          ))}
        </select>
        <select name="stock" className="form-select" aria-label="Filtrar por stock" value={filtros.stock} onChange={handleFiltro}>
          <option value="">Todo el stock</option>
          <option value="ok">Disponible</option>
          <option value="bajo">Stock bajo</option>
          <option value="cero">Sin stock</option>
        </select>
        <select name="estado" className="form-select" aria-label="Filtrar por estado" value={filtros.estado} onChange={handleFiltro}>
          <option value="activo">Activos</option>
          <option value="baja">Dados de baja</option>
          <option value="">Todos</option>
        </select>
        <Link className="btn btn-brand ms-auto" to="/admin/productos/nuevo"><i className="bi bi-plus-lg me-1"></i>Nuevo producto</Link>
      </div>

      {error && <div className="alert alert-danger py-2">No se pudieron cargar los productos.</div>}

      <div className="panel panel-flush">
        {loading && productos.length === 0
          ? <p className="text-center text-muted py-4 mb-0">Cargando productos...</p>
          : <ProductTable productos={visibles} onEditar={handleEditar} onCambiarEstado={(p) => void handleCambiarEstado(p)} onEliminar={(p) => void handleEliminar(p)} />}
      </div>

      <div className="d-flex flex-wrap justify-content-between align-items-center mt-2">
        <p className="table-foot m-0">Mostrando {visibles.length} de {filtrados.length} productos</p>
        <nav aria-label="Paginación de productos">
          <ul className="pagination pagination-sm m-0">
            <li className={`page-item ${paginaActual === 1 ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPagina(paginaActual - 1)}>Anterior</button>
            </li>
            {Array.from({ length: paginas }, (_, i) => i + 1).map((n) => (
              <li key={n} className={`page-item ${n === paginaActual ? 'active' : ''}`}>
                <button type="button" className="page-link" onClick={() => setPagina(n)}>{n}</button>
              </li>
            ))}
            <li className={`page-item ${paginaActual === paginas ? 'disabled' : ''}`}>
              <button type="button" className="page-link" onClick={() => setPagina(paginaActual + 1)}>Siguiente</button>
            </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Productos;
