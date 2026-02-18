
import React, { useState, useMemo } from 'react';
import { useRegistros } from '../hooks/useRegistros';
import { formatNumber } from '../utils/format';

const EMISSION_FACTORS = {
  ELECTRICITY: 0.45, // kgCO2e/kWh (SEN - Promedio Nacional Chile / Chilquinta)
  DIESEL: 2.68,      // kgCO2e/L
};

// Factor estimado: 1 Sistema Vetiver maduro (~500m2) captura aprox 0.045 toneladas diarias en condiciones óptimas
const VETIVER_DAILY_CAPTURE_TONS = 0.045; 

const FormularioIngreso: React.FC = () => {
  const { insertRegistro } = useRegistros();
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Nuevo estado para el Factor de Emisión de Transporte (Default: 1)
  const [transportEF, setTransportEF] = useState('1');

  const [form, setForm] = useState({
    fechaInicio: new Date().toISOString().split('T')[0],
    fechaFin: new Date().toISOString().split('T')[0],
    trucks: '',
    containers: '', // N
    electricity: '',
    diesel: '',
    origen: ''
  });

  // Cálculo de emisiones
  // Incluye Electricidad + Diesel + Transporte (N * EF)
  const emisionesTotales = useMemo(() => {
    // 1. Electricidad
    const e = (parseFloat(form.electricity) || 0) * EMISSION_FACTORS.ELECTRICITY;
    
    // 2. Diesel (Maquinaria fija/otros)
    const d = (parseFloat(form.diesel) || 0) * EMISSION_FACTORS.DIESEL;
    
    // 3. Transporte Interno: E(N) = N * EF
    // N = número de contenedores (asumiendo 1 camión por contenedor, 1 km distancia)
    const n = parseInt(form.containers) || 0;
    const ef = parseFloat(transportEF) || 0;
    const t = n * ef;

    // Suma total en kg convertida a Toneladas
    return (e + d + t) / 1000; 
  }, [form.electricity, form.diesel, form.containers, transportEF]);

  // Cálculo solo del transporte para visualización (en kg)
  const emisionesTransporteKg = useMemo(() => {
    const n = parseInt(form.containers) || 0;
    const ef = parseFloat(transportEF) || 0;
    return n * ef;
  }, [form.containers, transportEF]);

  // Cálculo de Captura Vetiver (Basado en Rango de Fechas + Origen)
  const capturaTotal = useMemo(() => {
    // Regla de Negocio: San Antonio NO tiene sistema Vetiver
    if (form.origen === 'Puerto Columbo San Antonio') return 0;
    
    // Regla de Negocio: Valparaíso SÍ tiene Vetiver
    if (form.origen === 'Puerto Columbo Valparaíso') {
      const start = new Date(form.fechaInicio);
      const end = new Date(form.fechaFin);
      
      // Diferencia en milisegundos
      const diffTime = Math.abs(end.getTime() - start.getTime());
      // Convertir a días (sumamos 1 para incluir el día de inicio)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      if (diffDays > 0) {
        return diffDays * VETIVER_DAILY_CAPTURE_TONS;
      }
    }
    return 0;
  }, [form.origen, form.fechaInicio, form.fechaFin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.origen) {
      alert("Por favor seleccione un Origen");
      return;
    }
    
    if (new Date(form.fechaFin) < new Date(form.fechaInicio)) {
      alert("La fecha de término no puede ser anterior a la fecha de inicio.");
      return;
    }

    setIsSaving(true);

    try {
      await insertRegistro({
        fecha: form.fechaFin, // Se registra con la fecha de cierre para orden cronológico
        emisiones: emisionesTotales,
        captura: capturaTotal, 
        origen: form.origen,
        datos: {
          trucks: parseInt(form.trucks) || 0,
          containers: parseInt(form.containers) || 0,
          electricity: parseFloat(form.electricity) || 0,
          diesel: parseFloat(form.diesel) || 0,
          fechaInicio: form.fechaInicio,
          fechaFin: form.fechaFin,
          // Guardamos el EF usado para auditoría futura
          transportEF: parseFloat(transportEF) || 1 
        }
      });

      setShowSuccess(true);
      setForm({
        fechaInicio: new Date().toISOString().split('T')[0],
        fechaFin: new Date().toISOString().split('T')[0],
        trucks: '',
        containers: '',
        electricity: '',
        diesel: '',
        origen: ''
      });
      // Resetear EF al default o mantenerlo? Generalmente se mantiene, pero aquí lo reseteamos por seguridad
      setTransportEF('1'); 
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Selección de Origen Primero para definir lógica de Vetiver */}
          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origen (Terminal)</label>
            <select 
              required 
              value={form.origen} 
              onChange={e => setForm({...form, origen: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="" disabled>Seleccione terminal...</option>
              <option value="Puerto Columbo Valparaíso">Puerto Columbo Valparaíso (Con Sistema Vetiver)</option>
              <option value="Puerto Columbo San Antonio">Puerto Columbo San Antonio (Sin Captura)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Inicio</label>
            <input 
              type="date" 
              required 
              value={form.fechaInicio} 
              onChange={e => setForm({...form, fechaInicio: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha Término</label>
            <input 
              type="date" 
              required 
              value={form.fechaFin} 
              min={form.fechaInicio}
              onChange={e => setForm({...form, fechaFin: e.target.value})} 
              className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20" 
            />
          </div>
        </div>

        <div className="h-px bg-slate-100 dark:bg-white/5 my-6"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Sección Transporte Interno Mejorada */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-white/5 p-6 rounded-2xl border border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-orange-500">local_shipping</span>
              <h4 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">Cálculo Transporte Interno</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <InputGroup 
                  label="Camiones (Ref)" 
                  value={form.trucks} 
                  onChange={v => setForm({...form, trucks: v})} 
                  unit="uds" 
                  icon="front_loader" 
               />
               
               <InputGroup 
                  label="Contenedores (N)" 
                  value={form.containers} 
                  onChange={v => setForm({...form, containers: v})} 
                  unit="TEU" 
                  icon="box" 
               />

               <InputGroup 
                  label="Factor Emisión (EF)" 
                  value={transportEF} 
                  onChange={v => setTransportEF(v)} 
                  suffix="kgCO₂/km" 
                  icon="science" 
                  step="0.01"
                  placeholder="1.0"
               />
            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-slate-500 font-medium bg-white dark:bg-black/20 p-3 rounded-xl border border-slate-100 dark:border-white/5">
               <span className="uppercase tracking-widest">Fórmula: E(N) = N • EF</span>
               <div className="flex items-center gap-1">
                 <span>Resultado Parcial:</span>
                 <span className="font-black text-orange-500 text-xs">{formatNumber(emisionesTransporteKg, 1)} kgCO₂</span>
               </div>
            </div>
          </div>

          {/* Inputs Energéticos */}
          <InputGroup label="Electricidad" value={form.electricity} onChange={v => setForm({...form, electricity: v})} unit="kWh" icon="bolt" />
          <InputGroup label="Diesel (Maquinaria)" value={form.diesel} onChange={v => setForm({...form, diesel: v})} unit="Lts" icon="ev_station" />
        </div>

        <div className="mt-10 p-6 bg-primary/5 rounded-2xl border border-primary/20 flex flex-col gap-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             {/* Emisiones */}
             <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Emisiones Brutas Totales</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-slate-800 dark:text-white">{formatNumber(emisionesTotales, 4)}</span>
                  <span className="text-sm font-bold text-slate-500">tCO₂e</span>
                </div>
                <p className="text-[9px] text-slate-400 font-medium mt-1">Incluye Electricidad, Diesel y Transporte (N•EF)</p>
             </div>

             {/* Captura (Highlight) */}
             <div className={`
               relative p-4 rounded-xl border transition-all duration-300
               ${capturaTotal > 0 ? 'bg-green-100/50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-slate-100 dark:bg-white/5 border-transparent opacity-50'}
             `}>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">
                  {form.origen === 'Puerto Columbo Valparaíso' ? 'Captura Vetiver (Calculada)' : 'Captura Vetiver (No disponible)'}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">-{formatNumber(capturaTotal, 4)}</span>
                  <span className="text-sm font-bold text-primary/70">tCO₂e</span>
                </div>
                {capturaTotal > 0 && (
                   <div className="absolute top-2 right-2 text-[9px] font-bold bg-white dark:bg-black/40 px-2 py-1 rounded-full text-green-600">
                     AUTO-CALC
                   </div>
                )}
             </div>
          </div>
          
          <div className="h-px bg-primary/10"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-[9px] font-bold text-primary/60 uppercase tracking-wider space-y-1">
               <p className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">bolt</span> Factor Elec: {formatNumber(EMISSION_FACTORS.ELECTRICITY, 2)} kg/kWh</p>
               <p className="flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">ev_station</span> Factor Diesel: {formatNumber(EMISSION_FACTORS.DIESEL, 2)} kg/L</p>
               {form.origen === 'Puerto Columbo Valparaíso' && (
                 <p className="flex items-center gap-1 text-green-600"><span className="material-symbols-outlined text-[10px]">eco</span> Factor Vetiver: {formatNumber(VETIVER_DAILY_CAPTURE_TONS, 3)} t/día</p>
               )}
            </div>

            <button 
              type="submit" 
              disabled={isSaving || (!emisionesTotales && !capturaTotal)}
              className="w-full md:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-3"
            >
              {isSaving ? <span className="material-symbols-outlined animate-spin text-lg">sync</span> : <span className="material-symbols-outlined text-lg">save</span>}
              {isSaving ? 'GUARDANDO...' : 'GUARDAR REGISTRO'}
            </button>
          </div>
        </div>

        {showSuccess && (
          <div className="mt-4 p-3 bg-green-500 text-white rounded-xl text-center font-bold text-xs animate-in zoom-in duration-300">
            ¡Registro guardado exitosamente! El informe se ha actualizado.
          </div>
        )}
      </form>
    </div>
  );
};

const InputGroup = ({ label, value, onChange, unit, suffix, icon, step = "any", placeholder = "0" }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <span className="material-symbols-outlined text-sm">{icon}</span>
      {label}
    </label>
    <div className="relative">
      <input 
        type="number" 
        step={step}
        value={value} 
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)} 
        className={`w-full py-3 bg-white dark:bg-black/20 border-slate-200 dark:border-white/10 rounded-xl text-sm dark:text-white outline-none focus:ring-2 focus:ring-primary/20 shadow-sm
          ${unit ? 'pl-12' : 'pl-4'}
          ${suffix ? 'pr-20' : 'pr-4'}
        `}
      />
      {unit && <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">{unit}</span>}
      {suffix && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400 uppercase">{suffix}</span>}
    </div>
  </div>
);

export default FormularioIngreso;
