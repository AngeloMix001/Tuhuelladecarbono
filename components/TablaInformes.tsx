
import React, { useState } from 'react';
import { useRegistros } from '../hooks/useRegistros';
import { RegistroCO2, EstadoRegistro } from '../types';

const TablaInformes: React.FC = () => {
  const { registros, loading, cambiarEstado, deleteRegistro } = useRegistros();
  const [filtro, setFiltro] = useState<EstadoRegistro | 'TODOS'>('TODOS');

  const filtered = registros.filter(r => filtro === 'TODOS' ? true : r.estado === filtro);

  if (loading) return <div className="text-center py-20 animate-pulse text-slate-400">Cargando base de datos...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex gap-2">
          {['TODOS', 'EN_VALIDACION', 'APROBADO', 'RECHAZADO'].map(f => (
            <button 
              key={f}
              onClick={() => setFiltro(f as any)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filtro === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          Mostrando {filtered.length} de {registros.length} registros
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">ID / Fecha</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Emisiones (tCO₂e)</th>
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
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{row.origen}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-black text-slate-900 dark:text-white">{row.emisiones.toFixed(4)}</span>
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
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 italic text-sm">No se encontraron registros para este filtro.</td>
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
    <span className={`px-2 py-1 rounded-md text-[9px] font-black border uppercase tracking-widest inline-block ${bg}`}>
      {label}
    </span>
  );
};

export default TablaInformes;
