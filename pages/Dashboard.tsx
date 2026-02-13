
import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { KPI } from '../types';

interface ExtendedKPI extends KPI {
  history: { val: number }[];
  details: string;
}

const dataMonthly = [
  { name: 'ENE', emissions: 120, capture: 45 },
  { name: 'FEB', emissions: 150, capture: 48 },
  { name: 'MAR', emissions: 130, capture: 52 },
  { name: 'ABR', emissions: 170, capture: 55 },
  { name: 'MAY', emissions: 140, capture: 64 },
  { name: 'JUN', emissions: 110, capture: 70 },
];

const dataEmissionsSources = [
  { name: 'Diesel', value: 70, color: '#1c5525' },
  { name: 'Electricidad', value: 30, color: '#11d421' },
];

const kpis: ExtendedKPI[] = [
  { 
    label: 'tCO₂ Total', 
    value: '1,245.8', 
    unit: 'tCO₂e', 
    trend: '+2.1% tCO₂e', 
    trendUp: false, 
    icon: 'factory', 
    description: 'Acumulado anual 2024',
    history: [{val: 100}, {val: 110}, {val: 105}, {val: 120}, {val: 115}, {val: 125}],
    details: 'Este valor representa la suma de todas las emisiones de Alcance 1 y 2 registradas durante el presente año fiscal, incluyendo flota propia y consumo energético de terminales.'
  },
  { 
    label: 'vs. Mes Anterior', 
    value: '64.2', 
    unit: 'tCO₂e', 
    trend: '-5.2% mes', 
    trendUp: true, 
    icon: 'trending_down', 
    description: 'Reducción por eficiencia',
    history: [{val: 80}, {val: 75}, {val: 70}, {val: 72}, {val: 68}, {val: 64}],
    details: 'La comparación mensual muestra una tendencia a la baja gracias a la optimización de rutas de camiones y el recambio de luminarias a tecnología LED de bajo consumo.'
  },
  { 
    label: 'Balance Neto', 
    value: '850.3', 
    unit: 'tCO₂e', 
    trend: 'Net Zero Goal', 
    trendUp: true, 
    icon: 'balance', 
    description: 'Emisiones - Captura',
    history: [{val: 400}, {val: 450}, {val: 500}, {val: 600}, {val: 750}, {val: 850}],
    details: 'El balance neto considera el secuestro biológico de carbono realizado por nuestras plantaciones de Vetiver. Estamos a un 15% de alcanzar la neutralidad en operaciones críticas.'
  },
  { 
    label: 'Intensidad', 
    value: '12.4', 
    unit: 'kg CO₂', 
    trend: 'En Meta', 
    trendUp: true, 
    icon: 'local_shipping', 
    description: 'Promedio por flota',
    history: [{val: 15}, {val: 14.5}, {val: 14}, {val: 13.2}, {val: 12.8}, {val: 12.4}],
    details: 'Calculado como kg de CO₂ emitidos por cada unidad de transporte que ingresa al puerto. El objetivo es bajar de 10.0 kg para finales del Q4.'
  },
];

const Dashboard: React.FC = () => {
  const [selectedKPIIndex, setSelectedKPIIndex] = useState<number | null>(null);
  const selectedKPI = selectedKPIIndex !== null ? kpis[selectedKPIIndex] : null;

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-6 md:space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Panel de Control CO₂</h1>
          <p className="text-slate-500 text-sm md:text-lg">Monitoreo de impacto ambiental y secuestro de carbono.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-panel dark:border-slate-700 border border-slate-200 rounded-xl text-xs md:text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-lg md:text-xl">download</span>
            Exportar
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl text-xs md:text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95">
            <span className="material-symbols-outlined text-lg md:text-xl">sync</span>
            Actualizar
          </button>
        </div>
      </header>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {kpis.map((kpi, idx) => (
          <button 
            key={idx} 
            onClick={() => setSelectedKPIIndex(selectedKPIIndex === idx ? null : idx)}
            className={`group relative text-left bg-white dark:bg-slate-panel/40 p-6 rounded-3xl border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl overflow-hidden ${
              selectedKPIIndex === idx 
                ? 'border-primary ring-4 ring-primary/10 shadow-xl' 
                : 'border-slate-200 dark:border-slate-800 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-6 relative z-10">
              <span className={`size-10 md:size-12 flex items-center justify-center rounded-2xl transition-colors ${
                selectedKPIIndex === idx ? 'bg-primary text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'
              }`}>
                <span className={`material-symbols-outlined text-xl md:text-2xl ${selectedKPIIndex === idx ? 'material-symbols-fill' : ''}`}>{kpi.icon}</span>
              </span>
              <span className={`text-[9px] md:text-[10px] font-black px-2 md:px-3 py-1 md:py-1.5 rounded-full uppercase tracking-wider ${
                kpi.trendUp ? 'bg-primary/10 text-primary' : 'bg-red-50 text-red-500'
              }`}>
                {kpi.trend}
              </span>
            </div>

            <div className="relative z-10">
              <p className="text-slate-500 text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{kpi.value}</h3>
                <span className="text-xs font-bold text-slate-400">{kpi.unit}</span>
              </div>
            </div>

            <div className="h-10 w-full mt-4 -mx-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={kpi.history}>
                  <Area 
                    type="monotone" 
                    dataKey="val" 
                    stroke={kpi.trendUp ? '#11d421' : '#ef4444'} 
                    strokeWidth={2}
                    fillOpacity={0.1} 
                    fill={kpi.trendUp ? '#11d421' : '#ef4444'} 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <p className="text-[10px] text-slate-400 mt-4 font-medium flex items-center justify-between">
              {kpi.description}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </p>
          </button>
        ))}
      </div>

      {/* KPI Details (Conditional View) */}
      {selectedKPI && (
        <div className="bg-slate-panel text-white rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-10 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 overflow-hidden">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-start">
            <div className="flex-1 space-y-4 md:space-y-6">
              <div className="flex items-center gap-4">
                <span className="size-10 md:size-14 bg-primary rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-xl">
                  <span className="material-symbols-outlined text-2xl md:text-3xl material-symbols-fill">{selectedKPI.icon}</span>
                </span>
                <div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight">{selectedKPI.label}</h2>
                  <p className="text-slate-400 text-xs md:text-sm font-medium">Análisis detallado de métrica</p>
                </div>
              </div>
              <p className="text-slate-300 text-sm md:text-lg leading-relaxed">
                {selectedKPI.details}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4">
                <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Máximo</p>
                  <p className="text-sm md:text-xl font-bold">{Math.max(...selectedKPI.history.map(h => h.val))} {selectedKPI.unit}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Promedio</p>
                  <p className="text-sm md:text-xl font-bold">{selectedKPI.value} {selectedKPI.unit}</p>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl">
                  <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Tendencia</p>
                  <p className="text-sm md:text-xl font-bold">{selectedKPI.trend}</p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3 bg-white/5 p-6 rounded-2xl border border-white/10 h-full">
              <h4 className="text-sm font-black uppercase tracking-widest mb-4">Composición Histórica</h4>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedKPI.history}>
                    <Bar dataKey="val" fill="#11d421" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
        <div className="bg-white dark:bg-slate-panel/40 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8 md:mb-10">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Emisiones vs. Captura</h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Comparativa mensual acumulada</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-primary"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Captura</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataMonthly}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="emissions" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                <Bar dataKey="capture" fill="#11d421" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-panel/40 p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Fuentes de Emisión</h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium mb-8">Distribución por tipo de combustible/energía</p>
          <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
            <div className="w-full md:w-1/2 h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataEmissionsSources}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {dataEmissionsSources.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
              {dataEmissionsSources.map((source, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="size-3 rounded-full" style={{backgroundColor: source.color}}></div>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{source.name}</span>
                  </div>
                  <span className="text-sm font-black text-slate-900 dark:text-white">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
