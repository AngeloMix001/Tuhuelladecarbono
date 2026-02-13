
export type Page = 'dashboard' | 'data-entry' | 'reports' | 'history' | 'config' | 'info' | 'profile' | 'vetiver';

export interface KPI {
  label: string;
  value: string;
  unit?: string;
  trend?: string;
  trendUp?: boolean;
  icon: string;
  description: string;
  color?: string;
  tag?: string;
}

export interface HistoryRecord {
  id: string;
  date: string;
  location: string;
  emissions: number;
  capture: number;
  status: 'Validated' | 'In Review' | 'Cancelled';
}

export interface OperationData {
  date: string;
  trucks: number;
  containers: number;
  electricity: number;
  diesel: number;
}
