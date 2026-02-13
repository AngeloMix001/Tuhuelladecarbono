
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
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      
      {/* Sistema de Notificaciones (Toast) */}
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

      {/* Sección de Filtros Avanzada Refinada */}
      <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-2xl space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
              <span className="material-symbols-outlined text-3xl">tune</span>
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Filtros Avanzados</h3>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Optimización de búsqueda y auditoría ambiental</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleClearFilters}
              className="group flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
            >
              <span className="material-symbols-outlined text-lg transition-transform group-hover:rotate-180">restart_alt</span>
              <span className="text-[10px] font-black uppercase tracking-[0.1em]">Limpiar Filtros</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
          {/* Fecha Inicial */}
          <div className="group space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Rango Inicial</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">calendar_month</span>
              <input 
                type="date" 
                value={fechaDesde} 
                onChange={e => setFechaDesde(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none" 
              />
            </div>
          </div>

          {/* Fecha Final */}
          <div className="group space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Rango Final</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">calendar_today</span>
              <input 
                type="date" 
                value={fechaHasta} 
                onChange={e => setFechaHasta(e.target.value)}
                className="w-full pl-12 pr-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none" 
              />
            </div>
          </div>

          {/* Terminal / Origen */}
          <div className="group space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Terminal Operativa</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">hub</span>
              <select 
                value={origenFiltro} 
                onChange={e => setOrigenFiltro(e.target.value)}
                className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="TODOS">Todas las sedes</option>
                <option value="Puerto Columbo Valparaíso">P.C. Valparaíso</option>
                <option value="Puerto Columbo San Antonio">P.C. San Antonio</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>

          {/* Estado Validación */}
          <div className="group space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 group-focus-within:text-primary transition-colors">Estado Auditoría</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">verified</span>
              <select 
                value={estadoFiltro} 
                onChange={e => setEstadoFiltro(e.target.value as any)}
                className="w-full pl-12 pr-10 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all appearance-none cursor-pointer"
              >
                <option value="TODOS">Todos los estados</option>
                <option value="EN_VALIDACION">Pendientes</option>
                <option value="APROBADO">Aprobados</option>
                <option value="RECHAZADO">Rechazados</option>
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                  <img src={`https://picsum.photos/seed/${i + 10}/100`} alt="Avatar" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
              <div className="size-8 rounded-full border-2 border-white dark:border-slate-900 bg-primary/20 flex items-center justify-center">
                <span className="text-[8px] font-black text-primary">+</span>
              </div>
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Registros auditables bajo cumplimiento ISO 14064</p>
          </div>
          
          <button 
            onClick={handleExport}
            disabled={isExporting}
            className={`
              w-full md:w-auto px-12 py-5 bg-slate-900 dark:bg-primary text-white font-black rounded-3xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_40px_-15px_rgba(17,212,33,0.3)] transition-all
              ${isExporting ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:scale-[1.03] active:scale-95 hover:shadow-primary/40'}
            `}
          >
            {isExporting ? (
              <div className="size-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-xl">file_download</span>
            )}
            {isExporting ? 'Procesando Informe...' : 'Generar Reporte Excel'}
          </button>
        </div>
      </section>

      {/* Tabla de Resultados con Cabecera Refinada */}
      <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden animate-in fade-in duration-700">
        <div className="px-8 py-8 border-b border-slate-100 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/20 dark:bg-white/5">
          <div className="flex items-center gap-4">
            <div className="size-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center">
              <span className="material-symbols-outlined text-slate-400">inventory</span>
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Base de Datos de Emisiones <span className="text-primary ml-2">{filtered.length} Registros</span></h4>
          </div>
          
          <div className="px-4 py-2 bg-slate-100/50 dark:bg-white/5 rounded-full border border-slate-200 dark:border-white/10">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sincronizado: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 dark:bg-white/5">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">Ref / Cronología</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">Terminal</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 text-right">Emisiones (t)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 text-right">Captura (t)</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 text-center">Estado Auditoría</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map((row, idx) => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group animate-in fade-in slide-in-from-top-2" style={{ animationDelay: `${idx * 30}ms` }}>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <p className="text-xs font-black text-slate-900 dark:text-white tracking-tight group-hover:text-primary transition-colors">{row.id}</p>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 flex items-center gap-1.5 opacity-60">
                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                        {row.fecha}
                      </p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="size-2.5 rounded-full bg-primary/30 ring-4 ring-primary/5"></div>
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
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                      {row.estado === 'EN_VALIDACION' && (
                        <>
                          <button onClick={() => cambiarEstado(row.id, 'APROBADO')} className="size-9 bg-primary/10 text-primary rounded-xl hover:bg-primary transition-all hover:text-white shadow-sm flex items-center justify-center" title="Validar Registro">
                            <span className="material-symbols-outlined text-sm">done_all</span>
                          </button>
                          <button onClick={() => cambiarEstado(row.id, 'RECHAZADO')} className="size-9 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 transition-all hover:text-white shadow-sm flex items-center justify-center" title="Rechazar Registro">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteRegistro(row.id)} className="size-9 text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all flex items-center justify-center" title="Eliminar Registro">
                        <span className="material-symbols-outlined text-sm">delete_forever</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-40 text-center">
                    <div className="flex flex-col items-center gap-5 opacity-40">
                      <div className="size-24 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center ring-8 ring-slate-50 dark:ring-white/0">
                        <span className="material-symbols-outlined text-6xl text-slate-400">query_stats</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Sin resultados</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ajusta los parámetros de búsqueda</p>
                      </div>
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
    EN_VALIDACION: { 
      label: 'PENDIENTE', 
      bg: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500 border-orange-200/40',
      icon: 'schedule',
      dotColor: 'bg-orange-500'
    },
    APROBADO: { 
      label: 'VALIDADO', 
      bg: 'bg-green-50 text-green-600 dark:bg-primary/10 dark:text-primary border-green-200/40',
      icon: 'verified',
      dotColor: 'bg-primary'
    },
    RECHAZADO: { 
      label: 'RECHAZADO', 
      bg: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-500 border-red-200/40',
      icon: 'error',
      dotColor: 'bg-red-500'
    },
  };

  const { label, bg, icon, dotColor } = configs[estado];
  return (
    <div className={`px-4 py-2 rounded-xl text-[9px] font-black border uppercase tracking-[0.2em] inline-flex items-center gap-2 shadow-sm ${bg}`}>
      <div className={`size-1.5 rounded-full ${dotColor} ${estado === 'EN_VALIDACION' ? 'animate-pulse' : ''}`}></div>
      <span className="material-symbols-outlined text-[14px] leading-none">{icon}</span>
      {label}
    </div>
  );
};

export default TablaInformes;
