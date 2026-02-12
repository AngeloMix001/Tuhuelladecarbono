import React, { useState, useMemo, memo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { COLORS } from '../constants';
import AiInsights from './AiInsights';

// --- DATOS MOCK OPTIMIZADOS ---
const RAW_DATA = [
  { name: 'ENE', emissions: 400, capture: 120, balance: 280, history: [200, 240, 220, 280] },
  { name: 'FEB', emissions: 350, capture: 180, balance: 170, history: [280, 210, 190, 170] },
  { name: 'MAR', emissions: 420, capture: 250, balance: 170, history: [170, 200, 180, 170] },
  { name: 'ABR', emissions: 320, capture: 300, balance: 20,  history: [170, 100, 60, 20] },
  { name: 'MAY', emissions: 380, capture: 280, balance: 100, history: [20, 50, 80, 100] },
  { name: 'JUN', emissions: 310, capture: 340, balance: -30, history: [100, 50, 10, -30] },
];

const SOURCE_DISTRIBUTION = [
  { name: 'Diesel', value: 65, color: COLORS.forest },
  { name: 'Electricidad', value: 25, color: COLORS.primary },
  { name: 'Otros', value: 10, color: COLORS.blue500 },
];

// --- COMPONENTES AUXILIARES MEMOIZADOS ---

const Sparkline = memo(({ data, color }: { data: number[], color: string }) => (
  <div className="h-10 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ v, i }))}>
        <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

const MiniKPICard = memo(({ title, value, unit, icon, trend, trendType, history, subtitle }: any) => {
  const isPos = trendType === 'pos';
  const color = isPos ? COLORS.primary : COLORS.red500;

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[24px] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md transition-all group">
      <div className="flex justify-between items-start mb-4">
        <div className={`size-12 rounded-xl flex items-center justify-center text-white shadow-lg ${isPos ? 'bg-primary' : 'bg-slate-800'}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <Sparkline data={history || [1, 5, 2, 8]} color={color} />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</p>
          <span className={`text-[10px] font-bold ${isPos ? 'text-primary' : 'text-red-500'}`}>
            {trend}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
          <span className="text-sm font-bold text-slate-400">{unit}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 font-medium italic">{subtitle}</p>
      </div>
    </div>
  );
});

const ExecutiveHeader = memo(({ kpis }: any) => {
  const captureCompliance = 84; 
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
              Resumen Ejecutivo Junio 2024
            </span>
            <span className="size-2 rounded-full bg-primary animate-pulse"></span>
          </div>
          <h2 className="text-4xl font-black tracking-tighter mb-2">Puerto Columbo está en <span className="text-primary text-glow">Camino al Cero Neto</span></h2>
          <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
            Este mes hemos superado la meta de captura gracias a la maduración del Proyecto Vetiver Fase II. Las emisiones totales bajaron un 5.2% respecto al promedio trimestral.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-10">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Emisiones</p>
              <p className="text-2xl font-black text-white">{kpis.totalEmissions}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Balance Neto</p>
              <p className="text-2xl font-black text-primary">{kpis.netBalance}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia</p>
              <p className="text-2xl font-black text-white">{kpis.efficiency} <span className="text-xs text-slate-500">kg/v</span></p>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Global</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="material-symbols-outlined text-primary">verified</span>
                <span className="text-xs font-bold text-primary uppercase">Óptimo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[32px] p-8 flex flex-col justify-center items-center text-center shadow-sm">
        <div className="relative size-44 flex items-center justify-center">
          <svg className="size-full -rotate-90">
            <circle cx="88" cy="88" r="70" className="stroke-slate-100 dark:stroke-white/5 fill-none" strokeWidth="14" />
            <circle 
              cx="88" 
              cy="88" 
              r="70" 
              className="stroke-primary fill-none transition-all duration-1000 ease-out" 
              strokeWidth="14" 
              strokeDasharray={dashArray} 
              strokeDashoffset={dashOffset} 
              strokeLinecap="round" 
              style={{ filter: 'drop-shadow(0 0 8px rgba(17, 212, 33, 0.4))' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black dark:text-white tracking-tighter">{captureCompliance}%</span>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Meta 2024</span>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Cumplimiento de Captura</p>
          <div className="flex items-center gap-2 justify-center mt-1">
             <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest">En Trayectoria</span>
             <p className="text-[10px] text-slate-500 font-medium">Ahorro de +520t vs Proyección</p>
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

  // OPTIMIZACIÓN: Memoización de KPIs para evitar re-renders en AiInsights
  const kpis = useMemo(() => ({
    totalEmissions: "1,245.8",
    netBalance: "850.3",
    reductionTrend: "-5.2%",
    efficiency: "12.4"
  }), []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      <style>{`
        .text-glow { text-shadow: 0 0 15px rgba(17, 212, 33, 0.4); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>

      {/* BARRA DE FILTROS PROFESIONAL */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white dark:bg-white/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {['Semanal', 'Mensual', 'Trimestral', 'Anual'].map((f) => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-slate-600 dark:hover:text-white'}`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fuente:</span>
          <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold dark:text-white focus:ring-primary">
            <option>Todas las fuentes</option>
            <option>Solo Diesel</option>
            <option>Solo Eléctrico</option>
          </select>
        </div>
      </div>

      {/* HEADER EJECUTIVO */}
      <ExecutiveHeader kpis={kpis} />

      {/* KPI GRID - 12 COLUMNAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MiniKPICard 
          title="Consumo Diesel" 
          value="45,200" 
          unit="L" 
          icon="ev_station" 
          trend="+1.2%" 
          trendType="neg" 
          history={[40, 42, 45, 43, 45]}
          subtitle="Flota de grúas y camiones"
        />
        <MiniKPICard 
          title="Captura Vetiver" 
          value="340.5" 
          unit="tCO₂" 
          icon="eco" 
          trend="+12.8%" 
          trendType="pos" 
          history={[10, 15, 22, 28, 34]}
          subtitle="Sumideros biológicos activos"
        />
        <MiniKPICard 
          title="Energía Solar" 
          value="15.4" 
          unit="MWh" 
          icon="solar_power" 
          trend="+8.5%" 
          trendType="pos" 
          history={[8, 10, 12, 14, 15]}
          subtitle="Generación propia parque"
        />
        <MiniKPICard 
          title="Intensidad Carbono" 
          value="0.84" 
          unit="t/TEU" 
          icon="analytics" 
          trend="-2.1%" 
          trendType="pos" 
          history={[1.2, 1.1, 0.95, 0.88, 0.84]}
          subtitle="Métrica de eficiencia operativa"
        />
      </div>

      {/* SECCIÓN GRÁFICA PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Curva de Descarbonización</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Comparativa entre emisiones brutas y captura biológica</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-primary"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Neto</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-slate-200"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Objetivo</span>
               </div>
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
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="balance" name="Neto" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 tracking-tight uppercase self-start">Fuentes de Emisión</h3>
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
              <span className="text-3xl font-black text-slate-900 dark:text-white">CO₂</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribución</span>
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

      <AiInsights data={chartData} kpis={kpis} />
    </div>
  );
};

export default Dashboard;