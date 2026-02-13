
export interface KPIData {
  label: string;
  value: string;
  unit: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  subtitle: string;
}

export interface ActivityLog {
  id: string;
  type: 'login' | 'report' | 'update' | 'security';
  title: string;
  timestamp: string;
  icon: string;
}

export interface ReportRecord {
  id: string;
  date: string;
  origin: string;
  emissions: number;
  capture: number;
  status: 'VALIDADO' | 'EN REVISIÓN';
}
