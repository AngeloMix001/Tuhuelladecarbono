
import React, { useState, useMemo } from 'react';
import { OperationData } from '../types';

const DataEntry: React.FC = () => {
  const [formData, setFormData] = useState<OperationData>({
    date: new Date().toISOString().split('T')[0],
    trucks: 0,
    containers: 0,
    electricity: 0,
    diesel: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchDate, setSearchDate] = useState('');

  // Mock historical data for searching
  const [historicalRecords, setHistoricalRecords] = useState<OperationData[]>([
    { date: '2024-10-24', trucks: 142, containers: 85, electricity: 450, diesel: 120 },
    { date: '2024-10-23', trucks: 188, containers: 110, electricity: 520, diesel: 155 },
    { date: '2024-10-21', trucks: 125, containers: 70, electricity: 380, diesel: 95 },
    { date: '2024-10-20', trucks: 98, containers: 55, electricity: 310, diesel: 80 },
    { date: '2024-10-19', trucks: 156, containers: 92, electricity: 480, diesel: 135 },
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'date' ? value : parseFloat(value) || 0
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Add the new record to the mock history
      setHistoricalRecords(prev => [formData, ...prev]);
      alert('Datos guardados exitosamente');
      // Reset form but keep date for convenience
      setFormData({
        ...formData,
        trucks: 0,
        containers: 0,
        electricity: 0,
        diesel: 0,
      });
    }, 1000);
  };

  const calculateEmissions = (data: OperationData) => {
    const tCO2e_elec = (data.electricity * 0.45) / 1000;
    const tCO2e_diesel = (data.diesel * 2.68) / 1000;
    return tCO2e_elec + tCO2e_diesel;
  };

  const filteredRecords = useMemo(() => {
    if (!searchDate) return historicalRecords;
    return historicalRecords.filter(rec => rec.date.includes(searchDate));
  }, [historicalRecords, searchDate]);

  const tCO2e_elec = (formData.electricity * 0.45) / 1000;
  const tCO2e_diesel = (formData.diesel * 2.68) / 1000;
  const totalEmissions = tCO2e_elec + tCO2e_diesel;

  return (
    <div className="p-4 md:p-10 space-y-6 md:space-y-10 pb-20">
      <header>
        <div className="flex items-center gap-2 text-slate-400 text-[10px] md:text-sm font-medium mb-1">
          <span>Gestión de CO₂</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
          <span className="text-slate-900 dark:text-white font-bold">Ingreso de Datos Operativos</span>
        </div>
        <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Registro de Actividad</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm md:text-lg">Complete los datos de la jornada para calcular la huella operacional.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-panel/40 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex items-center justify-between">
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm md:text-base">
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">analytics</span>
                Información de la Operación
              </h3>
              <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200 dark:bg-slate-700 px-2 md:px-3 py-1 rounded-full">Requerido</span>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 md:p-10 space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="col-span-1 md:col-span-2 space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base md:text-lg">calendar_today</span>
                    Fecha / Período
                  </label>
                  <input 
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base md:text-lg">local_shipping</span>
                    Camiones Ingresados
                  </label>
                  <div className="relative">
                    <input 
                      name="trucks"
                      type="number"
                      value={formData.trucks || ''}
                      placeholder="0"
                      onChange={handleInputChange}
                      className="w-full pl-14 md:pl-16 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
                    />
                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs md:text-sm font-bold border-r border-slate-200 dark:border-slate-700 pr-2 md:pr-3">uds</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base md:text-lg">inventory_2</span>
                    Contenedores
                  </label>
                  <div className="relative">
                    <input 
                      name="containers"
                      type="number"
                      value={formData.containers || ''}
                      placeholder="0"
                      onChange={handleInputChange}
                      className="w-full pl-14 md:pl-16 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
                    />
                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs md:text-sm font-bold border-r border-slate-200 dark:border-slate-700 pr-2 md:pr-3">GP</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base md:text-lg">bolt</span>
                    Consumo Eléctrico
                  </label>
                  <div className="relative">
                    <input 
                      name="electricity"
                      type="number"
                      value={formData.electricity || ''}
                      placeholder="0.00"
                      onChange={handleInputChange}
                      className="w-full pl-14 md:pl-16 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
                    />
                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs md:text-sm font-bold border-r border-slate-200 dark:border-slate-700 pr-2 md:pr-3">kWh</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base md:text-lg">ev_station</span>
                    Consumo Diesel
                  </label>
                  <div className="relative">
                    <input 
                      name="diesel"
                      type="number"
                      value={formData.diesel || ''}
                      placeholder="0.00"
                      onChange={handleInputChange}
                      className="w-full pl-14 md:pl-16 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 md:px-5 py-3 md:py-4 text-sm md:text-base focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
                    />
                    <span className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-400 text-xs md:text-sm font-bold border-r border-slate-200 dark:border-slate-700 pr-2 md:pr-3">Lts</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 md:pt-8 flex flex-col sm:flex-row gap-3 md:gap-4">
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-primary hover:bg-primary-dark text-white font-black py-3 md:py-4 px-6 md:px-8 rounded-xl md:rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 text-sm md:text-base"
                >
                  <span className="material-symbols-outlined text-xl md:text-2xl">{isLoading ? 'hourglass_top' : 'save'}</span>
                  {isLoading ? 'Procesando...' : 'Guardar Datos Operativos'}
                </button>
                <button 
                  type="reset"
                  onClick={() => setFormData({ date: new Date().toISOString().split('T')[0], trucks: 0, containers: 0, electricity: 0, diesel: 0 })}
                  className="px-6 md:px-8 py-3 md:py-4 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 font-bold rounded-xl md:rounded-2xl transition-all border border-slate-200 dark:border-slate-700 text-sm md:text-base"
                >
                  Limpiar Formulario
                </button>
              </div>
            </form>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-2xl md:rounded-3xl p-4 md:p-6 flex gap-4 md:gap-6 items-start">
            <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">info</span>
            <div>
              <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <strong>Nota Importante:</strong> Los factores de emisión de la red eléctrica nacional y los coeficientes de combustión de diesel se actualizan según las normativas del Ministerio de Medio Ambiente (V.2023). 
                Asegúrese de ingresar valores netos de facturación mensual para mayor precisión.
              </p>
            </div>
          </div>
        </div>

        {/* Real-time Summary Sidebar */}
        <div className="space-y-6 md:space-y-8">
          <div className="bg-slate-panel rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-2xl border border-slate-700/50">
            <div className="flex items-center justify-between mb-8 md:mb-10">
              <h3 className="text-[10px] md:text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Estimación Real</h3>
              <span className="size-2 md:size-2.5 bg-primary rounded-full animate-pulse shadow-glow"></span>
            </div>

            <div className="space-y-6 md:space-y-8">
              <div className="flex justify-between items-end border-b border-white/10 pb-5 md:pb-6">
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">tCO₂ Electricidad</p>
                  <p className="text-2xl md:text-3xl font-black font-mono">{tCO2e_elec.toFixed(2)}</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-xl md:text-2xl">bolt</span>
              </div>

              <div className="flex justify-between items-end border-b border-white/10 pb-5 md:pb-6">
                <div>
                  <p className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">tCO₂ Combustible</p>
                  <p className="text-2xl md:text-3xl font-black font-mono">{tCO2e_diesel.toFixed(2)}</p>
                </div>
                <span className="material-symbols-outlined text-slate-500 text-xl md:text-2xl">oil_barrel</span>
              </div>

              <div className="bg-primary/20 rounded-xl md:rounded-2xl p-5 md:p-6 border border-primary/40 backdrop-blur-sm">
                <p className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">Emisiones Totales Diarias</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl md:text-5xl font-black font-mono text-primary leading-none">{totalEmissions.toFixed(2)}</span>
                  <span className="text-xs md:text-sm font-black text-primary/70">tCO₂e</span>
                </div>
              </div>
            </div>

            <div className="mt-8 md:mt-10 space-y-2 md:space-y-3">
              <div className="bg-slate-800/60 p-3 md:p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-500 text-base md:text-lg">local_shipping</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-300">Intensidad / Camión</span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-white">{formData.trucks > 0 ? (totalEmissions / formData.trucks).toFixed(4) : '--'} tCO₂</span>
              </div>
              <div className="bg-slate-800/60 p-3 md:p-4 rounded-xl flex items-center justify-between border border-white/5">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-500 text-base md:text-lg">inventory_2</span>
                  <span className="text-[10px] md:text-xs font-bold text-slate-300">Intensidad / Cont.</span>
                </div>
                <span className="text-[10px] md:text-xs font-black text-white">{formData.containers > 0 ? (totalEmissions / formData.containers).toFixed(4) : '--'} tCO₂</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Historical Records Section */}
      <section className="mt-12 space-y-8">
        <div className="bg-white dark:bg-slate-panel/40 rounded-2xl md:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-3 text-sm md:text-lg">
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">search</span>
                Búsqueda de Registros Históricos
              </h3>
              <p className="text-xs text-slate-400 font-medium">Filtre y visualice registros anteriores almacenados en el sistema.</p>
            </div>
            <div className="relative w-full md:w-64">
              <input 
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all dark:text-white"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 text-lg pointer-events-none">calendar_month</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fecha</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Camiones</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Cont. (GP)</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Electricidad</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Diesel</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total tCO₂e</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((rec, idx) => {
                    const emissions = calculateEmissions(rec);
                    return (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">history</span>
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-200">{rec.date}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-sm font-mono text-slate-600 dark:text-slate-400 text-right">{rec.trucks}</td>
                        <td className="px-6 py-5 text-sm font-mono text-slate-600 dark:text-slate-400 text-right">{rec.containers}</td>
                        <td className="px-6 py-5 text-sm font-mono text-slate-600 dark:text-slate-400 text-right">{rec.electricity} <span className="text-[10px] text-slate-400">kWh</span></td>
                        <td className="px-6 py-5 text-sm font-mono text-slate-600 dark:text-slate-400 text-right">{rec.diesel} <span className="text-[10px] text-slate-400">L</span></td>
                        <td className="px-6 py-5 text-right">
                          <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
                            {emissions.toFixed(3)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400 text-sm font-medium">
                      <span className="material-symbols-outlined block text-3xl mb-2 opacity-20">sentiment_dissatisfied</span>
                      No se encontraron registros para esta fecha.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DataEntry;
