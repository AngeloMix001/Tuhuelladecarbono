
import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as ReactWindow from 'react-window';

const ReactWindowModule = ReactWindow as any;
const List = ReactWindowModule.FixedSizeList || 
             (ReactWindowModule.default && ReactWindowModule.default.FixedSizeList) || 
             ReactWindowModule.default;

const generateMockData = (count: number) => {
  const origins = [
    'Terminal Marítimo A1', 
    'Reserva Forestal Puerto', 
    'Planta Logística Norte', 
    'Terminal Marítimo A2', 
    'Parque Solar Interno'
  ];
  const statuses = ['VALIDADO', 'EN REVISIÓN'] as const;
  
  return Array.from({ length: count }, (_, i) => {
    const day = (i % 28) + 1;
    const month = (i % 12);
    const date = new Date(2026, month, day); // Actualizado a 2026
    
    return {
      id: `#PC-26-${55300 - i}`,
      dateObj: date,
      dateStr: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      origin: origins[i % origins.length],
      emissions: i % 3 === 0 ? Math.random() * 30 : 0,
      capture: i % 3 !== 0 ? Math.random() * 45 : 0,
      status: statuses[i % 2],
    };
  });
};

const COLUMN_LAYOUT = "grid grid-cols-[140px_100px_1fr_100px_100px_120px_60px]";

const ORIGIN_OPTIONS = [
  { label: 'Todas las plantas', icon: 'apps' },
  { label: 'Terminal Marítimo A1', icon: 'sailing' },
  { label: 'Reserva Forestal Puerto', icon: 'forest' },
  { label: 'Planta Logística Norte', icon: 'conveyor_belt' },
  { label: 'Terminal Marítimo A2', icon: 'dock' },
  { label: 'Parque Solar Interno', icon: 'solar_power' },
];

const Reports: React.FC = () => {
  const allData = useMemo(() => generateMockData(2000), []);
  const [isScrolled, setIsScrolled] = useState(false);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'Todos',
    origin: 'Todas las plantas',
    minEmissions: '',
    maxEmissions: '',
    minCapture: '',
    maxCapture: '',
    startDate: '',
    endDate: ''
  });

  const filteredData = useMemo(() => {
    return allData.filter(item => {
      const matchesSearch = filters.searchTerm === '' || 
        item.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'Todos' || item.status === filters.status;
      const matchesOrigin = filters.origin === 'Todas las plantas' || item.origin === filters.origin;
      
      const minE = parseFloat(filters.minEmissions) || 0;
      const maxE = parseFloat(filters.maxEmissions) || Infinity;
      const matchesEmissions = item.emissions >= minE && item.emissions <= maxE;

      const minC = parseFloat(filters.minCapture) || 0;
      const maxC = parseFloat(filters.maxCapture) || Infinity;
      const matchesCapture = item.capture >= minC && item.capture <= maxC;

      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;
      let matchesDate = true;
      if (start) matchesDate = matchesDate && item.dateObj >= start;
      if (end) matchesDate = matchesDate && item.dateObj <= end;

      return matchesSearch && matchesStatus && matchesOrigin && matchesEmissions && matchesCapture && matchesDate;
    });
  }, [allData, filters]);

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'Todos',
      origin: 'Todas las plantas',
      minEmissions: '',
      maxEmissions: '',
      minCapture: '',
      maxCapture: '',
      startDate: '',
      endDate: ''
    });
  };

  const isFiltered = useMemo(() => {
    return filters.searchTerm !== '' || 
           filters.status !== 'Todos' || 
           filters.origin !== 'Todas las plantas' ||
           filters.minEmissions !== '' ||
           filters.maxEmissions !== '' ||
           filters.minCapture !== '' ||
           filters.maxCapture !== '' ||
           filters.startDate !== '' ||
           filters.endDate !== '';
  }, [filters]);

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = filteredData[index];
    if (!row) return null;
    return (
      <div 
        style={style} 
        className={`${COLUMN_LAYOUT} items-center border-b border-slate-100 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors px-6 group`}
      >
        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.dateStr}</div>
        <div className="text-sm text-slate-500 font-mono group-hover:text-primary transition-colors">{row.id}</div>
        <div className="text-sm text-slate-700 dark:text-slate-400 truncate pr-4">{row.origin}</div>
        <div className={`text-sm text-right font-bold ${row.emissions > 0 ? 'text-red-500' : 'text-slate-300'}`}>
          {row.emissions > 0 ? row.emissions.toFixed(1) : '-'}
        </div>
        <div className={`text-sm text-right font-bold ${row.capture > 0 ? 'text-primary' : 'text-slate-300'}`}>
          {row.capture > 0 ? row.capture.toFixed(1) : '-'}
        </div>
        <div className="text-center">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase inline-block border ${
            row.status === 'VALIDADO' 
              ? 'bg-green-100/50 text-green-700 border-green-200' 
              : 'bg-blue-100/50 text-blue-700 border-blue-200'
          }`}>
            {row.status}
          </span>
        </div>
        <div className="text-right">
          <button className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Auditoría Histórica 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión consolidada hacia la meta Net-Zero 2027.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">download</span>
            Descargar Reporte 2026
          </button>
        </div>
      </header>

      <section className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm transition-all relative z-30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Filtros 2026</h2>
              <p className="text-xs text-slate-500">Búsqueda avanzada de registros operativos del presente año.</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID Registro (Ej: #PC-26-...)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                type="text" 
                placeholder="Ej: #PC-26-55300"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registros 2026</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase border border-primary/20">
              {filteredData.length.toLocaleString()} Entradas
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto min-w-full scrollbar-hide">
          <div className="min-w-[950px]">
            <div className={`
              ${COLUMN_LAYOUT} 
              sticky top-0 z-20 
              bg-slate-50/90 dark:bg-slate-900/90 
              px-8 py-5 
              transition-all duration-300 backdrop-blur-md
              ${isScrolled ? 'shadow-lg border-b-primary/20' : 'border-b border-slate-100 dark:border-white/10'}
            `}>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Fecha</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">ID Registro</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Origen de Actividad</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Emisiones (t)</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Captura (t)</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest"></div>
            </div>

            {filteredData.length > 0 && List ? (
              <List
                height={520}
                itemCount={filteredData.length}
                itemSize={68}
                width="100%"
                className="scrollbar-hide"
                onScroll={({ scrollOffset }: any) => setIsScrolled(scrollOffset > 0)}
              >
                {Row}
              </List>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
