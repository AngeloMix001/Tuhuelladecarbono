
import React, { useMemo, useState, memo, useCallback, useEffect } from 'react';
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
    const date = new Date(2026, month, day);
    
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

// Extracted stable row component for virtualization performance
const ReportRow = memo(({ data, index, style }: { data: any[], index: number, style: React.CSSProperties }) => {
  const row = data[index];
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
});

const Reports: React.FC = () => {
  const [userData, setUserData] = useState<any[]>([]);
  const mockData = useMemo(() => generateMockData(2000), []);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
    // Ensure dateObj is converted back from string if stored as JSON
    const parsedData = data.map((d: any) => ({
      ...d,
      dateObj: new Date(d.dateObj)
    }));
    setUserData(parsedData);
  }, []);

  const allCombinedData = useMemo(() => {
    return [...userData, ...mockData];
  }, [userData, mockData]);

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
    return allCombinedData.filter(item => {
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
  }, [allCombinedData, filters]);

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setIsScrolled(scrollOffset > 0);
  }, []);

  const handleClearLocal = () => {
    if (confirm("¿Está seguro de eliminar los registros locales guardados?")) {
      localStorage.removeItem('puerto_columbo_user_data');
      setUserData([]);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Auditoría Histórica 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestión consolidada hacia la meta Net-Zero 2027.</p>
        </div>
        <div className="flex items-center gap-3">
          {userData.length > 0 && (
            <button 
              onClick={handleClearLocal}
              className="px-4 py-3 rounded-xl font-bold text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2 border border-red-200 dark:border-red-500/20"
            >
              <span className="material-symbols-outlined text-sm">delete_sweep</span>
              Limpiar Locales
            </button>
          )}
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
            <div className="flex gap-2">
              <span className="bg-primary/10 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase border border-primary/20">
                {filteredData.length.toLocaleString()} Total
              </span>
              {userData.length > 0 && (
                <span className="bg-blue-500/10 text-blue-500 text-[10px] font-black px-3 py-1 rounded-full uppercase border border-blue-500/20">
                  {userData.length} Manuales
                </span>
              )}
            </div>
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
                itemData={filteredData}
                className="scrollbar-hide"
                onScroll={handleScroll}
              >
                {ReportRow}
              </List>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                <p className="text-sm font-bold uppercase tracking-widest">No se encontraron registros</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Reports;
