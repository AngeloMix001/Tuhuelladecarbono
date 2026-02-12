import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, ComposedChart, Line
} from 'recharts';
import { COLORS } from '../constants';
import AiInsights from './AiInsights';

const EVOLUTION_DATA = [
  { name: 'ENE', emissions: 400, capture: 120, balance: 280, target: 300 },
  { name: 'FEB', emissions: 350, capture: 180, balance: 170, target: 280 },
  { name: 'MAR', emissions: 420, capture: 250, balance: 170, target: 260 },
  { name: 'ABR', emissions: 320, capture: 300, balance: 20, target: 240 },
  { name: 'MAY', emissions: 380, capture: 280, balance: 100, target: 220 },
  { name: 'JUN', emissions: 310, capture: 340, balance: -30, target: 200 },
];

const SOURCE_DATA = [
  { name: 'Diesel (Grúas)', value: 70 },
  { name: 'Electricidad', value: 30 },
];

const PulsingDot = (props: any) => {
  const { cx, cy, payload } = props;
  if (payload.name !== 'JUN') return null;

  return (
    <g>
      <circle cx={cx} cy={cy} r={8} fill={COLORS.primary} className="animate-ping opacity-75" />
      <circle cx={cx} cy={cy} r={6} fill={COLORS.primary} stroke="#fff" strokeWidth={2} />
    </g>
  );
};

const Dashboard: React.FC = () => {
  const kpis = {
    totalEmissions: "1,245.8 tCO2",
    netBalance: "850.3 tCO2e",
    reductionTrend: "-5.2%",
    efficiency: "12.4 kg CO2/viaje"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-10">
      <style>{`
        @keyframes lineGlow {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(17, 212, 33, 0.4)); opacity: 0.9; }
          50% { filter: drop-shadow(0 0 8px rgba(17, 212, 33, 0.8)); opacity: 1; }
        }
        .animate-line-glow {
          animation: lineGlow 3s ease-in-out infinite;
        }
        @keyframes orb-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(20px, -20px) scale(1.1); }
        }
        .animate-orb {
          animation: orb-float 10s ease-in-out infinite;
        }
      `}</style>

      <AiInsights data={EVOLUTION_DATA} kpis={kpis} />

      <ExecutiveKPIOverview 
        total="1,245.8"
        balance="850.3"
        trend="-5.2%"
        efficiency="12.4"
      />

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Consumo Diesel" value="45,200" unit="Lts" subtitle="Gasto operativo mensual" icon="ev_station" trend="+1.2%" trendType="negative" />
        <KPICard title="Captura Vetiver" value="340.5" unit="tCO₂e" subtitle="Capacidad de absorción" icon="eco" trend="+12.8%" trendType="positive" />
        <KPICard title="Energía Solar" value="15,400" unit="kWh" subtitle="Generación renovable" icon="solar_power" tag="Activo" tagColor="blue" />
        <KPICard title="Viajes Camión" value="842" subtitle="Flujo logístico total" icon="local_shipping" tag="Operativo" tagColor="orange" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 p-8 rounded-3xl border border-neutral-green-100 dark:border-white/10 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5">
             <span className="material-symbols-outlined text-[120px] text-primary">eco</span>
          </div>
          <div className="flex items-center justify-between mb-10 relative z-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Curva de Reducción Mensual</h3>
              <p className="text-xs text-slate-500 font-medium">Balance neto de carbono hacia la meta de neutralidad</p>
            </div>
          </div>
          <div className="h-80 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={EVOLUTION_DATA}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} unit=" t" />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.98)', padding: '16px' }} />
                <Area type="monotone" dataKey="balance" name="Balance Neto" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" dot={<PulsingDot />} className="animate-line-glow" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-neutral-green-100 dark:border-white/10 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Fuentes de Emisión</h3>
          <div className="flex-1 relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={SOURCE_DATA} innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value" stroke="none">
                  <Cell fill={COLORS.forest} />
                  <Cell fill={COLORS.primary} />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ExecutiveKPIOverview: React.FC<{ total: string, balance: string, trend: string, efficiency: string }> = ({ total, balance, trend, efficiency }) => (
  <div className="bg-slate-950 dark:bg-black rounded-[48px] p-1 md:p-1 text-white border border-white/5 shadow-3xl relative overflow-hidden group">
    {/* Animated Orbs for Depth */}
    <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full animate-orb"></div>
    <div className="absolute bottom-[-20%] left-[-10%] w-[350px] h-[350px] bg-blue-600/10 blur-[100px] rounded-full animate-orb" style={{ animationDelay: '-5s' }}></div>
    
    <div className="relative z-10 bg-slate-900/40 dark:bg-white/[0.02] backdrop-blur-3xl rounded-[46px] p-8 md:p-12 border border-white/5">
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-12 lg:gap-6">
        
        {/* KPI: Total Emissions */}
        <div className="flex-1 flex flex-col gap-3 group/item cursor-default transition-all hover:translate-y-[-2px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-sm">cloud</span>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Emisiones Totales</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl md:text-6xl font-black text-white tracking-tighter drop-shadow-lg">{total}</span>
            <span className="text-sm font-bold text-slate-500">tCO₂</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">Bruto Anual</span>
            <span className="size-1.5 rounded-full bg-slate-700"></span>
            <span className="text-[10px] font-bold text-slate-500">SIA 2024</span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {/* KPI: Net Balance (Highlighted) */}
        <div className="flex-1 flex flex-col gap-3 group/item cursor-default transition-all hover:translate-y-[-2px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">eco</span>
            <p className="text-[11px] font-black text-primary uppercase tracking-[0.3em]">Balance Neto</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black text-primary tracking-tighter drop-shadow-[0_0_20px_rgba(17,212,33,0.3)]">{balance}</span>
            <span className="text-sm font-bold text-primary/60">tCO₂e</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
               <div className="bg-primary h-full w-[65%] shadow-[0_0_8px_rgba(17,212,33,0.5)]"></div>
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-widest">65% Meta</span>
          </div>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {/* KPI: Trend */}
        <div className="flex-1 flex flex-col gap-3 group/item cursor-default transition-all hover:translate-y-[-2px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-sm">trending_down</span>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Tendencia</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">{trend}</span>
            <div className="size-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/10">
              <span className="material-symbols-outlined text-primary text-2xl font-bold">south_east</span>
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">Mejora continua vs 2023</p>
        </div>

        {/* Separator */}
        <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>

        {/* KPI: Efficiency */}
        <div className="flex-1 flex flex-col gap-3 group/item cursor-default transition-all hover:translate-y-[-2px]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-500 text-sm">speed</span>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Eficiencia</p>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black text-white tracking-tighter">{efficiency}</span>
            <span className="text-sm font-bold text-slate-500">kg/v</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
             <span className="material-symbols-outlined text-xs text-blue-400">local_shipping</span>
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Rendimiento Logístico</span>
          </div>
        </div>

      </div>

      {/* Subtle Bottom Bar with Team Info */}
      <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="size-9 rounded-full border-2 border-slate-900 bg-cover bg-center shadow-lg" style={{ backgroundImage: `url('https://picsum.photos/seed/${i * 99}/100')` }}></div>
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            <span className="text-primary font-black">Monitoreo Activo:</span> Equipo de Sostenibilidad Puerto Columbo
          </p>
        </div>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Última Sincronización: Hoy 14:32</span>
           <div className="size-2 rounded-full bg-primary animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
);

const TimelineItem: React.FC<{ icon: string, title: string, date: string, desc: string, active?: boolean }> = ({ icon, title, date, desc, active }) => (
  <div className="flex gap-4 relative">
    <div className="flex flex-col items-center">
      <div className={`size-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm border ${active ? 'bg-primary text-white border-primary/20' : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10'}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <div className="w-0.5 h-full bg-slate-100 dark:bg-white/5 mt-2"></div>
    </div>
    <div className="pb-8">
      <div className="flex items-center gap-2 mb-1">
        <h4 className="text-sm font-black text-slate-900 dark:text-white">{title}</h4>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {date}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

const ProjectionStat: React.FC<{ label: string, value: string, icon: string }> = ({ label, value, icon }) => (
  <div className="flex items-center justify-between border-b border-white/10 pb-4 group">
    <div className="flex items-center gap-4">
      <div className="size-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-xl font-black text-white">{value}</p>
      </div>
    </div>
    <span className="material-symbols-outlined text-slate-700">chevron_right</span>
  </div>
);

interface KPICardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon: string;
  trend?: string;
  trendType?: 'positive' | 'negative';
  tag?: string;
  tagColor?: string;
}

const KPICard: React.FC<KPICardProps> = ({ title, value, unit, subtitle, icon, trend, trendType, tag, tagColor }) => {
  const getTrendColor = () => {
    if (!trendType) return 'text-slate-400';
    return trendType === 'positive' ? 'text-primary' : 'text-red-500';
  };

  const getTagStyles = () => {
    if (tagColor === 'blue') return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400';
    if (tagColor === 'orange') return 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400';
    return 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-400';
  };

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-neutral-green-100 dark:border-white/10 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
      <div className="flex items-center justify-between mb-4">
        <span className="p-2.5 bg-slate-100 dark:bg-white/10 rounded-2xl text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
          <span className="material-symbols-outlined text-xl">{icon}</span>
        </span>
        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span className={`text-[10px] font-black px-2.5 py-1 rounded-full ${trendType === 'positive' ? 'bg-primary/10' : 'bg-red-50 dark:bg-red-500/10'} ${getTrendColor()}`}>
              {trend}
            </span>
          )}
          {tag && (
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${getTagStyles()}`}>
              {tag}
            </span>
          )}
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
          {value}
        </h3>
        {unit && <span className="text-sm font-bold text-slate-400">{unit}</span>}
      </div>
      <p className="text-[10px] text-slate-400 mt-2 font-medium">{subtitle}</p>
    </div>
  );
};

export default Dashboard;