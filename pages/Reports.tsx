
import React, { useState } from 'react';
import { HistoryRecord } from '../types';

const records: HistoryRecord[] = [
  { id: '#PC-44291', date: '14 Ene, 2024', location: 'Terminal Marítimo A1', emissions: 24.5, capture: 0.0, status: 'Validated' },
  { id: '#PC-44288', date: '12 Ene, 2024', location: 'Reserva Forestal Puerto', emissions: 0.0, capture: 12.2, status: 'Validated' },
  { id: '#PC-44282', date: '10 Ene, 2024', location: 'Planta Logística Norte', emissions: 18.1, capture: 0.0, status: 'In Review' },
  { id: '#PC-44275', date: '08 Ene, 2024', location: 'Terminal Marítimo A2', emissions: 31.4, capture: 0.0, status: 'Validated' },
  { id: '#PC-44268', date: '05 Ene, 2024', location: 'Parque Solar Interno', emissions: 0.0, capture: 45.8, status: 'Validated' },
  { id: '#PC-44260', date: '02 Ene, 2024', location: 'Edificio Corporativo', emissions: 5.2, capture: 0.0, status: 'Validated' },
];

const Reports: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Validated': return 'bg-primary/10 text-primary border-primary/20';
      case 'In Review': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Reportes y Exportación</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-lg font-medium">Historial detallado de validación de huella de carbono.</p>
        </div>
        <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 no-scrollbar">
          <button className="flex items-center gap-2 px-4 md:px-6 py-3 bg-white dark:bg-slate-panel border border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm shrink-0">
            <span className="material-symbols-outlined text-lg">calendar_month</span>
            Este Mes
          </button>
          <button className="flex items-center gap-2 px-4 md:px-6 py-3 bg-primary text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all shrink-0">
            <span className="material-symbols-outlined text-lg">ios_share</span>
            Descargar PDF
          </button>
        </div>
      </header>

      {/* Summary Mini-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        {[
          { label: 'Registros Totales', val: '156', icon: 'list_alt' },
          { label: 'Captura Validada', val: '412.5 tCO₂e', icon: 'task_alt' },
          { label: 'Pendientes Revisión', val: '8', icon: 'pending_actions' },
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-panel/40 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="size-10 md:size-12 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-primary border border-slate-100 dark:border-slate-800">
              <span className="material-symbols-outlined text-xl md:text-2xl">{item.icon}</span>
            </div>
            <div>
              <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-lg md:text-xl font-black text-slate-900 dark:text-white">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-panel/40 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Table Filters */}
        <div className="p-4 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {['All', 'Validated', 'In Review'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all ${
                  filterStatus === status 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-primary/40'
                }`}
              >
                {status === 'All' ? 'Todos' : status === 'Validated' ? 'Validados' : 'En Revisión'}
              </button>
            ))}
          </div>
          <div className="relative group w-full md:w-auto">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg group-focus-within:text-primary transition-colors">search</span>
            <input 
              type="text" 
              placeholder="Buscar por ID o Ubicación..." 
              className="w-full md:w-80 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl md:rounded-2xl pl-12 pr-6 py-2.5 md:py-3 text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Responsive Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">ID Registro</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fecha</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ubicación / Terminal</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Emisiones</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Captura</th>
                <th className="px-6 md:px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Estatus</th>
                <th className="px-6 md:px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {records.filter(r => filterStatus === 'All' || r.status === filterStatus).map((record) => (
                <tr key={record.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                  <td className="px-6 md:px-8 py-5">
                    <span className="text-xs font-black text-slate-900 dark:text-white font-mono">{record.id}</span>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <span className="text-xs font-bold text-slate-500">{record.date}</span>
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-slate-300 text-lg">location_on</span>
                      <span className="text-xs md:text-sm font-bold text-slate-700 dark:text-slate-300">{record.location}</span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 text-right font-mono text-xs md:text-sm font-bold text-slate-900 dark:text-white">
                    {record.emissions > 0 ? `${record.emissions} t` : '-'}
                  </td>
                  <td className="px-6 md:px-8 py-5 text-right font-mono text-xs md:text-sm font-black text-primary">
                    {record.capture > 0 ? `${record.capture} t` : '-'}
                  </td>
                  <td className="px-6 md:px-8 py-5">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border ${getStatusColor(record.status)}`}>
                        {record.status === 'Validated' ? 'Validado' : 'Revisión'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 md:px-8 py-5 text-right">
                    <button className="size-8 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-primary transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="material-symbols-outlined text-xl">more_vert</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Info */}
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
            Mostrando <span className="text-slate-900 dark:text-white">1 - 6</span> de 156 registros
          </p>
          <div className="flex gap-2">
            <button className="size-8 md:size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary disabled:opacity-50" disabled>
              <span className="material-symbols-outlined text-xl">chevron_left</span>
            </button>
            <button className="size-8 md:size-10 rounded-xl bg-primary text-white flex items-center justify-center font-black text-xs md:text-sm shadow-lg shadow-primary/20">1</button>
            <button className="size-8 md:size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs md:text-sm hover:border-primary transition-all">2</button>
            <button className="size-8 md:size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs md:text-sm hover:border-primary transition-all">3</button>
            <button className="size-8 md:size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary">
              <span className="material-symbols-outlined text-xl">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
