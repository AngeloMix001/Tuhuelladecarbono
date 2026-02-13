
import React, { useState, useMemo } from 'react';
import { useRegistros } from '../hooks/useRegistros';
import { RegistroCO2, EstadoRegistro } from '../types';

const TablaInformes: React.FC = () => {
  const { registros, loading, cambiarEstado, deleteRegistro } = useRegistros();
  
  // Estados de Filtros
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoRegistro | 'TODOS'>('TODOS');
  const [origenFiltro, setOrigenFiltro] = useState<string>('TODOS');
  const [fechaDesde, setFechaDesde] = useState<string>('');
  const [fechaHasta, setFechaHasta] = useState<string>('');

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

  const exportReport = () => {
    if (filtered.length === 0) {
      alert("No hay registros para exportar con los filtros actuales.");
      return;
    }

    try {
      const headers = ["ID", "Fecha", "Origen", "Emisiones (t)", "Captura (t)", "Estado"];
      const rows = filtered.map(r => [
        r.id,
        r.fecha,
        r.origen,
        r.emisiones.toFixed(4),
        (r.captura || 0).toFixed(4),
        r.estado
      ]);

      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Reporte_CO2_Columbo_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Feedback simple
      alert("Reporte exportado correctamente.");
    } catch (error) {
      alert("Error al generar el reporte.");
    }
  };

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-400 font-bold uppercase tracking-widest">Sincronizando base de datos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Barra de Filtros Avanzada */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Desde</label>
            <input 
              type="date" 
              value={fechaDesde} 
              onChange={e => setFechaDesde(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs dark:text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta</label>
            <input 
              type="date" 
              value={fechaHasta} 
              onChange={e => setFechaHasta(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs dark:text-white" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen</label>
            <select 
              value={origenFiltro} 
              onChange={e => setOrigenFiltro(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs dark:text-white"
            >
              <option value="TODOS">Todas las terminales</option>
              <option value="Puerto Columbo Valparaíso">Puerto Columbo Valparaíso</option>
              <option value="Puerto Columbo San Antonio">Puerto Columbo San Antonio</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</label>
            <select 
              value={estadoFiltro} 
              onChange={e => setEstadoFiltro(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs dark:text-white"
            >
              <option value="TODOS">Todos los estados</option>
              <option value="EN_VALIDACION">En Validación</option>
              <option value="APROBADO">Aprobado</option>
              <option value="RECHAZADO">Rechazado</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex gap-3">
            <button 
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Limpiar Filtros
            </button>
          </div>
          
          <button 
            onClick={exportReport}
            className="px-8 py-3 bg-slate-900 dark:bg-primary text-white font-black rounded-xl text-xs uppercase tracking-widest flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-lg">download</span>
            Descargar Reporte
          </button>
        </div>
      </section>

      {/* Tabla de Resultados */}
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-between items-center">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registros Encontrados: {filtered.length}</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Emisiones (t)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Captura (t)</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filtered.map(row => (
                <tr key={row.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-slate-900 dark:text-white">{row.id}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{row.fecha}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-tight">{row.origen}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{row.emisiones.toFixed(4)}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-primary">{(row.captura || 0).toFixed(4)}</span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge estado={row.estado} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {row.estado === 'EN_VALIDACION' && (
                        <>
                          <button onClick={() => cambiarEstado(row.id, 'APROBADO')} className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary transition-colors hover:text-white" title="Aprobar">
                            <span className="material-symbols-outlined text-sm">done</span>
                          </button>
                          <button onClick={() => cambiarEstado(row.id, 'RECHAZADO')} className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 transition-colors hover:text-white" title="Rechazar">
                            <span className="material-symbols-outlined text-sm">close</span>
                          </button>
                        </>
                      )}
                      <button onClick={() => deleteRegistro(row.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center text-slate-400 italic text-sm font-medium">No se encontraron registros bajo los criterios seleccionados.</td>
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
    EN_VALIDACION: { label: 'EN VALIDACIÓN', bg: 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500 border-orange-200' },
    APROBADO: { label: 'APROBADO', bg: 'bg-green-100 text-green-700 dark:bg-primary/10 dark:text-primary border-green-200' },
    RECHAZADO: { label: 'RECHAZADO', bg: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-500 border-red-200' },
  };

  const { label, bg } = configs[estado];
  return (
    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black border uppercase tracking-widest inline-block ${bg}`}>
      {label}
    </span>
  );
};

export default TablaInformes;
