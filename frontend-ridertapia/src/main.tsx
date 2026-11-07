import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router';

// Boostrap e iconos 
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap';

// Estilos propios
import './styles/styles.css';
import './styles/admin.css';

import App from './App';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('No se encontro el elemento raiz para montar la aplicacion');
}

ReactDOM.createRoot(rootElement).render(
    <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);