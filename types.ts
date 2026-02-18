
export type EstadoRegistro = 'EN_VALIDACION' | 'APROBADO' | 'RECHAZADO';

export interface DatosOperativos {
  trucks: number;
  containers: number;
  electricity: number;
  diesel: number;
  fechaInicio?: string;
  fechaFin?: string;
  transportEF?: number;
}

export interface RegistroCO2 {
  id: string;
  fecha: string;
  timestamp: string;
  emisiones: number; // en toneladas tCO2e
  captura: number;   // en toneladas tCO2e
  datos: DatosOperativos;
  estado: EstadoRegistro;
  observaciones?: string;
  origen: string;
}

export interface KPIData {
  label: string;
  value: string;
  unit: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  subtitle: string;
}