
import React, { useState, useMemo } from 'react';
import { useRegistros } from '../hooks/useRegistros';

const EMISSION_FACTORS = {
  ELECTRICITY: 0.16, // kgCO2e/kWh
  DIESEL: 2.68,      // kgCO2e/L
};

const FormularioIngreso: React.FC = () => {
  const { insertRegistro } = useRegistros();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [form, setForm] = useState({
    fecha: new Date().toISOString().split('T')[0],
    trucks: '',
    containers: '',
    electricity: '',
    diesel: '',
    origen: 'Terminal Central'
  });

  const emisionesTotales = useMemo(() => {
    const e = (parseFloat(form.electricity) || 0) * EMISSION_FACTORS.ELECTRICITY;
    const d = (parseFloat(form.diesel) || 0) * EMISSION_FACTORS.DIESEL;
    return (e + d) / 1000; // Convertir a toneladas
  }, [form.electricity, form.diesel]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await insertRegistro({
        fecha: form.fecha,
        emisiones: emisionesTotales,
        origen: form.origen,
        datos: {
          trucks: parseInt(form.trucks) || 0,
          containers: parseInt(form.containers) || 0,
          electricity: parseFloat(form.electricity) || 0,
          diesel: parseFloat(form.diesel) || 0,
        }
      });

      setShowSuccess(true);
      setForm({
        fecha: new Date().toISOString().split('T')[0],
        trucks: '',
        containers: '',
        electricity: '',
        diesel: '',
        origen: 'Terminal Central'
      });
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      alert("Error al guardar el registro");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">add_circle</span>
          Nuevo Registro de Emisiones
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 col-span-1 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Operativa</label>
            <input type="date" required value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20" />
          </div>

          <InputGroup label="Camiones" value={form.trucks} onChange={v => setForm({...form, trucks: v})} unit="uds" icon="local_shipping" />
          <InputGroup label="Contenedores" value={form.containers} onChange={v => setForm({...form, containers: v})} unit="TEU" icon="box" />
          <InputGroup label="Electricidad" value={form.electricity} onChange={v => setForm({...form, electricity: v})} unit="kWh" icon="bolt" />
          <InputGroup label="Diesel" value={form.diesel} onChange={v => setForm({...form, diesel: v})} unit="Lts" icon="ev_station" />
        </div>

        <div className="mt-10 p-6 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Cálculo Estimado</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-primary">{emisionesTotales.toFixed(4)}</span>
              <span className="text-sm font-bold text-primary/70">tCO₂e</span>
            </div>
          </div>
          <button 
            type="submit" 
            disabled={isSaving || emisionesTotales <= 0}
            className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
          >
            {isSaving ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">save</span>}
            {isSaving ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
          </button>
        </div>

        {showSuccess && (
          <div className="mt-4 p-3 bg-green-500 text-white rounded-xl text-center font-bold text-xs animate-in zoom-in duration-300">
            ¡Registro guardado y enviado a validación!
          </div>
        )}
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, unit, icon }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </label>
    <div className="relative">
      <input 
        type="number" 
        value={value} 
        placeholder="0.00"
        onChange={e => onChange(e.target.value)} 
        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20" 
      />
      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">{unit}</span>
    </div>
  </div>
);

export default FormularioIngreso;
