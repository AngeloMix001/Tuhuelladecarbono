import React, { useMemo, useState, useRef, useEffect } from 'react';
import * as ReactWindow from 'react-window';

// Garantizar la resolución de FixedSizeList en entornos híbridos
const { FixedSizeList: List } = ReactWindow as any;

// Generate a large mock dataset for demonstration
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
    // Generate dates between Jan 1 and Dec 31, 2024
    const day = (i % 28) + 1;
    const month = (i % 12);
    const date = new Date(2024, month, day);
    
    return {
      id: `#PC-${44300 - i}`,
      dateObj: date,
      dateStr: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }),
      origin: origins[i % origins.length],
      emissions: i % 3 === 0 ? Math.random() * 50 : 0,
      capture: i % 3 !== 0 ? Math.random() * 30 : 0,
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

  // Filter States
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
      // Text Search
      const matchesSearch = filters.searchTerm === '' || 
        item.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Status & Origin
      const matchesStatus = filters.status === 'Todos' || item.status === filters.status;
      const matchesOrigin = filters.origin === 'Todas las plantas' || item.origin === filters.origin;
      
      // Emissions Range
      const minE = parseFloat(filters.minEmissions) || 0;
      const maxE = parseFloat(filters.maxEmissions) || Infinity;
      const matchesEmissions = item.emissions >= minE && item.emissions <= maxE;

      // Capture Range
      const minC = parseFloat(filters.minCapture) || 0;
      const maxC = parseFloat(filters.maxCapture) || Infinity;
      const matchesCapture = item.capture >= minC && item.capture <= maxC;

      // Date Range
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
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Reportes y Exportación</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión histórica de emisiones y captura para Puerto Columbo S.A.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-xl">print</span>
            Imprimir
          </button>
          <button className="bg-primary hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <span className="material-symbols-outlined text-xl">download</span>
            Exportar CSV
          </button>
        </div>
      </header>

      {/* Advanced Filters Section */}
      <section className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm transition-all relative z-30">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-primary/10 rounded-xl">
              <span className="material-symbols-outlined text-primary">filter_alt</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Filtros Avanzados</h2>
              <p className="text-xs text-slate-500">Refine los resultados por fecha, planta o magnitud</p>
            </div>
          </div>
          {isFiltered && (
            <button 
              onClick={resetFilters}
              className="text-xs font-black text-primary hover:text-green-700 transition-colors flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              RESETEAR FILTROS
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
          {/* Global Search */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buscar por ID o Planta</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                type="text" 
                placeholder="Ej: #PC-44300"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
          </div>

          {/* Status Filter */}
          <FilterSelect 
            label="Estado del Reporte" 
            options={['Todos', 'VALIDADO', 'EN REVISIÓN']} 
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          />

          {/* Date Range Filter */}
          <div className="flex flex-col gap-2 lg:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rango de Fechas</label>
            <div className="flex items-center gap-3">
              <input 
                type="date" 
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 dark:text-white outline-none"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
              <span className="text-slate-300 font-bold">a</span>
              <input 
                type="date" 
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 dark:text-white outline-none"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* Origin Filter - Enhanced with Icons */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen de Datos</label>
            <CustomOriginDropdown 
              value={filters.origin}
              onChange={(val) => setFilters({...filters, origin: val})}
            />
          </div>

          {/* Emission Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emisiones (tCO₂)</label>
            <div className="flex items-center gap-2">
              <input 
                className="w-full px-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary dark:text-white outline-none" 
                placeholder="Min" 
                type="number"
                value={filters.minEmissions}
                onChange={(e) => setFilters({...filters, minEmissions: e.target.value})}
              />
              <input 
                className="w-full px-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary dark:text-white outline-none" 
                placeholder="Max" 
                type="number"
                value={filters.maxEmissions}
                onChange={(e) => setFilters({...filters, maxEmissions: e.target.value})}
              />
            </div>
          </div>

          {/* Capture Range Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Captura (tCO₂)</label>
            <div className="flex items-center gap-2">
              <input 
                className="w-full px-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary dark:text-white outline-none" 
                placeholder="Min" 
                type="number"
                value={filters.minCapture}
                onChange={(e) => setFilters({...filters, minCapture: e.target.value})}
              />
              <input 
                className="w-full px-3 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary dark:text-white outline-none" 
                placeholder="Max" 
                type="number"
                value={filters.maxCapture}
                onChange={(e) => setFilters({...filters, maxCapture: e.target.value})}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Virtualized Table Container */}
      <section className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registros Operacionales</h2>
            <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase border border-primary/20">
              {filteredData.length.toLocaleString()} Entradas
            </span>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-red-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Emisión</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Captura</span>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto min-w-full scrollbar-hide">
          <div className="min-w-[950px]">
            {/* Header Row - Sticky */}
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

            {/* Virtualized List */}
            {filteredData.length > 0 ? (
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
            ) : (
              <div className="h-[520px] flex flex-col items-center justify-center text-slate-400 bg-slate-50/20 dark:bg-white/5 space-y-4">
                <div className="p-6 bg-white dark:bg-white/5 rounded-full shadow-inner">
                  <span className="material-symbols-outlined text-6xl opacity-20">search_off</span>
                </div>
                <div className="text-center">
                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight">Sin resultados</p>
                  <p className="text-sm">Ajuste los parámetros de filtrado para encontrar registros.</p>
                </div>
                <button onClick={resetFilters} className="text-xs font-bold text-primary underline">Limpiar filtros actuales</button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Auditoría Ambiental Puerto Columbo S.A. – v2.1</p>
          <div className="flex items-center gap-4">
             <span className="text-xs font-black text-slate-500 uppercase">Página 1 de {Math.ceil(filteredData.length / 100) || 1}</span>
             <div className="flex gap-2">
                <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 disabled:opacity-20" disabled>
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="size-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const CustomOriginDropdown: React.FC<{ value: string, onChange: (val: string) => void }> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = ORIGIN_OPTIONS.find(opt => opt.label === value) || ORIGIN_OPTIONS[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white outline-none transition-all text-left"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <span className="material-symbols-outlined text-primary text-lg shrink-0">{selectedOption.icon}</span>
          <span className="truncate">{selectedOption.label}</span>
        </div>
        <span className={`material-symbols-outlined text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
          {ORIGIN_OPTIONS.map((opt) => (
            <button
              key={opt.label}
              onClick={() => {
                onChange(opt.label);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors text-left ${
                value === opt.label ? 'text-primary bg-primary/5' : 'text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className={`material-symbols-outlined text-lg shrink-0 ${value === opt.label ? 'text-primary' : 'text-slate-400'}`}>
                {opt.icon}
              </span>
              <span className="truncate">{opt.label}</span>
              {value === opt.label && (
                <span className="material-symbols-outlined text-primary ml-auto text-sm">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const FilterSelect: React.FC<{ label: string, options: string[], value: string, onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }> = ({ label, options, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select 
        value={value}
        onChange={onChange}
        className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary dark:text-white outline-none cursor-pointer appearance-none transition-all"
      >
        {options.map(opt => <option key={opt} value={opt} className="bg-white dark:bg-slate-900">{opt}</option>)}
      </select>
      <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
    </div>
  </div>
);

export default Reports;