
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

const Dashboard: React.FC = () => {
  const kpis = {
    totalEmissions: "1,245.8 tCO2",
    netBalance: "850.3 tCO2e",
    reductionTrend: "-5.2%",
    efficiency: "12.4 kg CO2/viaje"
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 relative pb-10">
      {/* AI Component */}
      <AiInsights data={EVOLUTION_DATA} kpis={kpis} />

      {/* Executive KPI Overview */}
      <ExecutiveKPIOverview 
        total="1,245.8"
        balance="850.3"
        trend="-5.2%"
        efficiency="12.4"
      />

      {/* KPI Detail Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Consumo Diesel" 
          value="45,200" 
          unit="Lts"
          subtitle="Gasto operativo mensual" 
          icon="ev_station" 
          trend="+1.2%" 
          trendType="negative"
        />
        <KPICard 
          title="Captura Vetiver" 
          value="340.5" 
          unit="tCO₂e"
          subtitle="Capacidad de absorción" 
          icon="eco" 
          trend="+12.8%" 
          trendType="positive"
        />
        <KPICard 
          title="Energía Solar" 
          value="15,400" 
          unit="kWh"
          subtitle="Generación renovable" 
          icon="solar_power" 
          tag="Activo"
          tagColor="blue"
        />
        <KPICard 
          title="Viajes Camión" 
          value="842" 
          subtitle="Flujo logístico total" 
          icon="local_shipping" 
          tag="Operativo"
          tagColor="orange"
        />
      </section>

      {/* Main Charts: Curva de Reducción Mensual */}
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
            <div className="flex bg-slate-100 dark:bg-white/10 rounded-xl p-1 shadow-inner">
              <button className="px-4 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">Emisiones</button>
              <button className="px-4 py-1.5 text-xs font-bold bg-white dark:bg-primary shadow-sm rounded-lg text-slate-900 dark:text-white transition-all">Balance Neto</button>
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
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.slate500} stopOpacity={0.08}/>
                    <stop offset="95%" stopColor={COLORS.slate500} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 800, fill: '#94a3b8' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#94a3b8' }} 
                  unit=" t"
                  domain={[0, 'auto']}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.98)',
                    padding: '16px'
                  }}
                  itemStyle={{ fontWeight: 800 }}
                  labelStyle={{ fontSize: '12px', fontWeight: 900, marginBottom: '8px', color: '#64748b', textTransform: 'uppercase' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Balance Neto" 
                  stroke={COLORS.primary} 
                  strokeWidth={4} 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  activeDot={{ r: 8, strokeWidth: 0, fill: COLORS.primary }}
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  name="Meta Proyectada" 
                  stroke={COLORS.slate500} 
                  strokeDasharray="6 6"
                  strokeWidth={1.5} 
                  strokeOpacity={0.5}
                  fillOpacity={1} 
                  fill="url(#colorTarget)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10">
             <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-xl">star</span>
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Hito Alcanzado: Mes de Junio</p>
                  <p className="text-xs text-slate-500">Primera vez con balance neto negativo (-30 tCO2e)</p>
                </div>
             </div>
             <button className="text-xs font-bold text-primary hover:underline">Ver detalles</button>
          </div>
        </div>

        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-neutral-green-100 dark:border-white/10 shadow-sm flex flex-col h-full">
          <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">Fuentes de Emisión</h3>
          <p className="text-xs text-slate-500 mb-10 font-medium">Distribución por activo operativo</p>
          <div className="flex-1 relative min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SOURCE_DATA}
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS.forest} />
                  <Cell fill={COLORS.primary} />
                </Pie>
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-2xl font-black text-slate-900 dark:text-white">100%</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fuentes</span>
            </div>
          </div>
          <div className="mt-6 space-y-3">
             {SOURCE_DATA.map((item, idx) => (
               <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
                 <div className="flex items-center gap-2">
                   <div className="size-2 rounded-full" style={{ backgroundColor: idx === 0 ? COLORS.forest : COLORS.primary }}></div>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                 </div>
                 <span className="text-xs font-black text-slate-900 dark:text-white">{item.value}%</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* Operational Milestones & Records */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-neutral-green-100 dark:border-white/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Hitos Operacionales</h3>
            <button className="text-xs font-bold text-primary px-3 py-1 rounded-full bg-primary/10">Historial Completo</button>
          </div>
          <div className="space-y-6">
            <TimelineItem 
              icon="agriculture" 
              title="Expansión Vetiver" 
              date="15 de Junio, 2024" 
              desc="Nueva fase de siembra completada en Terminal Norte (4 Ha adicionales)." 
              active
            />
            <TimelineItem 
              icon="electric_car" 
              title="Electrificación de Grúas" 
              date="02 de Junio, 2024" 
              desc="Puesta en marcha del sistema híbrido en grúas pórtico A-12." 
            />
            <TimelineItem 
              icon="workspace_premium" 
              title="Certificación ISO 14064" 
              date="20 de Mayo, 2024" 
              desc="Auditoría externa aprobada para verificación de huella de carbono." 
            />
          </div>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
             <span className="material-symbols-outlined text-[150px] text-white">insights</span>
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-1">Impacto Ambiental Proyectado</h3>
            <p className="text-slate-400 text-sm mb-10 font-medium italic">Basado en tasa de captura actual y eficiencia operacional</p>
            
            <div className="space-y-8">
               <ProjectionStat label="Árboles Equivalentes" value="15,420" icon="park" />
               <ProjectionStat label="Emisiones Evitadas" value="48.2 tCO2e" icon="verified" />
               <ProjectionStat label="Meta Net Zero" value="2.5 Años" icon="auto_mode" />
            </div>

            <button className="w-full mt-10 py-4 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
               Generar Reporte de Impacto 2024
               <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

const ExecutiveKPIOverview: React.FC<{ total: string, balance: string, trend: string, efficiency: string }> = ({ total, balance, trend, efficiency }) => (
  <div className="bg-slate-900 dark:bg-slate-900/50 rounded-[40px] p-8 md:p-12 text-white border border-white/10 shadow-2xl relative overflow-hidden group">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-primary/30 transition-all duration-700"></div>
    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full -translate-x-1/2 translate-y-1/2"></div>
    
    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="flex-1 w-full grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 divide-x-0 lg:divide-x divide-white/10">
        
        <div className="flex flex-col gap-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">tCO₂ Total</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{total}</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Emisiones brutas anuales</p>
        </div>

        <div className="flex flex-col gap-1 lg:pl-12">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Balance Neto</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-primary tracking-tighter">{balance}</span>
            <span className="text-xs font-bold text-primary/60">tCO₂e</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Meta: 0.0 tCO₂e</p>
        </div>

        <div className="flex flex-col gap-1 lg:pl-12">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Tendencia</p>
          <div className="flex items-center gap-2">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{trend}</span>
            <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-xl">trending_down</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Reducción vs 2023</p>
        </div>

        <div className="flex flex-col gap-1 lg:pl-12">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2">Eficiencia</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-black text-white tracking-tighter">{efficiency}</span>
            <span className="text-xs font-bold text-slate-400">kg/v</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">Intensidad logística</p>
        </div>

      </div>

      <div className="shrink-0 flex flex-col items-center md:items-end gap-4">
        <div className="flex -space-x-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="size-10 rounded-full border-2 border-slate-900 bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/seed/${i * 123}/100')` }}></div>
          ))}
          <div className="size-10 rounded-full border-2 border-slate-900 bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary backdrop-blur-md">
            +5
          </div>
        </div>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center md:text-right">Equipo de Sostenibilidad<br/>Monitoreando en vivo</p>
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
