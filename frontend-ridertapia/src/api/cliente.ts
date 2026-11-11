import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:9000';

// Por defecto usa el backend; VITE_USAR_API=false usa localStorage
export const USAR_API = import.meta.env.VITE_USAR_API !== 'false';


// Todas las rutas que pasan por el gateway
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' }
});

export default apiClient;
