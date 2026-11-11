import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import type { Categoria } from '../../models/Categoria';
import type { EspecificacionTecnica, Marca, Producto, ProductoPayload, Variantes } from '../../models/Producto';
import ProductoService from '../../services/producto.service';
import MovimientoService from '../../services/movimiento.service';
import useCategorias from '../../hooks/useCategorias';
import { categoriasConProductos } from '../../data/categorias';
import { LIMITE_POR_COMPRA, marcas } from '../../data/productos';
import { slugify } from '../../utils/formato';

interface ProductFormProps {
  mode: 'creacion' | 'edicion';
}

type TipoVariante = '' | 'Talla' | 'Medida' | 'Color';

interface ProductFormState {
  nombre: string;
  sku: string;
  categoria: string; // nombre: los ids cambian entre local y backend
  marca: string;
  subtipo: string;
  proveedor: string;
  precio: string;
  oferta: string;
  stock: string;
  stockMinimo: string;
  descripcion: string;
  especificaciones: string;
  tipoVariante: TipoVariante;
  valores: string;
  imagen: string;
}

type Errores = Partial<Record<keyof ProductFormState, string>>;

const initialState: ProductFormState = {
  nombre: '',
  sku: '',
  categoria: '',
  marca: '',
  subtipo: '',
  proveedor: '',
  precio: '',
  oferta: '',
  stock: '',
  stockMinimo: '3',
  descripcion: '',
  especificaciones: '',
  tipoVariante: '',
  valores: '',
  imagen: ''
};

const aTipoVariante = (nombre: string): TipoVariante =>
  nombre === 'Talla' || nombre === 'Color' ? nombre : 'Medida';

// Prefijo del SKU: el que ya usa la categoria o 3 letras del nombre
const siguienteSku = (categoria: Categoria, lista: Producto[]): string => {
  const existente = lista.find((p) => p.categoria.nombre === categoria.nombre && p.sku);
  const prefijo = existente?.sku?.split('-')[0] ?? (slugify(categoria.nombre).replace(/-/g, '').slice(0, 3).toUpperCase() || 'PRD');
  let max = 0;
  lista.forEach((p) => {
    const m = (p.sku ?? '').match(new RegExp(`^${prefijo}-(\\d+)$`));
    if (m) max = Math.max(max, Number(m[1]));
  });
  return `${prefijo}-${String(max + 1).padStart(4, '0')}`;
};

// "Nombre: valor" por linea
const leerEspecificaciones = (texto: string): EspecificacionTecnica[] =>
  texto
    .split('\n')
    .map((linea) => {
      const i = linea.indexOf(':');
      return i > 0 ? { nombre: linea.slice(0, i).trim(), valor: linea.slice(i + 1).trim() } : null;
    })
    .filter((e): e is EspecificacionTecnica => e !== null && e.nombre !== '' && e.valor !== '');

// "S, M, L*" -> valores; * = agotado
const leerVariantes = (tipo: TipoVariante, texto: string, anteriores?: Variantes): Variantes | undefined => {
  if (!tipo) return undefined;
  const previos = anteriores?.valores ?? [];
  const valores = texto
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => {
      const agotado = v.endsWith('*');
      const valor = agotado ? v.slice(0, -1).trim() : v;
      return { valor, detalle: previos.find((x) => x.valor === valor)?.detalle ?? '', disponible: !agotado };
    });
  if (valores.length === 0) return undefined;
  const base = anteriores?.nombre === tipo ? anteriores : undefined;
  return {
    nombre: tipo,
    columna: base?.columna ?? (tipo === 'Talla' ? 'Circunferencia de cabeza' : 'Detalle'),
    guia: base?.guia ?? (tipo === 'Talla' ? 'Guía de tallas' : tipo === 'Color' ? 'Colores disponibles' : 'Medidas disponibles'),
    nota: base?.nota ?? '',
    valores
  };
};

// Usa la marca existente o crea una nueva
const buscarMarca = (nombre: string, lista: Producto[]): Marca => {
  const todas = [...marcas, ...lista.map((p) => p.marca)];
  const existente = todas.find((m) => m.nombre.toLowerCase() === nombre.toLowerCase());
  if (existente) return existente;
  return { idMarca: Math.max(0, ...todas.map((m) => m.idMarca)) + 1, nombre, activa: true };
};

const slugUnico = (nombre: string, lista: Producto[]): string => {
  const base = slugify(nombre);
  let slug = base;
  let n = 2;
  while (lista.some((p) => p.slug === slug)) slug = `${base}-${n++}`;
  return slug;
};

const validar = (form: ProductFormState, isEdit: boolean, lista: Producto[], idActual: number | null): Errores => {
  const errores: Errores = {};
  const sku = form.sku.trim().toUpperCase();
  const precio = Number(form.precio);
  const oferta = Number(form.oferta);

  if (!form.nombre.trim()) errores.nombre = 'Ingresa el nombre.';
  if (!sku) errores.sku = 'Ingresa un código.';
  else if (lista.some((p) => p.sku === sku && p.idProducto !== idActual)) errores.sku = 'Ese código ya existe.';
  if (!form.categoria) errores.categoria = 'Elige una categoría.';
  if (!form.marca.trim()) errores.marca = 'Ingresa la marca.';
  // El backend no guarda el proveedor: solo se exige al crear
  if (!isEdit && !form.proveedor.trim()) errores.proveedor = 'Ingresa el proveedor.';
  if (!Number.isInteger(precio) || precio <= 0) errores.precio = 'Precio mayor a 0.';
  if (form.oferta && (!Number.isInteger(oferta) || oferta <= 0 || oferta >= precio)) errores.oferta = 'Debe ser menor al precio.';
  if (!isEdit && (form.stock === '' || !Number.isInteger(Number(form.stock)) || Number(form.stock) < 0)) errores.stock = '0 o más.';
  if (form.stockMinimo === '' || !Number.isInteger(Number(form.stockMinimo)) || Number(form.stockMinimo) < 0) errores.stockMinimo = '0 o más.';
  if (form.tipoVariante && !form.valores.trim()) errores.valores = 'Ingresa al menos una opción.';
  return errores;
};

const ProductForm = ({ mode }: ProductFormProps) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { categorias } = useCategorias();
  const CATEGORIAS = categoriasConProductos(categorias);
  const [form, setForm] = useState<ProductFormState>(initialState);
  const [original, setOriginal] = useState<Producto | null>(null);
  const [existentes, setExistentes] = useState<Producto[]>([]);
  const [errores, setErrores] = useState<Errores>({});
  const [errorImagen, setErrorImagen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === 'edicion';
  const title = useMemo(() => (isEdit ? 'Editar producto' : 'Nuevo producto'), [isEdit]);

  useEffect(() => {
    const cargar = async () => {
      setLoading(true);
      try {
        const lista = await ProductoService.listar();
        setExistentes(lista);
        if (!isEdit) return;

        const numericId = Number(id);
        if (!id || Number.isNaN(numericId)) {
          setError('Identificador de producto inválido.');
          return;
        }
        const data = await ProductoService.obtener(numericId);
        setOriginal(data);
        setForm({
          nombre: data.nombre,
          sku: data.sku ?? '',
          categoria: data.categoria.nombre,
          marca: data.marca.nombre,
          subtipo: data.subtipo ?? '',
          proveedor: data.proveedor ?? '',
          precio: String(data.precioNormal),
          oferta: data.precioOferta !== undefined ? String(data.precioOferta) : '',
          stock: String(data.stockDisponible ?? 0),
          stockMinimo: String(data.stockMinimo ?? 0),
          descripcion: data.descripcion ?? '',
          especificaciones: (data.especificaciones ?? []).map((e) => `${e.nombre}: ${e.valor}`).join('\n'),
          tipoVariante: data.variantes ? aTipoVariante(data.variantes.nombre) : '',
          valores: data.variantes ? data.variantes.valores.map((v) => v.valor + (v.disponible ? '' : '*')).join(', ') : '',
          imagen: data.imagenPrincipal ?? ''
        });
      } catch (err) {
        console.error(err);
        setError('No fue posible cargar el producto.');
      } finally {
        setLoading(false);
      }
    };

    void cargar();
  }, [id, isEdit]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((prev) => {
      const siguiente: ProductFormState = { ...prev, [name]: value };
      // Sugiere el codigo al elegir categoria (solo al crear)
      if (name === 'categoria' && !isEdit) {
        const categoria = CATEGORIAS.find((c) => c.nombre === value);
        if (categoria) siguiente.sku = siguienteSku(categoria, existentes);
      }
      if (name === 'tipoVariante' && !value) siguiente.valores = '';
      return siguiente;
    });
    if (name === 'imagen') setErrorImagen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setStatus(null);

    const idActual = original?.idProducto ?? null;
    const nuevosErrores = validar(form, isEdit, existentes, idActual);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const categoria = CATEGORIAS.find((c) => c.nombre === form.categoria);
    if (!categoria) {
      setError('Elige una categoría.');
      return;
    }

    const oferta = Number(form.oferta);
    const datosProducto: ProductoPayload = {
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || null,
      precioNormal: Number(form.precio),
      estado: original?.estado ?? 'PUBLICADO',
      destacado: original?.destacado ?? false,
      ordenDestacado: original?.ordenDestacado ?? null,
      limitePorCompra: original?.limitePorCompra ?? LIMITE_POR_COMPRA,
      fechaCreacion: original?.fechaCreacion ?? new Date().toISOString(),
      categoria,
      marca: buscarMarca(form.marca.trim(), existentes),
      slug: original?.slug ?? slugUnico(form.nombre, existentes),
      subtipo: form.subtipo.trim() || categoria.nombre,
      precioOferta: form.oferta ? oferta : undefined,
      imagenPrincipal: form.imagen.trim() || undefined,
      // El stock solo se fija al crear
      stockDisponible: original ? original.stockDisponible : Number(form.stock),
      stockMinimo: Number(form.stockMinimo),
      sku: form.sku.trim().toUpperCase(),
      proveedor: form.proveedor.trim(),
      especificaciones: leerEspecificaciones(form.especificaciones),
      variantes: leerVariantes(form.tipoVariante, form.valores, original?.variantes)
    };

    setLoading(true);
    try {
      if (isEdit) {
        if (!original) {
          setError('Identificador de producto no válido.');
          return;
        }
        await ProductoService.actualizar(original.idProducto, datosProducto);
        setStatus('Producto actualizado correctamente.');
      } else {
        const creado = await ProductoService.crear(datosProducto);
        // El stock inicial queda como primer movimiento del inventario
        if ((creado.stockDisponible ?? 0) > 0) {
          await MovimientoService.registrar(creado, 'INGRESO', creado.stockDisponible ?? 0, 'admin', `Stock inicial · ${creado.proveedor ?? ''}`);
        }
        setStatus('Producto creado correctamente.');
        setForm(initialState);
      }

      window.setTimeout(() => {
        navigate('/admin/productos');
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocurrió un error al guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const clase = (campo: keyof ProductFormState, base = 'form-control'): string =>
    errores[campo] ? `${base} is-invalid` : base;

  return (
    <section className="panel">
      <p className="panel-note mb-3">Completa el formulario para {isEdit ? 'actualizar' : 'registrar'} un producto.</p>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {status && <div className="alert alert-success py-2">{status}</div>}

      <form onSubmit={(event) => void handleSubmit(event)} noValidate aria-label={title}>
        {/* Bloqueado mientras carga: el SKU sugerido necesita la lista completa */}
        <fieldset disabled={loading}>
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label" htmlFor="nombre">Nombre</label>
            <input id="nombre" name="nombre" className={clase('nombre')} maxLength={80} value={form.nombre} onChange={handleChange} />
            <div className="invalid-feedback">{errores.nombre}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="sku">Código</label>
            <input id="sku" name="sku" className={clase('sku')} maxLength={20} placeholder="Ej: CAS-0007" value={form.sku} onChange={handleChange} />
            <div className="invalid-feedback">{errores.sku}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="categoria">Categoría</label>
            <select id="categoria" name="categoria" className={clase('categoria', 'form-select')} value={form.categoria} onChange={handleChange}>
              <option value="">Elige una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.idCategoria} value={c.nombre}>{c.nombre}</option>
              ))}
            </select>
            <div className="invalid-feedback">{errores.categoria}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="marca">Marca</label>
            <input id="marca" name="marca" className={clase('marca')} maxLength={40} value={form.marca} onChange={handleChange} />
            <div className="invalid-feedback">{errores.marca}</div>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="subtipo">Tipo / uso</label>
            <input id="subtipo" name="subtipo" className="form-control" maxLength={40} placeholder="Ej: Trail / MTB" value={form.subtipo} onChange={handleChange} />
          </div>
          <div className="col-md-6">
            <label className="form-label" htmlFor="proveedor">Proveedor</label>
            <input id="proveedor" name="proveedor" className={clase('proveedor')} maxLength={60} value={form.proveedor} onChange={handleChange} />
            <div className="invalid-feedback">{errores.proveedor}</div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="precio">Precio (CLP)</label>
            <input id="precio" name="precio" type="number" min="1" step="1" className={clase('precio')} value={form.precio} onChange={handleChange} />
            <div className="invalid-feedback">{errores.precio}</div>
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="oferta">Precio oferta</label>
            <input id="oferta" name="oferta" type="number" min="1" step="1" className={clase('oferta')} placeholder="Opcional" value={form.oferta} onChange={handleChange} />
            <div className="invalid-feedback">{errores.oferta}</div>
          </div>
          {!isEdit && (
            <div className="col-6 col-md-3">
              <label className="form-label" htmlFor="stock">Stock inicial</label>
              <input id="stock" name="stock" type="number" min="0" step="1" className={clase('stock')} value={form.stock} onChange={handleChange} />
              <div className="invalid-feedback">{errores.stock}</div>
            </div>
          )}
          <div className="col-6 col-md-3">
            <label className="form-label" htmlFor="stockMinimo">Stock mínimo</label>
            <input id="stockMinimo" name="stockMinimo" type="number" min="0" step="1" className={clase('stockMinimo')} value={form.stockMinimo} onChange={handleChange} />
            <div className="invalid-feedback">{errores.stockMinimo}</div>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="descripcion">Descripción</label>
            <textarea id="descripcion" name="descripcion" className="form-control" rows={3} maxLength={600} value={form.descripcion} onChange={handleChange}></textarea>
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="especificaciones">Características</label>
            <textarea
              id="especificaciones"
              name="especificaciones"
              className="form-control"
              rows={4}
              placeholder={'Una por línea, con el formato  Nombre: valor\nPeso aprox.: 350 g'}
              value={form.especificaciones}
              onChange={handleChange}
            ></textarea>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="tipoVariante">El cliente elige</label>
            <select id="tipoVariante" name="tipoVariante" className="form-select" value={form.tipoVariante} onChange={handleChange}>
              <option value="">Nada (sin opciones)</option>
              <option value="Talla">Talla</option>
              <option value="Medida">Medida</option>
              <option value="Color">Color</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="valores">Opciones disponibles</label>
            <input
              id="valores"
              name="valores"
              className={clase('valores')}
              placeholder="Separadas por coma. Ej: S, M, L"
              value={form.valores}
              onChange={handleChange}
              disabled={!form.tipoVariante}
            />
            <div className="invalid-feedback">{errores.valores}</div>
            <div className="form-text">Puedes marcar una opción como agotada escribiendo * al final. Ej: S, M, L*</div>
          </div>
          <div className="col-md-8">
            <label className="form-label" htmlFor="imagen">Imagen</label>
            <input id="imagen" name="imagen" className="form-control" placeholder="/img/productos/cascos/mi-producto.jpg" value={form.imagen} onChange={handleChange} />
            <div className="form-text">Ruta de una imagen dentro de public/img.</div>
          </div>
          <div className="col-md-4 d-flex align-items-end">
            <div className="border rounded w-100 d-flex align-items-center justify-content-center" style={{ height: '120px', overflow: 'hidden' }}>
              {form.imagen && !errorImagen ? (
                <img src={form.imagen} alt="Vista previa" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} onError={() => setErrorImagen(true)} />
              ) : (
                <span className="text-muted small">{form.imagen ? 'No se encontró la imagen' : 'Sin imagen'}</span>
              )}
            </div>
          </div>
        </div>
        </fieldset>

        <div className="d-flex justify-content-end gap-2 mt-4">
          <Link to="/admin/productos" className="btn btn-outline-light">Cancelar</Link>
          <button type="submit" className="btn btn-brand" disabled={loading}>
            {loading ? 'Procesando...' : isEdit ? 'Actualizar' : 'Guardar producto'}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProductForm;
