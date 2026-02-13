
import React, { useState, useMemo } from 'react';
import { useRegistros } from '../hooks/useRegistros';
import { RegistroCO2, EstadoRegistro } from '../types';
import { exportRegistrosToExcel } from '../utils/export';

const TablaInformes: React.FC = () => {
  const { registros, loading, cambiarEstado, deleteRegistro } = useRegistros();
  
  // Estados de Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoRegistro | 'TODOS'>('TODOS');
  const [origenFiltro, setOrigenFiltro] = useState<string>('TODOS');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

  // Estado para la notificación de exportación (Toast)
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Lógica de filtrado reactiva
  const filtered = useMemo(() => {
    return registros.filter(r => {
      const matchEstado = estadoFiltro === 'TODOS' ? true : r.estado === estadoFiltro;
      const matchOrigen = origenFiltro === 'TODOS' ? true : r.origen === origenFiltro;
      
      let matchFecha = true;
      if (fechaDesde) matchFecha = matchFecha && r.fecha >= fechaDesde;
      if (fechaHasta) matchFecha = matchFecha && r.fecha <= fechaHasta;
      
      return matchEstado && matchOrigen && matchFecha;
    });
  }, [registros, estadoFiltro, origenFiltro, fechaDesde, fechaHasta]);

  const handleClearFilters = () => {
    setEstadoFiltro('TODOS');
    setOrigenFiltro('TODOS');
    setFechaDesde('');
    setFechaHasta('');
  };

  const handleExport = () => {
    if (filtered.length === 0) {
      setToast({ message: "No hay registros disponibles para los filtros seleccionados", type: 'error' });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    setIsExporting(true);
    setToast({ message: "Generando reporte Excel...", type: 'info' });

    // Simulamos un pequeño procesamiento para mejorar la experiencia de usuario
    setTimeout(() => {
      try {
        exportRegistrosToExcel(filtered);
        setToast({ message: "Reporte descargado exitosamente", type: 'success' });
      } catch (error: any) {
        setToast({ message: `Error al generar el reporte: ${error.message}`, type: 'error' });
      } finally {
        setIsExporting(false);
        // El toast de éxito/error persiste un poco más para que el usuario lo lea
        setTimeout(() => setToast(null), 4000);
      }
    }, 1200);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
      <div className="relative">
        <div className="size-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <span className="material-symbols-outlined absolute inset-0 flex items-center justify-center text-primary">sync</span>
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Sincronizando Base de Datos Ambiental...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      
      {/* Sistema de Notificaciones (Toast) - Estilo Premium Floating */}
      {toast && (
        <div className="fixed bottom-10 right-10 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-500">
          <div className={`
            flex items-center gap-4 px-6 py-4 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border backdrop-blur-xl
            ${toast.type === 'success' ? 'bg-primary/90 text-white border-primary/20' : 
              toast.type === 'error' ? 'bg-red-600/90 text-white border-red-500/20' : 
              'bg-slate-900/90 text-white border-slate-700'}
          `}>
            <div className="flex items-center justify-center">
              {toast.type === 'info' ? (
                <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined text-xl">
                  {toast.type === 'success' ? 'verified' : 'error'}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                {toast.type === 'info' ? 'Procesando' : toast.type === 'success' ? 'Completado' : 'Error'}
              </span>
              <p className="text-xs font-bold leading-tight">{toast.message}</p>
            </div>
            {toast.type !== 'info' && (
              <button onClick={() => setToast(null)} className="ml-2 size-8 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Barra de Filtros Avanzada */}
      <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">filter_list</span>
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Filtros de Búsqueda</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Segmentación de Reporte Ambiental</p>
            </div>
          </div>
          <button 
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-white uppercase tracking-widest transition-colors"
          >
            <span className="material-symbols-outlined text-sm">filter_alt_off</span>
            Restablecer
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span> Fecha Inicial
            </label>
            <input 
              type="date" 
              value={fechaDesde} 
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">calendar_today</span> Fecha Final
            </label>
            <input 
              type="date" 
              value={fechaHasta} 
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">location_on</span> Terminal
            </label>
            <select 
              value={origenFiltro} 
              onChange={e => setOrigenFiltro(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
            >
              <option value="TODOS">Todas las terminales</option>
              <option value="Puerto Columbo Valparaíso">Puerto Columbo Valparaíso</option>
              <option value="Puerto Columbo San Antonio">Puerto Columbo San Antonio</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">rule</span> Estado Validación
            </label>
            <select 
              value={estadoFiltro} 
              onChange={e => setEstadoFiltro(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl px-5 py-3.5 text-xs dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="EN_VALIDACION">En Validación</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`
              px-10 py-5 bg-slate-900 dark:bg-primary text-white font-black rounded-3xl text-xs uppercase tracking-widest flex items-center gap-4 shadow-2xl transition-all
              ${isExporting ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95 hover:shadow-primary/30'}
            `}
          >
            {isExporting ? (
              <div className="size-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined">download</span>
            )}
            {isExporting ? 'Generando Reporte...' : 'Descargar Reporte Excel'}
          </button>
        </div>
      </section>

      {/* Tabla de Resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50/20 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400">table_rows</span>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Registros Encontrados: {filtered.length}</h4>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identificador / Fecha</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ubicación Origen</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Emisiones (tCO2e)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Captura (tCO2e)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Validación</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-5">
                    <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight">{row.id}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px]">calendar_month</span>
                      {row.fecha}
                    </p>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-2 rounded-full bg-primary/40"></div>
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{row.origen}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{row.emisiones.toFixed(4)}</span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="text-sm font-black text-primary">{(row.captura || 0).toFixed(4)}</span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <StatusBadge estado={row.estado} />
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {row.estado === 'EN_VALIDACION' && (
                        <>
                          <button onClick={() => cambiarEstado(row.id, 'APROBADO')} className="p-2.5 bg-primary/10 text-primary rounded-xl hover:bg-primary transition-all hover:text-white shadow-sm" title="Aprobar Registro">
                            <span className="material-symbols-outlined text-sm">check</span>
                          </button>
                          <button onClick={() => cambiarEstado(row.id, 'RECHAZADO')} className="p-2.5 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all hover:text-white shadow-sm" title="Rechazar Registro">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteRegistro(row.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Eliminar Permanentemente">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <div className="size-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-5xl">database_off</span>
                      </div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">No hay datos que coincidan con la búsqueda</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ estado }: { estado: EstadoRegistro }) => {
  const configs = {
    EN_VALIDACION: { label: 'EN VALIDACIÓN', bg: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 border-orange-200/40' },
    APROBADO: { label: 'APROBADO', bg: 'bg-green-50 text-green-600 dark:bg-primary/10 dark:text-primary border-green-200/40' },
    RECHAZADO: { label: 'RECHAZADO', bg: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 border-red-200/40' },
  };

  const { label, bg } = configs[estado];
  return (
    <span className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-[0.15em] inline-block ${bg}`}>
      {label}
    </span>
  );
};

export default TablaInformes;
