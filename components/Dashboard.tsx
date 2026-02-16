
import React, { useState, useMemo, memo, lazy, Suspense, useCallback } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ReferenceLine, PieChart, Pie, Cell, BarChart, Bar, Sector
} from 'recharts';
import { COLORS } from '../constants.tsx';
import { formatNumber } from '../utils/format.ts';

const SavedRecordsWidget = lazy(() => import('./SavedRecordsWidget.tsx'));

// Datos extraídos de la gráfica "Trayectoria Negativa Sostenida"
const RAW_DATA = [
  { name: 'ENE', balance: 20, description: 'Inicio Operación' },
  { name: 'FEB', balance: -15, description: 'Activación Vetiver' },
  { name: 'MAR', balance: -8, description: 'Ajuste Estacional' },
  { name: 'ABR', balance: -65, description: 'Optimización Flota' },
  { name: 'MAY', balance: -58, description: 'Consumo Estable' },
  { name: 'JUN', balance: -110.3, description: 'Cierre Semestral' },
];

// Datos Simulados para Sparklines de KPIs
const KPI_DATA = {
  diesel: [
    { v: 100 }, { v: 85 }, { v: 70 }, { v: 45 }, { v: 30 }, { v: 25 }, { v: 24 }
  ],
  vetiver: [
    { v: 10 }, { v: 25 }, { v: 45 }, { v: 60 }, { v: 80 }, { v: 95 }, { v: 100 }
  ],
  solar: [
    { v: 40 }, { v: 60 }, { v: 45 }, { v: 80 }, { v: 70 }, { v: 90 }, { v: 100 }
  ],
  carbon: [
    { v: 0.8 }, { v: 0.75 }, { v: 0.6 }, { v: 0.4 }, { v: 0.3 }, { v: 0.2 }, { v: 0.14 }
  ]
};

const CustomBalanceTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isNegative = data.balance < 0;
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 p-4 rounded-2xl shadow-xl min-w-[180px]">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label} 2026</p>
        <div className="flex items-center gap-2">
           <div className={`size-2 rounded-full ${isNegative ? 'bg-primary' : 'bg-red-500'}`}></div>
           <span className="text-xl font-black text-slate-800 dark:text-white">
             {data.balance > 0 ? '+' : ''}{formatNumber(data.balance, 1)} <span className="text-[10px] text-slate-400">tCO₂e</span>
           </span>
        </div>
        <p className="text-[10px] font-bold text-slate-500 mt-2 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-lg inline-block">
          {data.description}
        </p>
      </div>
    );
  }
  return null;
};

// Renderizado personalizado del sector activo (Hover)
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8} // Expande 8px
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 14}
        fill={fill}
        opacity={0.3}
      />
    </g>
  );
};

const NewKPICard = memo(({ title, value, unit, icon, trend, tag, graphColor, chartType = 'area', data }: any) => {
  return (
    <div className="bg-white dark:bg-[#121c13] rounded-[32px] border border-slate-200 dark:border-white/5 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between h-[280px] overflow-hidden relative">
      
      {/* Top Section: Content */}
      <div className="p-6 pb-0 z-20 flex flex-col h-full">
        <div className="flex justify-between items-start mb-4 shrink-0">
           <div className="size-12 rounded-2xl bg-slate-50 dark:bg-white/5 group-hover:bg-primary transition-colors flex items-center justify-center text-primary group-hover:text-white shadow-sm">
              <span className="material-symbols-outlined text-2xl">{icon}</span>
           </div>
           <div className="px-3 py-1.5 rounded-full bg-green-50 dark:bg-primary/10 flex items-center gap-1 border border-primary/10">
              <span className="material-symbols-outlined text-xs text-primary font-bold">trending_flat</span>
              <span className="text-xs font-black text-primary">{trend}</span>
           </div>
        </div>
        
        <div className="mb-auto">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{title}</h4>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</span>
            <span className="text-[10px] font-black text-slate-400 uppercase">{unit}</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="size-1.5 rounded-full bg-primary"></div>
             <p className="text-[10px] font-bold text-slate-500 truncate">{tag}</p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Graph Area */}
      <div className="h-24 w-full opacity-50 group-hover:opacity-100 transition-opacity duration-500 relative z-10 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
             <BarChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
               <Bar dataKey="v" fill={graphColor} radius={[4, 4, 0, 0]} barSize={8} />
             </BarChart>
          ) : (
             <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`grad-${title}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={graphColor} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={graphColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="v" 
                  stroke={graphColor} 
                  strokeWidth={3} 
                  fill={`url(#grad-${title})`} 
                  isAnimationActive={true}
                />
             </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      
      {/* Background Hover Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>
    </div>
  );
});

const Dashboard: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(2); // Iniciar con 'Electricidad' seleccionado por defecto
  const chartData = useMemo(() => RAW_DATA, []);

  // Circle Chart Data (Consolidación Operativa)
  const captureCompliance = 1;
  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (circumference * captureCompliance) / 100;

  // Mix Operativo 2026 Data
  const pieData = useMemo(() => [
    { name: 'Diesel', value: 35, color: COLORS.forest },
    { name: 'Otros', value: 10, color: COLORS.blue500 },
    { name: 'Electricidad', value: 55, color: COLORS.primary },
  ], []);

  const onPieEnter = useCallback((_: any, index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-10">
      
      {/* Top Section: Main Banner & Circle Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-4">
        
        {/* Main Dark Banner - Liderazgo Carbono Negativo */}
        <div className="lg:col-span-8 bg-[#0B1121] rounded-[40px] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between min-h-[380px]">
          {/* Background Effects */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] rounded-full pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
          
          {/* Header Badge */}
          <div className="flex items-center gap-3 relative z-10 mb-6">
            <span className="bg-[#1a2c20] text-primary border border-primary/20 text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] shadow-sm">
              Resumen Ejecutivo Febrero 2026
            </span>
            <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          </div>

          {/* Title Area */}
          <div className="relative z-10 mb-8">
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1] mb-4">
               Puerto Columbo: <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 drop-shadow-[0_0_15px_rgba(17,212,33,0.3)]">Liderazgo</span>
               <br />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-green-300 drop-shadow-[0_0_15px_rgba(17,212,33,0.3)]">Carbono Negativo</span>
             </h1>
             <p className="text-slate-400 max-w-2xl text-sm md:text-base font-medium leading-relaxed">
               Estamos en 2026. Tras consolidar el Proyecto Vetiver, hemos alcanzado un balance negativo sostenido. Nuestra meta para 2027 es la autonomía energética total mediante hidrógeno verde.
             </p>
          </div>

          {/* Stats Grid inside Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10 border-t border-white/10 pt-8">
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Emisiones Brutas</p>
               <p className="text-3xl font-black text-white">945.2</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Balance Neto</p>
               <p className="text-3xl font-black text-primary drop-shadow-[0_0_10px_rgba(17,212,33,0.3)]">-110.3</p>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Eficiencia 2026</p>
               <p className="text-3xl font-black text-white">8.1 <span className="text-xs text-slate-500">kg/v</span></p>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Status Meta 2027</p>
               <div className="flex items-center gap-2 mt-1">
                 <span className="material-symbols-outlined text-primary text-2xl">verified</span>
                 <p className="text-base font-black text-primary uppercase tracking-wider">En Ruta</p>
               </div>
            </div>
          </div>
          
          {/* Decorative Chart Bars (CSS Only) */}
          <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex gap-3 opacity-10">
             <div className="w-12 h-24 bg-white rounded-t-lg"></div>
             <div className="w-12 h-40 bg-white rounded-t-lg"></div>
             <div className="w-12 h-32 bg-white rounded-t-lg"></div>
          </div>
        </div>

        {/* Consolidación Operativa Circle Card (Preserved from previous request) */}
        <div className="lg:col-span-4 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[40px] p-8 flex flex-col justify-center items-center text-center shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/50 dark:to-white/5 pointer-events-none"></div>
          
          <div className="relative size-60 flex items-center justify-center mb-4">
            <svg className="size-full -rotate-90 drop-shadow-xl">
              <circle cx="120" cy="120" r={radius} className="stroke-slate-100 dark:stroke-white/5 fill-none" strokeWidth="20" />
              <circle 
                cx="120" cy="120" r={radius} 
                className="stroke-primary fill-none transition-all duration-1000 ease-out" 
                strokeWidth="20" 
                strokeDasharray={circumference} 
                strokeDashoffset={dashOffset} 
                strokeLinecap="round" 
                style={{ filter: 'drop-shadow(0 0 10px rgba(17, 212, 33, 0.5))' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{captureCompliance}%</span>
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Meta 2026</span>
            </div>
          </div>

          <div className="relative z-10 space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Consolidación Operativa</h3>
            
            <div className="flex flex-row items-center justify-center gap-4">
              <span className="px-4 py-2 rounded-2xl bg-green-100 dark:bg-primary/20 text-primary font-black text-[10px] uppercase tracking-widest shadow-sm">
                Hacia 2027
              </span>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Meta: -1200t
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <NewKPICard 
          title="Consumo Diesel" 
          value="12,100" 
          unit="L" 
          icon="ev_station" 
          trend="-75.2%" 
          tag="Remanente flota pesada 2026" 
          graphColor={COLORS.primary}
          data={KPI_DATA.diesel}
          chartType="area"
        />
        <NewKPICard 
          title="Captura Vetiver" 
          value="1,340.5" 
          unit="tCO₂" 
          icon="eco" 
          trend="+42.8%" 
          tag="Sistemas maduros Fase III" 
          graphColor={COLORS.primary}
          data={KPI_DATA.vetiver}
          chartType="area"
        />
        <NewKPICard 
          title="Energía Solar/Eólica" 
          value="85.4" 
          unit="MWh" 
          icon="solar_power" 
          trend="+100%" 
          tag="Mix renovable Puerto Columbo" 
          graphColor={COLORS.primary}
          data={KPI_DATA.solar}
          chartType="bar"
        />
        <NewKPICard 
          title="Intensidad Carbono" 
          value="0.14" 
          unit="T/TEU" 
          icon="analytics" 
          trend="-82%" 
          tag="Métrica competitiva 2026" 
          graphColor={COLORS.primary}
          data={KPI_DATA.carbon}
          chartType="area"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Trayectoria Negativa Sostenida Chart */}
        <div className="lg:col-span-8 bg-white dark:bg-white/5 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-2">Trayectoria Negativa Sostenida</h3>
              <p className="text-slate-500 font-medium text-sm">Evolución del balance neto en el primer semestre de 2026</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="size-3 rounded-full bg-primary animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance Auditado</span>
            </div>
          </div>

          <div className="h-[350px] w-full relative">
             {/* Custom horizontal lines decoration */}
             <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                {[...Array(5)].map((_, i) => <div key={i} className="w-full h-px bg-slate-900 dark:bg-white border-t border-dashed"></div>)}
             </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="transparent" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 900, fill: '#94a3b8' }} 
                  dy={15} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  unit=" t" 
                />
                <Tooltip content={<CustomBalanceTooltip />} cursor={{ stroke: COLORS.primary, strokeWidth: 1, strokeDasharray: '5 5' }} />
                <ReferenceLine y={0} stroke={COLORS.primary} strokeDasharray="4 4" opacity={0.5} />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={COLORS.primary} 
                  strokeWidth={5} 
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
            
            {/* End Point Indicator */}
            <div className="absolute right-0 bottom-[10%] bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg transform translate-y-1/2">
              JUN -110.3 t
            </div>
          </div>
        </div>

        {/* Saved Records Widget (Layout Keeper) */}
        <div className="lg:col-span-4 h-full min-h-[400px]">
          <Suspense fallback={<div className="h-full min-h-[400px] bg-slate-100 rounded-[40px] animate-pulse"></div>}>
            <SavedRecordsWidget />
          </Suspense>
        </div>
      </div>

      {/* NEW SECTION: MIX OPERATIVO 2026 */}
      <div className="bg-white dark:bg-white/5 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="size-14 rounded-2xl bg-green-50 dark:bg-primary/10 flex items-center justify-center text-primary shadow-sm animate-in zoom-in duration-500">
                <span className="material-symbols-outlined text-3xl">pie_chart</span>
              </div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Mix Operativo 2026</h3>
            </div>
            
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 max-w-xl text-sm md:text-base">
              Distribución porcentual de las fuentes de emisión auditadas en el periodo actual. La electricidad sigue siendo el factor predominante debido a la automatización de grúas pórtico.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pieData.map((item, idx) => (
                <div 
                  key={item.name}
                  className={`
                    p-6 rounded-[24px] border transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in
                    ${activeIndex === idx 
                      ? 'bg-slate-50 dark:bg-white/10 border-slate-300 dark:border-white/20 shadow-lg scale-105' 
                      : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5 opacity-80 hover:opacity-100'
                    }
                  `}
                  style={{ animationDelay: `${idx * 150}ms` }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div className="size-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 dark:text-white mb-3">{item.value}%</p>
                    <div className="w-full h-1.5 bg-slate-200 dark:bg-black/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${item.value}%`, backgroundColor: item.color }}></div>
                    </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart Side */}
          <div className="flex items-center justify-center h-[320px] relative animate-in zoom-in duration-700 delay-200">
              <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                          activeIndex={activeIndex}
                          activeShape={renderActiveShape}
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="none"
                          cornerRadius={8}
                          onMouseEnter={onPieEnter}
                          animationDuration={1000}
                          animationBegin={200}
                      >
                          {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} stroke={activeIndex === index ? 'none' : 'transparent'} />
                          ))}
                      </Pie>
                  </PieChart>
              </ResponsiveContainer>
              {/* Dynamic Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transition-all duration-300">
                  <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter animate-in fade-in zoom-in duration-200 key={activeIndex}">
                    {pieData[activeIndex].value}%
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    {pieData[activeIndex].name}
                  </span>
              </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
