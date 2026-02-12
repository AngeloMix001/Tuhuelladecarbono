
import React, { useMemo, useState, memo, useCallback, useEffect } from 'react';
import * as ReactWindow from 'react-window';

// Handle potential ESM default/named export variations from esm.sh
const FixedSizeList = (ReactWindow as any).FixedSizeList || (ReactWindow as any).default?.FixedSizeList;

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
      isManual: false
    };
  });
};

const COLUMN_LAYOUT = "grid grid-cols-[140px_100px_1fr_100px_100px_120px_100px]";

// Edit Modal Component
const EditModal = ({ record, onSave, onClose }: { record: any, onSave: (data: any) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState({ 
    ...record, 
    raw: record.raw || { trucks: '', containers: '', electricity: '', diesel: '' }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('raw.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        raw: { ...prev.raw, [field]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (formData.isManual) {
      const FACTORS = { ELECTRICITY: 0.16, DIESEL: 2.68 };
      const elecCo2 = (parseFloat(formData.raw.electricity) || 0) * FACTORS.ELECTRICITY;
      const dieselCo2 = (parseFloat(formData.raw.diesel) || 0) * FACTORS.DIESEL;
      formData.emissions = (elecCo2 + dieselCo2) / 1000;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-3xl overflow-hidden animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-white/5">
          <div className="flex items-center gap-3">
             <span className="material-symbols-outlined text-primary">edit</span>
             <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Editar Registro {record.id}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><span className="material-symbols-outlined">close</span></button>
        </div>
        
        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
          {formData.isManual ? (
            <div className="grid grid-cols-2 gap-4 border-b border-slate-100 dark:border-white/10 pb-6">
               <div className="col-span-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Datos de Ingreso Manual</div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Electricidad (kWh)</label>
                 <input type="number" name="raw.electricity" value={formData.raw.electricity} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Diesel (Lts)</label>
                 <input type="number" name="raw.diesel" value={formData.raw.diesel} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Camiones</label>
                 <input type="number" name="raw.trucks" value={formData.raw.trucks} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
               </div>
               <div className="space-y-1">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contenedores</label>
                 <input type="number" name="raw.containers" value={formData.raw.containers} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
               </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emisiones (t)</label>
                <input type="number" name="emissions" value={formData.emissions} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Captura (t)</label>
                <input type="number" name="capture" value={formData.capture} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen de Actividad</label>
            <input name="origin" value={formData.origin} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
            <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white">
              <option value="VALIDADO">VALIDADO</option>
              <option value="EN REVISIÓN">EN REVISIÓN</option>
            </select>
          </div>
        </div>
        
        <div className="p-8 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex gap-4">
          <button onClick={handleSave} className="flex-1 bg-primary text-white font-black py-4 rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">GUARDAR CAMBIOS</button>
          <button onClick={onClose} className="px-8 py-4 text-slate-500 font-bold">CANCELAR</button>
        </div>
      </div>
    </div>
  );
};

const ReportRow = memo(({ data, index, style }: { data: any[], index: number, style: React.CSSProperties }) => {
  const row = data[index];
  const itemData = (style as any).itemData; 
  const onEdit = itemData?.onEdit;
  const onDelete = itemData?.onDelete;

  if (!row) return null;
  return (
    <div 
      style={style} 
      className={`${COLUMN_LAYOUT} items-center border-b border-slate-100 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors px-6 group`}
    >
      <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{row.dateStr}</div>
      <div className="text-sm text-slate-500 font-mono group-hover:text-primary transition-colors">{row.id}</div>
      <div className="text-sm text-slate-700 dark:text-slate-400 truncate pr-4">
        {row.origin}
        {row.isManual && (
          <span className="ml-2 px-1.5 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black rounded uppercase">Manual</span>
        )}
      </div>
      <div className={`text-sm text-right font-bold ${row.emissions > 0 ? 'text-red-500' : 'text-slate-300'}`}>
        {parseFloat(row.emissions) > 0 ? parseFloat(row.emissions).toFixed(2) : '-'}
      </div>
      <div className={`text-sm text-right font-bold ${row.capture > 0 ? 'text-primary' : 'text-slate-300'}`}>
        {parseFloat(row.capture) > 0 ? parseFloat(row.capture).toFixed(2) : '-'}
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
      <div className="text-right flex items-center justify-end gap-1">
        {row.isManual ? (
          <>
            <button onClick={() => onEdit(row)} className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Editar">
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
            <button onClick={() => onDelete(row.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors" title="Eliminar">
              <span className="material-symbols-outlined text-lg">delete</span>
            </button>
          </>
        ) : (
          <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-600 transition-colors">
            <span className="material-symbols-outlined text-xl">more_vert</span>
          </button>
        )}
      </div>
    </div>
  );
});

const Reports: React.FC = () => {
  const [userData, setUserData] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'manual'>('all');
  const mockData = useMemo(() => generateMockData(2000), []);
  const [isScrolled, setIsScrolled] = useState(false);

  const loadLocalData = useCallback(() => {
    const data = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
    const parsedData = data.map((d: any) => ({
      ...d,
      dateObj: new Date(d.dateObj),
      isManual: true
    }));
    setUserData(parsedData);
  }, []);

  useEffect(() => {
    loadLocalData();
    window.addEventListener('localDataChanged', loadLocalData);
    return () => window.removeEventListener('localDataChanged', loadLocalData);
  }, [loadLocalData]);

  const allCombinedData = useMemo(() => {
    if (viewMode === 'manual') return userData;
    return [...userData, ...mockData];
  }, [userData, mockData, viewMode]);

  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'Todos',
  });

  const filteredData = useMemo(() => {
    return allCombinedData.filter(item => {
      const matchesSearch = filters.searchTerm === '' || 
        item.id.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        item.origin.toLowerCase().includes(filters.searchTerm.toLowerCase());

      const matchesStatus = filters.status === 'Todos' || item.status === filters.status;
      return matchesSearch && matchesStatus;
    });
  }, [allCombinedData, filters]);

  const handleScroll = useCallback(({ scrollOffset }: { scrollOffset: number }) => {
    setIsScrolled(scrollOffset > 0);
  }, []);

  const handleUpdateRecord = (updatedRecord: any) => {
    const existing = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
    const updated = existing.map((r: any) => r.id === updatedRecord.id ? updatedRecord : r);
    localStorage.setItem('puerto_columbo_user_data', JSON.stringify(updated));
    setEditingRecord(null);
    loadLocalData();
  };

  const handleDeleteRecord = (id: string) => {
    if (confirm("¿Eliminar este registro permanentemente?")) {
      const existing = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
      const filtered = existing.filter((r: any) => r.id !== id);
      localStorage.setItem('puerto_columbo_user_data', JSON.stringify(filtered));
      loadLocalData();
    }
  };

  const itemData = useMemo(() => ({
    onEdit: (rec: any) => setEditingRecord(rec),
    onDelete: (id: string) => handleDeleteRecord(id)
  }), [loadLocalData]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Auditoría Histórica 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Visualización de reportes manuales y sistémicos.</p>
        </div>
        <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm">
          <button 
            onClick={() => setViewMode('all')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'all' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Todo
          </button>
          <button 
            onClick={() => setViewMode('manual')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'manual' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Registros Guardados
          </button>
        </div>
      </header>

      <section className="bg-white dark:bg-white/5 p-8 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm transition-all relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buscador Inteligente</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
              <input 
                type="text" 
                placeholder="ID, Origen..."
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none dark:text-white"
                value={filters.searchTerm}
                onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
            <select 
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="Todos">Todos los estados</option>
              <option value="VALIDADO">VALIDADO</option>
              <option value="EN REVISIÓN">EN REVISIÓN</option>
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-white/5 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden flex flex-col transition-all">
        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {viewMode === 'manual' ? 'Mis Registros Guardados' : 'Base de Datos Consolidada'}
          </h2>
          <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase border ${viewMode === 'manual' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {filteredData.length.toLocaleString()} Entradas
          </span>
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
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Origen</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Emisiones (t)</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Captura (t)</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</div>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</div>
            </div>

            {filteredData.length > 0 && FixedSizeList ? (
              <FixedSizeList
                height={520}
                itemCount={filteredData.length}
                itemSize={68}
                width="100%"
                itemData={{ data: filteredData, ...itemData }}
                className="scrollbar-hide"
                onScroll={handleScroll}
              >
                {({ data, index, style }) => (
                  <ReportRow 
                    index={index} 
                    style={{ ...style, itemData: data }} 
                    data={data.data} 
                  />
                )}
              </FixedSizeList>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center gap-4 text-slate-400">
                <span className="material-symbols-outlined text-4xl">inventory_2</span>
                <p className="text-sm font-bold uppercase tracking-widest">No se encontraron registros {viewMode === 'manual' ? 'guardados' : ''}</p>
                {viewMode === 'manual' && (
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Ve a 'Ingreso de Datos' para registrar tu actividad.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {editingRecord && (
        <EditModal 
          record={editingRecord} 
          onSave={handleUpdateRecord} 
          onClose={() => setEditingRecord(null)} 
        />
      )}
    </div>
  );
};

export default Reports;
