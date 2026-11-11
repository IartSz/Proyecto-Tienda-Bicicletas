import type { CeldaReporte, FormatoReporte, ReporteGuardado, ReporteGuardadoPayload } from '../models/Reporte';
import apiClient from './cliente';
import { obtenerLista } from './hal';

// Historial de reportes exportados en ms-reportes. Las filas viajan como JSON

interface ReporteExportadoApi {
  idReporteExportado: number;
  nombre: string;
  tipo: string;
  categoria: string | null;
  formato: FormatoReporte;
  fecha: string;
  filas: string;
}

const aReporte = (r: ReporteExportadoApi): ReporteGuardado => ({
  idReporte: r.idReporteExportado,
  nombre: r.nombre,
  tipo: r.tipo,
  categoria: r.categoria ?? '',
  formato: r.formato,
  fecha: r.fecha,
  filas: JSON.parse(r.filas) as CeldaReporte[][]
});

export const ReporteApiService = {
  async listar(): Promise<ReporteGuardado[]> {
    return (await obtenerLista<ReporteExportadoApi>('/reportes-exportados')).map(aReporte);
  },

  async crear(reporte: ReporteGuardadoPayload): Promise<ReporteGuardado> {
    const { data } = await apiClient.post<ReporteExportadoApi>('/reportes-exportados', {
      nombre: reporte.nombre,
      tipo: reporte.tipo,
      categoria: reporte.categoria || null,
      formato: reporte.formato,
      filas: JSON.stringify(reporte.filas)
    });
    return aReporte(data);
  }
};

export default ReporteApiService;
