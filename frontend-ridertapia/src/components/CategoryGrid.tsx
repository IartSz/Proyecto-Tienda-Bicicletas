import { Link } from 'react-router';

export interface ItemCategoria {
  titulo: string;
  ruta: string;
  icono?: string;
  fondo?: string;
}

interface CategoryGridProps {
  items: ItemCategoria[];
  variante?: 'tarjetas' | 'botones';
}

const CategoryGrid = ({ items, variante = 'tarjetas' }: CategoryGridProps) => {
  // Botones de subcategoria
  if (variante === 'botones') {
    return (
      <div className="d-flex flex-wrap gap-2">
        {items.map((item) => (
          <Link key={item.ruta} to={item.ruta} className="btn btn-outline-light btn-sm">{item.titulo}</Link>
        ))}
      </div>
    );
  }

  return (
    <div className="row g-3">
      {items.map((item) => (
        <div className="col-6 col-md-3" key={item.ruta}>
          <Link to={item.ruta} className="cat-card d-block" style={{ background: item.fondo ?? 'linear-gradient(135deg,#333,#666)' }}>
            <i className={`bi ${item.icono ?? 'bi-grid'}`}></i>
            <span>{item.titulo}</span>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default CategoryGrid;
