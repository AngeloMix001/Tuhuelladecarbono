
import React, { useState, useEffect } from 'react';

// Simplified emission factors
const FACTORS = {
  ELECTRICITY: 0.16, // kgCO2 per kWh
  DIESEL: 2.68,      // kgCO2 per Liter
};

const DataInput: React.FC = () => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    trucks: '',
    containers: '',
    electricity: '',
    diesel: ''
  });

  const [estimations, setEstimations] = useState({
    electricityCo2: 0,
    dieselCo2: 0,
    total: 0
  });

  useEffect(() => {
    const elecCo2 = (parseFloat(formData.electricity) || 0) * FACTORS.ELECTRICITY;
    const dieselCo2 = (parseFloat(formData.diesel) || 0) * FACTORS.DIESEL;
    const total = elecCo2 + dieselCo2;

    setEstimations({
      electricityCo2: elecCo2 / 1000, // Convert to tCO2
      dieselCo2: dieselCo2 / 1000,
      total: total / 1000
    });
  }, [formData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Datos guardados: ${estimations.total.toFixed(4)} tCO2e proyectados para esta jornada.`);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Registro de Actividad</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Complete los datos de la jornada para calcular la huella de carbono operacional.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Form Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Información de la Operación
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded">Requerido</span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-1 md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  Fecha / Período
                </label>
                <input 
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-primary focus:border-primary dark:text-white" 
                  type="date" 
                />
              </div>

              <InputField label="Camiones Ingresados" name="trucks" unit="uds" icon="local_shipping" value={formData.trucks} onChange={handleInputChange} />
              <InputField label="Contenedores" name="containers" unit="TEU" icon="box" value={formData.containers} onChange={handleInputChange} />
              <InputField label="Consumo Eléctrico" name="electricity" unit="kWh" icon="bolt" value={formData.electricity} onChange={handleInputChange} />
              <InputField label="Consumo Diesel" name="diesel" unit="Lts" icon="ev_station" value={formData.diesel} onChange={handleInputChange} />

              <div className="col-span-1 md:col-span-2 pt-4 flex gap-4">
                <button className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20" type="submit">
                  <span className="material-symbols-outlined">save</span>
                  Guardar Datos
                </button>
                <button 
                  onClick={() => setFormData({ date: new Date().toISOString().split('T')[0], trucks: '', containers: '', electricity: '', diesel: '' })}
                  className="px-6 py-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 font-bold rounded-lg transition-colors border border-slate-200 dark:border-white/10" 
                  type="button"
                >
                  Limpiar
                </button>
              </div>
            </form>
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 flex gap-4">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong>Nota:</strong> Los factores de emisión se actualizan mensualmente según las normativas del Ministerio de Medio Ambiente. Asegúrese de ingresar los valores netos de facturación.
            </p>
          </div>
        </div>

        {/* Real-time Summary Sidebar */}
        <div className="space-y-6 lg:sticky lg:top-24">
          <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl border border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center justify-between">
              Estimación Real
              <span className={`size-2 bg-primary rounded-full ${estimations.total > 0 ? 'animate-pulse' : ''}`}></span>
            </h3>
            
            <div className="space-y-6">
              <EstimationRow label="tCO₂ Electricidad" value={estimations.electricityCo2.toFixed(4)} icon="bolt" />
              <EstimationRow label="tCO₂ Diesel" value={estimations.dieselCo2.toFixed(4)} icon="oil_barrel" />
              
              <div className="bg-primary/10 rounded-lg p-4 border border-primary/30">
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1">Emisiones Totales</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-primary">{estimations.total.toFixed(4)}</span>
                  <span className="text-sm font-bold text-primary/70">tCO₂e</span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <IntensityRow 
                label="Intensidad / Camión" 
                value={formData.trucks && estimations.total > 0 ? `${(estimations.total / parseFloat(formData.trucks)).toFixed(4)} tCO₂` : "-- tCO₂"} 
              />
              <IntensityRow 
                label="Intensidad / Cont." 
                value={formData.containers && estimations.total > 0 ? `${(estimations.total / parseFloat(formData.containers)).toFixed(4)} tCO₂` : "-- tCO₂"} 
              />
            </div>
          </div>

          <RecentRecords />
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string, name: string, unit: string, icon: string, value: string, onChange: (e: any) => void }> = ({ label, name, unit, icon, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </label>
    <div className="relative">
      <input 
        name={name}
        value={value}
        onChange={onChange}
        className="w-full pl-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-primary focus:border-primary dark:text-white" 
        placeholder="0.00" 
        type="number" 
      />
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[10px] font-bold uppercase">{unit}</span>
    </div>
  </div>
);

const EstimationRow: React.FC<{ label: string, value: string, icon: string }> = ({ label, value, icon }) => (
  <div className="flex justify-between items-end border-b border-slate-800 pb-4">
    <div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-white tracking-tight">{value}</p>
    </div>
    <span className="material-symbols-outlined text-slate-600">{icon}</span>
  </div>
);

const IntensityRow: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="bg-slate-800/40 p-3 rounded-lg flex items-center justify-between border border-slate-700/50">
    <div className="flex items-center gap-2">
      <span className="material-symbols-outlined text-xs text-slate-500">trending_up</span>
      <span className="text-xs font-medium text-slate-300">{label}</span>
    </div>
    <span className="text-xs font-bold text-white">{value}</span>
  </div>
);

const RecentRecords: React.FC = () => (
  <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-6 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-slate-800 dark:text-white">Últimos Registros</h4>
      <button className="text-[10px] font-bold text-primary hover:underline">Ver todo</button>
    </div>
    <div className="space-y-3">
      <RecordItem date="24" month="Oct" value="12.4 tCO₂e" detail="142 camiones" status="success" />
      <RecordItem date="23" month="Oct" value="15.8 tCO₂e" detail="188 camiones" status="success" />
      <RecordItem date="22" month="Oct" value="Feriado" detail="Sin actividad" status="blocked" />
    </div>
  </div>
);

const RecordItem: React.FC<{ date: string, month: string, value: string, detail: string, status: string }> = ({ date, month, value, detail, status }) => (
  <div className={`flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-l-4 ${status === 'success' ? 'border-primary' : 'border-slate-200'}`}>
    <div className="text-center min-w-[32px]">
      <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">{month}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{date}</p>
    </div>
    <div className="flex-1">
      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">{value}</p>
      <p className="text-[10px] text-slate-500">{detail}</p>
    </div>
    <span className={`material-symbols-outlined text-sm ${status === 'success' ? 'text-primary' : 'text-slate-300'}`}>
      {status === 'success' ? 'check_circle' : 'block'}
    </span>
  </div>
);

export default DataInput;
