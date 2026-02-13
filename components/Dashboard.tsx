
import React, { useState, useMemo, memo, lazy, Suspense } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { COLORS } from '../constants';
import AiInsights from './AiInsights';

// Code splitting for secondary dashboard components
const SavedRecordsWidget = lazy(() => import('./SavedRecordsWidget'));

const RAW_DATA = [
  { name: 'ENE', emissions: 310, capture: 290, balance: 20, history: [150, 120, 80, 20] },
  { name: 'FEB', emissions: 290, capture: 310, balance: -20, history: [20, -10, -15, -20] },
  { name: 'MAR', emissions: 320, capture: 330, balance: -10, history: [-20, -15, -12, -10] },
  { name: 'ABR', emissions: 280, capture: 350, balance: -70,  history: [-10, -30, -50, -70] },
  { name: 'MAY', emissions: 300, capture: 360, balance: -60, history: [-70, -65, -62, -60] },
  { name: 'JUN', emissions: 270, capture: 380, balance: -110, history: [-60, -80, -95, -110] },
];

const SOURCE_DISTRIBUTION = [
  { name: 'Diesel', value: 35, color: COLORS.forest },
  { name: 'Electricidad', value: 55, color: COLORS.primary },
  { name: 'Otros', value: 10, color: COLORS.blue500 },
];

const Sparkline = memo(({ data, color }: { data: number[], color: string }) => (
  <div className="h-10 w-full opacity-40 group-hover:opacity-100 transition-all duration-700 ease-out translate-y-2 group-hover:translate-y-0">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ v, i }))}>
        <Line 
          type="monotone" 
          dataKey="v" 
          stroke={color} 
          strokeWidth={3} 
          dot={false} 
          isAnimationActive={true}
          animationDuration={2000}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

const MiniKPICard = memo(({ title, value, unit, icon, trend, trendType, history, subtitle }: any) => {
  const isPos = trendType === 'pos';
  const color = isPos ? COLORS.primary : COLORS.red500;
  const bgColor = isPos ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  const textColor = isPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
  const trendIcon = isPos ? (trend.includes('-') ? 'trending_down' : 'trending_up') : 'trending_flat';

  return (
    <div className="bg-white dark:bg-[#121c13] p-7 rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[220px]">
      {/* Dynamic Background Glow */}
      <div className={`absolute -right-8 -top-8 size-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-1000 ${isPos ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
      
      <div>
        <div className="flex justify-between items-center mb-5">
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center text-white/90 shadow-lg transition-all duration-500 group-hover:rotate-6 ${isPos ? 'bg-primary/80' : 'bg-slate-700/80'}`}>
              <span className="material-symbols-outlined text-xl">{icon}</span>
            </div>
            <p className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
          </div>
          
          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${bgColor} transition-all duration-500 group-hover:px-3`}>
            <span className={`material-symbols-outlined text-[16px] ${textColor}`}>{trendIcon}</span>
            <span className={`text-[11px] font-black tracking-tighter ${textColor}`}>
              {trend}
            </span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-1">
          <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter transition-colors duration-500 group-hover:text-primary">
            {value}
          </h4>
          <span className="text-[12px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{unit}</span>
        </div>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold flex items-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <span className={`size-1.5 rounded-full ${isPos ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`}></span>
          {subtitle}
        </p>
      </div>

      <div className="mt-4 -mx-2">
        <Sparkline data={history || [1, 5, 2, 8]} color={color} />
      </div>
    </div>
  );
});

const ExecutiveHeader = memo(({ kpis }: any) => {
  const captureCompliance = 94; 
  const dashArray = 440;
  const dashOffset = dashArray - (dashArray * captureCompliance) / 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      <div className="lg:col-span-8 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <span className="material-symbols-outlined text-[120px]">leaderboard</span>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-primary/20 text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-primary/30">
              Resumen Ejecutivo Febrero 2026
            </span>
            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Puerto Columbo: <span className="text-primary text-glow">Liderazgo Carbono Negativo</span></h2>
          <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
            Estamos en 2026. Tras consolidar el Proyecto Vetiver, hemos alcanzado un balance negativo sostenido. Nuestra meta para 2027 es la autonomía energética total mediante hidrógeno verde.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Emisiones Brutas</p>
              <p className="text-2xl font-black text-white">{kpis.totalEmissions}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Balance Neto</p>
              <p className="text-2xl font-black text-primary">{kpis.netBalance}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia 2026</p>
              <p className="text-2xl font-black text-white">{kpis.efficiency} <span className="text-xs text-slate-500">kg/v</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Meta 2027</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="text-xs font-bold text-primary uppercase">En Ruta</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-center items-center text-center shadow-sm">
        <div className="relative size-44 flex items-center justify-center">
          <svg className="size-full -rotate-90">
            <circle cx="88" cy="88" r="70" className="stroke-slate-100 dark:stroke-white/5 fill-none" strokeWidth="14" />
            <circle cx="88" cy="88" r="70" className="stroke-primary fill-none transition-all duration-1000 ease-out" strokeWidth="14" strokeDasharray={dashArray} strokeDashoffset={dashOffset} strokeLinecap="round" style={{ filter: 'drop-shadow(0 0 8px rgba(17, 212, 33, 0.4))' }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black dark:text-white tracking-tighter">{captureCompliance}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Meta 2026</span>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Consolidación Operativa</p>
          <div className="flex items-center gap-2 justify-center mt-1">
             <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">Hacia 2027</span>
             <p className="text-[10px] text-slate-500 font-medium">Nueva meta de -1200t anuales</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const Dashboard: React.FC = () => {
  const [filter, setFilter] = useState('Anual');
  const chartData = useMemo(() => RAW_DATA, []);
  const pieData = useMemo(() => SOURCE_DISTRIBUTION, []);
  const kpis = useMemo(() => ({
    totalEmissions: "945.2",
    netBalance: "-110.3",
    reductionTrend: "-15.2%",
    efficiency: "8.1"
  }), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <style>{`
        .text-glow { text-shadow: 0 0 15px rgba(17, 212, 33, 0.4); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {['Semanal', 'Mensual', 'Trimestral', 'Anual'].map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtro 2026:</span>
          <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold dark:text-white focus:ring-primary">
            <option>Todas las fuentes</option>
            <option>Solo Bio-Captura</option>
            <option>Hidrógeno/Eléctrico</option>
          </select>
        </div>
      </div>

      <ExecutiveHeader kpis={kpis} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniKPICard title="Consumo Diesel" value="12,100" unit="L" icon="ev_station" trend="-75.2%" trendType="pos" history={[80, 60, 40, 25, 12]} subtitle="Remanente flota pesada 2026" />
        <MiniKPICard title="Captura Vetiver" value="1,340.5" unit="tCO₂" icon="eco" trend="+42.8%" trendType="pos" history={[60, 85, 110, 125, 134]} subtitle="Sistemas maduros Fase III" />
        <MiniKPICard title="Energía Solar/Eólica" value="85.4" unit="MWh" icon="solar_power" trend="+400%" trendType="pos" history={[20, 35, 50, 70, 85]} subtitle="Mix renovable Puerto Columbo" />
        <MiniKPICard title="Intensidad Carbono" value="0.14" unit="t/TEU" icon="analytics" trend="-82.1%" trendType="pos" history={[0.8, 0.6, 0.4, 0.2, 0.14]} subtitle="Métrica competitiva 2026" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Trayectoria Negativa Sostenida</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Evolución del balance neto en el primer semestre de 2026</p>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" t" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }} itemStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="balance" name="Balance Neto" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="lg:col-span-4 h-full">
          <Suspense fallback={<div className="h-full min-h-[400px] bg-slate-100 dark:bg-white/5 rounded-[32px] animate-pulse"></div>}>
            <SavedRecordsWidget />
          </Suspense>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AiInsights data={chartData} kpis={kpis} />
        </div>
        <div className="bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase self-start">Mix Operativo 2026</h3>
            <div className="flex-1 relative w-full h-[260px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value" stroke="none">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-900 dark:text-white">Neto</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuentes</span>
              </div>
            </div>
            <div className="mt-8 w-full space-y-3">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="size-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{item.name}</span>
                  </div>
                  <span className="font-black dark:text-white">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
