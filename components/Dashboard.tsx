
import React, { useState, useMemo, memo, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { COLORS } from '../constants';
import AiInsights from './AiInsights';

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
  <div className="h-12 w-28 transition-all duration-500 group-hover:scale-110 group-hover:filter group-hover:drop-shadow-[0_0_8px_rgba(17,212,33,0.3)]">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data.map((v, i) => ({ v, i }))}>
        <Line 
          type="monotone" 
          dataKey="v" 
          stroke={color} 
          strokeWidth={2.5} 
          dot={false} 
          isAnimationActive={true}
          animationDuration={1500}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
));

const MiniKPICard = memo(({ title, value, unit, icon, trend, trendType, history, subtitle }: any) => {
  const isPos = trendType === 'pos';
  const color = isPos ? COLORS.primary : COLORS.red500;
  const bgColor = isPos ? 'bg-primary/10' : 'bg-red-500/10';
  const trendIcon = isPos ? (trend.includes('-') ? 'trending_down' : 'trending_up') : 'trending_flat';

  return (
    <div className="bg-white dark:bg-white/5 p-6 rounded-[32px] border border-slate-200 dark:border-white/10 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300 group relative overflow-hidden">
      {/* Decorative background pulse on hover */}
      <div className={`absolute -right-4 -top-4 size-24 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${isPos ? 'bg-primary' : 'bg-red-500'}`}></div>
      
      <div className="flex justify-between items-start mb-6">
        <div className={`size-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:-translate-y-1 ${isPos ? 'bg-primary shadow-primary/20' : 'bg-slate-800 shadow-slate-900/20'}`}>
          <span className="material-symbols-outlined text-2xl">{icon}</span>
        </div>
        <Sparkline data={history || [1, 5, 2, 8]} color={color} />
      </div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${bgColor} transition-transform duration-300 group-hover:scale-105`}>
            <span className={`material-symbols-outlined text-[14px] ${isPos ? 'text-primary' : 'text-red-500'}`}>{trendIcon}</span>
            <span className={`text-[10px] font-black tracking-tighter ${isPos ? 'text-primary' : 'text-red-500'}`}>
              {trend}
            </span>
          </div>
        </div>
        
        <div className="flex items-baseline gap-1.5">
          <h4 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter group-hover:text-primary transition-colors duration-300">{value}</h4>
          <span className="text-sm font-bold text-slate-400">{unit}</span>
        </div>
        
        <p className="text-[10px] text-slate-500 mt-3 font-semibold flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <span className="size-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          {subtitle}
        </p>
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
              Resumen Ejecutivo Junio 2026
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

const RecordDetailModal: React.FC<{ record: any, onClose: () => void }> = ({ record, onClose }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-3xl overflow-hidden animate-in zoom-in duration-300 border border-slate-200 dark:border-white/10">
        
        {/* Header */}
        <div className="p-8 bg-slate-50 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest ${
                record.status === 'VALIDADO' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {record.status}
              </span>
              <span className="text-xs font-bold text-slate-400">{record.id}</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{record.origin}</h3>
            <p className="text-sm text-slate-500 font-bold">{record.dateStr}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-white dark:bg-white/10 rounded-full hover:bg-slate-100 dark:hover:bg-white/20 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          
          {/* Main KPIs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Emisiones Totales</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-slate-900 dark:text-white">{record.emissions.toFixed(2)}</span>
                <span className="text-xs font-bold text-slate-500">tCO₂e</span>
              </div>
            </div>
            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <p className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-1">Captura Estimada</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black text-primary">{record.capture.toFixed(2)}</span>
                <span className="text-xs font-bold text-primary/70">tCO₂e</span>
              </div>
            </div>
          </div>

          {/* Operational Data (Raw Inputs) */}
          {record.raw ? (
            <div>
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">data_object</span>
                Datos Operativos Originales
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">local_shipping</span>
                  <p className="text-[10px] text-slate-400 uppercase">Camiones</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.trucks || 0}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">box</span>
                  <p className="text-[10px] text-slate-400 uppercase">Contenedores</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.containers || 0}</p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">bolt</span>
                  <p className="text-[10px] text-slate-400 uppercase">Electricidad</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.electricity || 0} <span className="text-[9px]">kWh</span></p>
                </div>
                <div className="p-3 rounded-xl border border-slate-100 dark:border-white/10">
                  <span className="material-symbols-outlined text-slate-400 text-lg mb-2">ev_station</span>
                  <p className="text-[10px] text-slate-400 uppercase">Diesel</p>
                  <p className="text-lg font-bold text-slate-800 dark:text-white">{record.raw.diesel || 0} <span className="text-[9px]">Lts</span></p>
                </div>
              </div>
            </div>
          ) : (
             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-dashed border-slate-200 dark:border-white/20 text-center">
                <p className="text-xs text-slate-400 italic">No hay datos operativos detallados disponibles para este registro.</p>
             </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex justify-end">
          <button onClick={onClose} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl hover:scale-105 active:scale-95 transition-all">
            Cerrar Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

const SavedRecordsWidget: React.FC = () => {
  const [localData, setLocalData] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const navigate = useNavigate();

  const loadData = () => {
    const data = JSON.parse(localStorage.getItem('puerto_columbo_user_data') || '[]');
    setLocalData(data.slice(0, 5)); // Mostramos los últimos 5
  };

  useEffect(() => {
    loadData();
    window.addEventListener('localDataChanged', loadData);
    return () => window.removeEventListener('localDataChanged', loadData);
  }, []);

  return (
    <>
      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-white/5 p-8 shadow-sm h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Registros Guardados</h3>
          <button 
            onClick={() => navigate('/reportes')}
            className="text-sm font-black text-primary hover:text-primary/80 transition-colors uppercase tracking-widest"
          >
            Ver todo
          </button>
        </div>

        <div className="space-y-6 flex-1 overflow-y-auto scrollbar-hide">
          {localData.length > 0 ? localData.map((item, idx) => {
            const [date, month] = item.dateStr.split(' ');
            return (
              <div 
                key={idx} 
                onClick={() => setSelectedRecord(item)}
                className="flex items-center gap-5 group cursor-pointer animate-in fade-in slide-in-from-left duration-300 hover:bg-slate-50 dark:hover:bg-white/5 p-2 rounded-2xl transition-all" 
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                {/* Green indicator bar */}
                <div className="w-1.5 h-12 bg-primary rounded-full shrink-0 group-hover:scale-y-110 transition-transform shadow-lg shadow-primary/20"></div>
                
                {/* Date block */}
                <div className="flex flex-col items-center justify-center min-w-[50px]">
                  <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">{month}</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{date}</span>
                </div>

                {/* Data info */}
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-black text-slate-800 dark:text-slate-200">{item.emissions.toFixed(2)}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">tCO₂e</span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest truncate">{item.origin}</p>
                </div>

                {/* Status icon */}
                <div className="text-slate-300 group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-2xl">visibility</span>
                </div>
              </div>
            );
          }) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-4 opacity-50 h-full">
              <span className="material-symbols-outlined text-5xl">inventory_2</span>
              <p className="text-[10px] font-black uppercase tracking-widest text-center">No hay registros guardados para mostrar</p>
            </div>
          )}
        </div>
      </div>

      {selectedRecord && (
        <RecordDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </>
  );
};

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
        <MiniKPICard 
          title="Consumo Diesel" 
          value="12,100" 
          unit="L" 
          icon="ev_station" 
          trend="-75.2%" 
          trendType="pos" 
          history={[80, 60, 40, 25, 12]}
          subtitle="Remanente flota pesada 2026"
        />
        <MiniKPICard 
          title="Captura Vetiver" 
          value="1,340.5" 
          unit="tCO₂" 
          icon="eco" 
          trend="+42.8%" 
          trendType="pos" 
          history={[60, 85, 110, 125, 134]}
          subtitle="Sistemas maduros Fase III"
        />
        <MiniKPICard 
          title="Energía Solar/Eólica" 
          value="85.4" 
          unit="MWh" 
          icon="solar_power" 
          trend="+400%" 
          trendType="pos" 
          history={[20, 35, 50, 70, 85]}
          subtitle="Mix renovable Puerto Columbo"
        />
        <MiniKPICard 
          title="Intensidad Carbono" 
          value="0.14" 
          unit="t/TEU" 
          icon="analytics" 
          trend="-82.1%" 
          trendType="pos" 
          history={[0.8, 0.6, 0.4, 0.2, 0.14]}
          subtitle="Métrica competitiva 2026"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white dark:bg-white/5 rounded-[32px] p-8 border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Trayectoria Negativa Sostenida</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Evolución del balance neto en el primer semestre de 2026</p>
            </div>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-primary"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Neto Negativo</span>
               </div>
               <div className="flex items-center gap-2">
                 <div className="size-2 rounded-full bg-slate-200"></div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Meta 2027</span>
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
                <Area type="monotone" dataKey="balance" name="Balance Neto" stroke={COLORS.primary} strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-4 h-full">
          <SavedRecordsWidget />
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
