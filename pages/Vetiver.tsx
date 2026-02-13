
import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const growthData = [
  { month: 'Ene', capture: 45, meta: 40 },
  { month: 'Feb', capture: 52, meta: 45 },
  { month: 'Mar', capture: 61, meta: 50 },
  { month: 'Abr', capture: 58, meta: 55 },
  { month: 'May', capture: 72, meta: 60 },
  { month: 'Jun', capture: 85, meta: 65 },
];

const parcelStats = [
  { name: 'Zona Norte', health: 95, color: '#11d421' },
  { name: 'Barrera Este', health: 88, color: '#4c9a52' },
  { name: 'Terminal A2', health: 92, color: '#0ea31a' },
  { name: 'Acceso Sur', health: 75, color: '#fbbf24' },
];

const Vetiver: React.FC = () => {
  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-10 pb-24">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-black text-[10px] md:text-xs uppercase tracking-[0.2em] mb-2">
            <span className="material-symbols-outlined text-base">psychiatry</span>
            Soluciones Basadas en la Naturaleza
          </div>
          <h1 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Monitoreo Proyecto Vetiver</h1>
          <p className="text-slate-500 text-sm md:text-lg mt-1 font-medium">Gestión avanzada de barreras vivas para la captura de carbono.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-slate-200 dark:bg-slate-panel dark:border-slate-700 rounded-xl md:rounded-2xl text-xs md:text-sm font-black text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm">
            <span className="material-symbols-outlined text-lg">analytics</span>
            Reporte
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-primary text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            <span className="material-symbols-outlined text-lg">add_location_alt</span>
            Plantación
          </button>
        </div>
      </header>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          { label: 'Total Capturado', value: '850.3', unit: 'tCO₂e', desc: 'Acumulado 2024', icon: 'eco' },
          { label: 'Área Plantada', value: '450', unit: 'm²', desc: '12 parcelas', icon: 'potted_plant' },
          { label: 'Eficiencia Media', value: '5.2', unit: 'kg/m²', desc: 'Rendimiento', icon: 'speed' },
          { label: 'Salud Vegetal', value: '91', unit: '%', desc: 'Índice NDVI', icon: 'health_and_safety' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-panel/40 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm group hover:border-primary/30 transition-all duration-500">
            <div className="flex items-center justify-between mb-4">
              <span className="size-10 md:size-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <span className="material-symbols-outlined text-xl md:text-2xl">{stat.icon}</span>
              </span>
              <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors text-lg md:text-xl">trending_up</span>
            </div>
            <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
              <span className="text-xs font-bold text-slate-400">{stat.unit}</span>
            </div>
            <p className="text-[10px] md:text-xs font-bold text-slate-500 mt-2 md:mt-3">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Progress Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-panel/40 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 md:mb-10 gap-4">
            <div>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Curva de Reducción Mensual</h3>
              <p className="text-xs md:text-sm text-slate-400 font-medium">Captura real vs. Proyección</p>
            </div>
            <div className="flex gap-4 self-start sm:self-auto">
              <div className="flex items-center gap-2">
                <div className="size-2 md:size-3 rounded-full bg-primary"></div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">Real</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 md:size-3 rounded-full bg-slate-200"></div>
                <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase">Meta</span>
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorCapture" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#11d421" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#11d421" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="meta" stroke="#e2e8f0" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                <Area type="monotone" dataKey="capture" stroke="#11d421" fillOpacity={1} fill="url(#colorCapture)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Health Progress */}
        <div className="bg-white dark:bg-slate-panel/40 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white mb-1">Estatus por Parcela</h3>
          <p className="text-xs md:text-sm text-slate-400 font-medium mb-8 md:mb-10">Índice NDVI por zona</p>
          <div className="space-y-6 md:space-y-8">
            {parcelStats.map((parcel, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs md:text-sm font-black text-slate-700 dark:text-slate-200">{parcel.name}</span>
                  <span className="text-xs md:text-sm font-black text-primary">{parcel.health}%</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${parcel.health}%`, backgroundColor: parcel.color }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 md:mt-12 bg-primary/5 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-primary/10">
            <div className="flex items-center gap-3 mb-3">
              <span className="material-symbols-outlined text-primary text-xl">verified</span>
              <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Alerta de Monitoreo</p>
            </div>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-medium">
              La zona "Acceso Sur" requiere inspección técnica por variaciones en el drenaje.
            </p>
          </div>
        </div>
      </div>

      {/* Visual Monitoring Section */}
      <section className="bg-slate-900 rounded-2xl md:rounded-[3rem] p-6 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent"></div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
          <div className="flex-1 space-y-4 md:space-y-6">
            <div className="inline-flex px-3 py-1.5 bg-white/10 rounded-full border border-white/10 text-primary text-[9px] md:text-[10px] font-black uppercase tracking-widest">
              Inspección Q2 2024
            </div>
            <h3 className="text-2xl md:text-4xl font-black text-white tracking-tight leading-tight">Registro Visual de Innovación</h3>
            <p className="text-slate-400 text-sm md:text-lg leading-relaxed max-w-xl">
              Integración de monitoreo satelital con cultivos regenerativos de alta densidad para regeneración de suelos.
            </p>
            <div className="flex gap-3 md:gap-4">
              <div className="flex-1 sm:flex-none text-center bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacidad</p>
                <p className="text-xl md:text-2xl font-black text-white">450 m²</p>
              </div>
              <div className="flex-1 sm:flex-none text-center bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/10">
                <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Reducción</p>
                <p className="text-xl md:text-2xl font-black text-white">420 tCO₂</p>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[45%] grid grid-cols-2 gap-3 md:gap-4">
            <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white/5 group">
              <img src="https://viverolasmargaritas.com.ar/wp-content/uploads/2024/08/IMG_6098-scaled.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Vetiver 1" />
            </div>
            <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white/5 group mt-4 md:mt-8">
              <img src="https://d22fxaf9t8d39k.cloudfront.net/9d960e8f8645b4c5b2bcf8292d64a030339c858f1f0f0264abe628f4bf921ade79214.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Vetiver 2" />
            </div>
            <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white/5 group -mt-4 md:-mt-8">
              <img src="https://7c7e84a7bc.cbaul-cdnwnd.com/db57ceb7b2ccbf847566361847ce3fae/200000005-85cc986cbc/semilla-de-pasto-vetiver-para-control-de-erosion_6.jpg?ph=7c7e84a7bc" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Vetiver 3" />
            </div>
            <div className="aspect-square rounded-2xl md:rounded-3xl overflow-hidden border-2 md:border-4 border-white/5 group">
              <img src="https://www.vetivercostarica.com/wp-content/uploads/2010/06/BA04-PP_Page_26-1.jpg" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Vetiver 4" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vetiver;
