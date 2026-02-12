
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  ComposedChart,
  Bar,
  Cell
} from 'recharts';
import { COLORS } from '../constants';

const HISTORICAL_EMISSIONS = [
  { year: '2020', real: 3200, bau: 3200, avoided: 0, savings: 0, milestone: 'Línea Base' },
  { year: '2021', real: 2850, bau: 3350, avoided: 500, savings: 12500, milestone: 'Fase I Piloto' },
  { year: '2022', real: 2400, bau: 3550, avoided: 1150, savings: 28750, milestone: 'Expansión Sur' },
  { year: '2023', real: 2050, bau: 3800, avoided: 1750, savings: 43750, milestone: 'Riego Solar' },
  { year: '2024', real: 1820, bau: 4100, avoided: 2280, savings: 57000, milestone: 'Optimización' },
];

const PROJECTION_DATA = [
  { label: '468 kg', h: '18%', year: '2020', desc: 'Siembra inicial', depth: 0.15 },
  { label: '1,200 kg', h: '46%', year: '2021', desc: 'Desarrollo radicular', depth: 0.40 },
  { label: '1,950 kg', h: '75%', year: '2022', desc: 'Sistema establecido', depth: 0.65 },
  { label: '2,400 kg', h: '92%', year: '2023', desc: 'Maduración plena', depth: 0.85 },
  { label: '2,600 kg', h: '100%', year: '2024', desc: 'Capacidad óptima', highlight: true, depth: 1.0 },
];

const INNOVATION_LOG = [
  {
    id: 1,
    title: "Implementación Fase I",
    category: "Biológico",
    date: "Marzo 2024",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800",
    desc: "Primeras 2 hectáreas de Vetiver instaladas en el talud sur para control de erosión.",
    status: "Completado"
  },
  {
    id: 2,
    title: "Monitoreo por Drones",
    category: "Tecnología",
    date: "Mayo 2024",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    desc: "Uso de cámaras multiespectrales para medir el índice de vigor de la planta (NDVI).",
    status: "Activo"
  },
  {
    id: 3,
    title: "Sistema de Riego Solar",
    category: "Eficiencia",
    date: "Junio 2024",
    image: "https://images.unsplash.com/photo-1563791877225-450f34024508?auto=format&fit=crop&q=80&w=800",
    desc: "Automatización del riego utilizando energía 100% renovable y agua tratada.",
    status: "Activo"
  },
];

const GROWTH_FACTORS = {
  'Brote (Año 1)': 2.5,
  'Desarrollo (Año 2)': 7.0,
  'Maduro (Año 3+)': 12.5,
};

interface InteractiveState {
  rotateX: number;
  rotateY: number;
  zoom: number;
  panX: number;
  panY: number;
  isAutoOrbit: boolean;
}

const INITIAL_STATE: InteractiveState = {
  rotateX: -15,
  rotateY: 25,
  zoom: 1,
  panX: 0,
  panY: 0,
  isAutoOrbit: true
};

const Interactive3DStage: React.FC<{ depth: number, year: string, color: string, isLarge?: boolean }> = ({ depth, year, color, isLarge }) => {
  const [state, setState] = useState<InteractiveState>(INITIAL_STATE);
  const stageRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const velocity = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);

  const animate = useCallback(() => {
    if (!isDragging.current) {
      if (state.isAutoOrbit) {
        setState(prev => ({ ...prev, rotateY: prev.rotateY + 0.15 }));
      } else {
        velocity.current.x *= 0.95;
        velocity.current.y *= 0.95;
        if (Math.abs(velocity.current.x) > 0.01 || Math.abs(velocity.current.y) > 0.01) {
          setState(prev => ({
            ...prev,
            rotateY: prev.rotateY + velocity.current.x,
            rotateX: Math.max(-60, Math.min(60, prev.rotateX - velocity.current.y))
          }));
        }
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  }, [state.isAutoOrbit]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    velocity.current = { x: 0, y: 0 };
    stageRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;
    const deltaTime = Date.now() - lastPos.current.time;
    if (e.shiftKey || e.button === 1) {
      setState(prev => ({ ...prev, panX: prev.panX + deltaX, panY: prev.panY + deltaY }));
    } else {
      setState(prev => ({
        ...prev,
        rotateY: prev.rotateY + deltaX * 0.4,
        rotateX: Math.max(-60, Math.min(60, prev.rotateX - deltaY * 0.4)),
        isAutoOrbit: false
      }));
      if (deltaTime > 0) velocity.current = { x: (deltaX * 0.4), y: (deltaY * 0.4) };
    }
    lastPos.current = { x: e.clientX, y: e.clientY, time: Date.now() };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    stageRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const zoomSpeed = 0.001;
    setState(prev => ({ ...prev, zoom: Math.max(0.4, Math.min(4, prev.zoom - e.deltaY * zoomSpeed)) }));
  };

  const resetView = () => setState(INITIAL_STATE);
  const brightness = Math.cos((state.rotateY * Math.PI) / 180) * 0.3 + 0.9;
  const sideBrightness = Math.sin((state.rotateY * Math.PI) / 180) * 0.3 + 0.7;

  return (
    <div 
      ref={stageRef}
      className={`relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden select-none bg-gradient-to-b from-slate-900 via-slate-950 to-black touch-none group/viewer`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={resetView}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-8 left-8 flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span> Simulación Bio-Radicular
          </span>
          <span className="text-[24px] font-black text-white">{year}</span>
        </div>
        <div className="absolute left-8 bottom-24 flex flex-col items-start gap-4">
           {[0, 1, 2, 3, 4].map(m => (
             <div key={m} className="flex items-center gap-2 opacity-40">
                <div className="w-4 h-[1px] bg-white"></div>
                <span className="text-[9px] font-bold text-white">{m}m</span>
             </div>
           ))}
        </div>
      </div>
      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
        <button onClick={() => setState(p => ({ ...p, isAutoOrbit: !p.isAutoOrbit }))} className={`size-12 rounded-2xl flex items-center justify-center border shadow-2xl transition-all ${state.isAutoOrbit ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}>
          <span className={`material-symbols-outlined ${state.isAutoOrbit ? 'animate-spin-slow' : ''}`}>sync</span>
        </button>
        <button onClick={resetView} className="size-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl">
          <span className="material-symbols-outlined">restart_alt</span>
        </button>
      </div>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="absolute size-1 bg-primary/30 rounded-full blur-[2px] animate-float-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${10 + Math.random() * 10}s` }} />
        ))}
      </div>
      <div className="perspective-1000 transition-transform duration-300 ease-out" style={{ transform: `translate(${state.panX}px, ${state.panY}px) scale(${state.zoom})` }}>
        <div className="cube-container" style={{ transform: `rotateX(${state.rotateX}deg) rotateY(${state.rotateY}deg)`, transition: isDragging.current ? 'none' : 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)', width: isLarge ? '240px' : '180px', height: isLarge ? '360px' : '280px' }}>
          <div className="cube-face top-face flex items-center justify-center overflow-hidden" style={{ backgroundColor: color }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
            <div className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]">
                <span className="material-symbols-outlined text-5xl animate-pulse">eco</span>
            </div>
          </div>
          <div className="cube-face front-face" style={{ filter: `brightness(${brightness})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/80"></div>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 200">
              <path className="root-path animate-root-sway-primary" d={`M 50 0 L 50 ${200 * depth}`} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 8px ${color})`, opacity: 0.95 }} />
              <path className="root-path animate-root-sway-lateral-1" d={`M 50 ${20 * depth} Q 35 ${60 * depth} 20 ${110 * depth} M 50 ${80 * depth} Q 30 ${130 * depth} 35 ${190 * depth}`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color})`, opacity: 0.85 }} />
              <path className="root-path animate-root-sway-lateral-2" d={`M 50 ${20 * depth} Q 65 ${60 * depth} 80 ${110 * depth} M 50 ${80 * depth} Q 70 ${130 * depth} 65 ${190 * depth}`} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 5px ${color})`, opacity: 0.85 }} />
              <path className="root-path animate-root-pulse-slow" d={`M 50 ${120 * depth} Q 55 ${150 * depth} 45 ${200 * depth}`} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 3px ${color})`, opacity: 0.6 }} />
            </svg>
          </div>
          <div className="cube-face right-face" style={{ filter: `brightness(${sideBrightness})` }}></div>
          <div className="cube-face left-face" style={{ filter: `brightness(${2-sideBrightness})` }}></div>
          <div className="cube-face back-face"><div className="absolute inset-0 bg-slate-950/80"></div></div>
          <div className="cube-face bottom-face" style={{ backgroundColor: '#050402' }}></div>
        </div>
      </div>
    </div>
  );
};

const ImpactTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const avoided = payload.find((p: any) => p.dataKey === 'avoided')?.value || 0;
    const real = payload.find((p: any) => p.dataKey === 'real')?.value || 0;
    const bau = payload.find((p: any) => p.dataKey === 'bau')?.value || 0;
    const savings = payload.find((p: any) => p.dataKey === 'savings')?.value || 0;
    const milestone = payload[0]?.payload?.milestone;
    
    return (
      <div className="bg-slate-900 border border-white/10 p-5 rounded-2xl shadow-3xl backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-6 mb-4 border-b border-white/5 pb-3">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Corte {label}</p>
          <span className="text-[9px] font-black bg-primary/20 text-primary px-2 py-0.5 rounded uppercase tracking-widest">{milestone}</span>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-8">
            <span className="text-[11px] font-bold text-slate-400">Emisiones Reales</span>
            <span className="text-xs font-black text-white">{real.toLocaleString()} t</span>
          </div>
          <div className="flex items-center justify-between gap-8">
            <span className="text-[11px] font-bold text-slate-400">Escenario BAU</span>
            <span className="text-xs font-black text-slate-500 line-through decoration-red-500/30">{bau.toLocaleString()} t</span>
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between gap-8">
              <span className="text-[11px] font-black text-primary uppercase tracking-wider">Carbono Evitado</span>
              <span className="text-sm font-black text-primary">-{avoided.toLocaleString()} tCO2e</span>
            </div>
            <div className="flex items-center justify-between gap-8">
              <span className="text-[11px] font-black text-blue-400 uppercase tracking-wider">Ahorro Impositivo</span>
              <span className="text-sm font-black text-blue-400">${savings.toLocaleString()} USD</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const VetiverProject: React.FC = () => {
  const [selectedYearIdx, setSelectedYearIdx] = useState(4);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const [barColor] = useState('#11d421');
  const [lineColor] = useState('#11d421');

  const [simParams, setSimParams] = useState({ surface: '500', density: '10', stage: 'Maduro (Año 3+)' });
  const [errors, setErrors] = useState({ surface: '', density: '' });
  const [simResult, setSimResult] = useState<{capture: number, credits: number} | null>(null);

  const selectedData = PROJECTION_DATA[selectedYearIdx];

  useEffect(() => {
    const timer = setTimeout(() => setIsChartLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSimChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSimParams(prev => ({ ...prev, [name]: value }));
    if (name !== 'stage') {
      const num = parseFloat(value);
      let err = '';
      if (value.trim() === '') err = 'Requerido';
      else if (isNaN(num)) err = 'Inválido';
      else if (name === 'surface' && (num < 1 || num > 100000)) err = 'Rango: 1-100k';
      else if (name === 'density' && (num < 1 || num > 50)) err = 'Rango: 1-50';
      setErrors(prev => ({ ...prev, [name]: err }));
    }
  };

  const handleRecalculate = () => {
    setIsChartLoading(true);
    setTimeout(() => {
      setIsChartLoading(false);
      const factor = GROWTH_FACTORS[simParams.stage as keyof typeof GROWTH_FACTORS];
      const annualCapture = parseFloat(simParams.surface) * parseFloat(simParams.density) * factor;
      setSimResult({ capture: annualCapture, credits: (annualCapture / 1000) * 40 });
    }, 800);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .cube-container { position: relative; transform-style: preserve-3d; }
        .cube-face { position: absolute; width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.05); }
        .front-face { transform: translateZ(40px); background: #2b1d0e; }
        .back-face { transform: translateZ(-40px) rotateY(180deg); }
        .right-face { width: 80px; transform: rotateY(90deg) translateZ(100px); background: #1a1209; }
        .left-face { width: 80px; transform: rotateY(-90deg) translateZ(80px); background: #1a1209; }
        .top-face { height: 80px; transform: rotateX(90deg) translateZ(40px); }
        .bottom-face { height: 80px; transform: rotateX(-90deg) translateZ(240px); }
        .animate-spin-slow { animation: spin 10s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { rotate(360deg); } }
        @keyframes float-particle { 0% { transform: translateY(0) translateX(0); opacity: 0; } 50% { opacity: 0.5; } 100% { transform: translateY(-100px) translateX(20px); opacity: 0; } }
        .animate-float-particle { animation: float-particle linear infinite; }
        @keyframes root-sway-fluid { 0%, 100% { transform: rotate(-0.6deg) skewX(-0.2deg); } 50% { transform: rotate(0.6deg) skewX(0.2deg); } }
        @keyframes root-sway-lateral { 0%, 100% { transform: rotate(0.4deg) scaleX(1); } 50% { transform: rotate(-0.4deg) scaleX(1.02); } }
        @keyframes root-pulse { 0%, 100% { opacity: 0.5; filter: drop-shadow(0 0 2px var(--pulse-color)); } 50% { opacity: 0.9; filter: drop-shadow(0 0 6px var(--pulse-color)); } }
        .animate-root-sway-primary { transform-origin: 50px 0px; animation: root-sway-fluid 12s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite; }
        .animate-root-sway-lateral-1 { transform-origin: 50px 0px; animation: root-sway-lateral 15s ease-in-out infinite; animation-delay: -2s; }
        .animate-root-sway-lateral-2 { transform-origin: 50px 0px; animation: root-sway-lateral 18s ease-in-out infinite; animation-delay: -5s; }
        .animate-root-pulse-slow { animation: root-pulse 8s ease-in-out infinite; }
      `}</style>
      
      <header className="flex flex-wrap justify-between items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2 uppercase">Centro de Ingeniería Vetiver</h2>
          <p className="text-neutral-green-600 text-lg">Optimización biotecnológica de sumideros de carbono y control radicular.</p>
        </div>
        <button className="bg-white dark:bg-white/10 border border-primary/20 px-6 py-3 rounded-2xl flex items-center gap-2 text-sm font-black text-slate-800 dark:text-white hover:bg-neutral-green-50 transition-all shadow-xl active:scale-95">
          <span className="material-symbols-outlined text-sm">science</span> Exportar Dossier Técnico
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-slate-950 rounded-[48px] overflow-hidden border border-white/10 shadow-3xl h-[640px] relative">
              <Interactive3DStage depth={selectedData.depth} year={selectedData.year} color={barColor} isLarge />
              <div className="absolute bottom-10 left-10 flex gap-12 z-20 pointer-events-none">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Crecimiento Radicular</span>
                  <span className="text-xl font-black text-white">{selectedData.label}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Profundidad Efectiva</span>
                  <span className="text-xl font-black text-primary">{(selectedData.depth * 4).toFixed(2)}m</span>
                </div>
              </div>
              <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 z-20">
                {PROJECTION_DATA.map((d, i) => (
                  <button key={d.year} onClick={() => setSelectedYearIdx(i)} className={`size-12 rounded-full border flex items-center justify-center text-[11px] font-black transition-all ${selectedYearIdx === i ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-125' : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/20'}`}>{d.year.slice(-2)}</button>
                ))}
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-slate-900 md:col-span-2 p-10 rounded-[56px] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 pointer-events-none opacity-50"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12 relative z-10">
                  <div className="max-w-md">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="size-12 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-primary text-2xl">monitoring</span>
                      </div>
                      <h3 className="text-3xl font-black text-white uppercase tracking-tighter">Impacto Acumulado</h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">Análisis de mitigación: Emisiones operacionales vs. escenario proyectado sin intervención de barreras Vetiver.</p>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3 bg-white/5 p-4 rounded-3xl border border-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                      <div className="size-3 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(17,212,33,0.8)]"></div>
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-[0.2em]">Mitigación Activa</span>
                    </div>
                    <p className="text-2xl font-black text-white">55.6% <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Ahorro</span></p>
                  </div>
                </div>

                <div className="h-72 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={HISTORICAL_EMISSIONS}>
                      <defs>
                        <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#11d421" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#11d421" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="bauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} 
                        dy={15} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} 
                        unit=" t"
                        domain={[0, 5000]}
                      />
                      <Tooltip content={<ImpactTooltip />} />
                      <Area 
                        type="monotone" 
                        dataKey="bau" 
                        stroke="#475569" 
                        strokeWidth={1} 
                        strokeDasharray="10 5" 
                        fill="url(#bauGrad)" 
                        isAnimationActive={!isChartLoading}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="real" 
                        stroke="#11d421" 
                        strokeWidth={5} 
                        fill="url(#realGrad)" 
                        activeDot={{ r: 8, strokeWidth: 2, fill: '#fff', stroke: '#11d421' }}
                        isAnimationActive={!isChartLoading}
                      />
                      <Bar 
                        dataKey="avoided" 
                        barSize={6} 
                        fill="#3b82f6" 
                        radius={[4, 4, 0, 0]}
                        opacity={0.3}
                      />
                      <ReferenceLine y={1000} stroke="rgba(17, 212, 33, 0.2)" strokeDasharray="20 10" label={{ position: 'top', value: 'Meta de Neutralidad 2026', fill: '#11d421', fontSize: 10, fontWeight: 900, letterSpacing: '1px' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-10 pt-10 border-t border-white/5 relative z-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TCO2 Evitado Total</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-primary tracking-tighter">5,680</span>
                      <span className="text-[10px] font-black text-primary/60 bg-primary/10 px-1.5 rounded">t</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ahorro Estimado</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-blue-400 tracking-tighter">$142k</span>
                      <span className="text-[10px] font-black text-blue-400/60 bg-blue-400/10 px-1.5 rounded">USD</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confianza Auditada</p>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-black text-white tracking-tighter">98.2%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Certificación</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="size-4 rounded-full bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(17,212,33,0.5)]">
                        <span className="material-symbols-outlined text-[10px] font-black text-white">check</span>
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-widest">ISO 14064-1</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-white/5 p-8 rounded-[48px] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center">
                 <div className="space-y-6">
                    <MetricCard label="Capacidad de Captura" value="15.5" unit="k Ton" icon="eco" />
                    <MetricCard label="Eficiencia Radicular" value="92" unit="%" icon="expand" />
                 </div>
              </section>
           </div>
        </div>

        <div className="space-y-8">
           <section className="bg-white dark:bg-white/5 p-8 rounded-[48px] border border-primary/10 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                 <span className="material-symbols-outlined text-6xl text-primary">biotech</span>
              </div>
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 dark:text-white uppercase tracking-tight">
                <span className="material-symbols-outlined text-primary">analytics</span> Simulador v3.2
              </h3>
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <VetiverInput label="Área de Proyección (m²)" name="surface" value={simParams.surface} onChange={handleSimChange} error={errors.surface} icon="grid_view" type="number" />
                <VetiverInput label="Densidad de Siembra" name="density" value={simParams.density} onChange={handleSimChange} error={errors.density} icon="layers" type="number" />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado Biológico</label>
                  <select name="stage" value={simParams.stage} onChange={handleSimChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    {Object.keys(GROWTH_FACTORS).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <button onClick={handleRecalculate} className="w-full py-5 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-[24px] shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]">
                  <span className="material-symbols-outlined">refresh</span> Recalcular Escenario
                </button>
              </form>
              {simResult && (
                <div className="mt-8 p-6 bg-primary/5 rounded-[32px] border border-primary/20 animate-in zoom-in-95">
                  <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 text-center">Resultado Proyectado</p>
                  <div className="flex items-center justify-center gap-4">
                     <span className="text-4xl font-black text-slate-900 dark:text-white">{simResult.capture.toLocaleString()}</span>
                     <span className="text-xs font-bold text-primary">kg CO2/año</span>
                  </div>
                </div>
              )}
           </section>

           <section className="bg-slate-900 p-8 rounded-[48px] text-white shadow-3xl">
              <h3 className="text-lg font-black mb-8 uppercase tracking-tight flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">history_edu</span> Hitos Técnicos
              </h3>
              <div className="space-y-8">
                 {INNOVATION_LOG.map(item => (
                   <div key={item.id} className="flex gap-4 group cursor-pointer">
                      <div className="size-16 rounded-2xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-700" alt={item.title} />
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{item.date}</span>
                        <h4 className="text-sm font-black group-hover:text-primary transition-colors">{item.title}</h4>
                      </div>
                   </div>
                 ))}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

const VetiverInput: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, error?: string, icon: string, type?: string }> = ({ label, name, value, onChange, error, icon, type = "text" }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">{icon}</span>{label}</label>
    <div className="relative">
      <input type={type} name={name} value={value} onChange={onChange} className={`w-full bg-slate-50 dark:bg-white/5 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-2xl px-4 py-3 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all`} />
      {error && <p className="text-[10px] font-bold text-red-500 mt-1 ml-1">{error}</p>}
    </div>
  </div>
);

const MetricCard: React.FC<{ label: string, value: string, unit: string, icon: string }> = ({ label, value, unit, icon }) => (
  <div className="flex items-center justify-between p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/10 group hover:border-primary transition-all duration-300">
    <div className="flex items-center gap-4">
      <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-xl font-black text-slate-900 dark:text-white">{value} <span className="text-xs text-slate-500 font-bold">{unit}</span></p>
      </div>
    </div>
  </div>
);

export default VetiverProject;
