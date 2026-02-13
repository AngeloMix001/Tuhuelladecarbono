
import React, { useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';

const RecordDetailModal: React.FC<{ record: any, onClose: () => void }> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-3xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-white/10">
        <div className="p-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                record.status === 'VALIDADO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {record.status}
              </span>
              <span className="text-xs font-bold text-slate-400">{record.id}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{record.origin}</h3>
            <p className="text-sm text-slate-500 font-bold">{record.dateStr}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
          </button>
        </div>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emisiones Totales</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{record.emissions.toFixed(2)}</span>
                <span className="text-xs font-bold text-slate-500">tCO₂e</span>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-1">Captura Estimada</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">{record.capture.toFixed(2)}</span>
                <span className="text-xs font-bold text-primary/70">tCO₂e</span>
              </div>
            </div>
          </div>
          {record.raw ? (
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">data_object</span>
                Datos Operativos Originales
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">local_shipping</span>
                  <p className="text-[10px] text-slate-400 uppercase">Camiones</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.trucks || 0}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">box</span>
                  <p className="text-[10px] text-slate-400 uppercase">Contenedores</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.containers || 0}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">bolt</span>
                  <p className="text-[10px] text-slate-400 uppercase">Electricidad</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.electricity || 0} <span className="text-[9px]">kWh</span></p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">ev_station</span>
                  <p className="text-[10px] text-slate-400 uppercase">Diesel</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.diesel || 0} <span className="text-[9px]">Lts</span></p>
                </div>
              </div>
            </div>
          ) : (
             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/20 text-center">
                <p className="text-xs text-slate-400 italic">No hay datos operativos detallados disponibles para este registro.</p>
             </div>
          )}
        </div>
        <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedRecordsWidget: React.FC = () => {
  const [localData, setLocalData] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const navigate = useNavigate();

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
    setLocalData(data.slice(0, 5));
  };

  useEffect(() => {
    loadData();
    window.addEventListener('localDataChanged', loadData);
    return () => window.removeEventListener('localDataChanged', loadData);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 p-8 shadow-sm h-full flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registros Guardados</h3>
          <button 
            onClick={() => navigate('/reportes')}
            className="text-sm font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
          >
            Ver todo
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {localData.length > 0 ? localData.map((item, idx) => {
            const parts = item.dateStr?.split(' ') || ['01', 'ENE'];
            const date = parts[0];
            const month = parts[1];
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedRecord(item)}
                className="flex items-center gap-5 group cursor-pointer animate-in fade-in slide-in-from-left duration-300 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-2xl transition-all" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="w-1.5 h-12 bg-primary rounded-full shrink-0 group-hover:scale-y-110 transition-transform shadow-lg shadow-primary/20"></div>
                <div className="flex flex-col items-center justify-center min-w-[50px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{month}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{date}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">{item.emissions?.toFixed(2) || 0}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">tCO₂e</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest truncate">{item.origin}</p>
                </div>
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4 opacity-50 h-full">
              <span className="material-symbols-outlined text-5xl">inventory_2</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">No hay registros guardados para mostrar</p>
            </div>
          )}
        </div>
      </div>
      {selectedRecord && (
        <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </>
  );
};

export default memo(SavedRecordsWidget);
