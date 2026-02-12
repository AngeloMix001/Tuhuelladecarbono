
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Cell,
  Legend
} from 'recharts';
import { COLORS } from '../constants';

const HISTORICAL_EMISSIONS = [
  { year: '2022', real: 2400, bau: 3550, avoided: 1150, savings: 28750, milestone: 'Expansión Sur' },
  { year: '2023', real: 2050, bau: 3800, avoided: 1750, savings: 43750, milestone: 'Riego Solar' },
  { year: '2024', real: 1820, bau: 4100, avoided: 2280, savings: 57000, milestone: 'Fase III' },
  { year: '2025', real: 1200, bau: 4400, avoided: 3200, savings: 80000, milestone: 'Electrificación' },
  { year: '2026', real: 850, bau: 4800, avoided: 3950, savings: 98750, milestone: 'Optimización IA' },
];

const PROJECTION_DATA = [
  { label: '1,950 kg', h: '35%', year: '2022', desc: 'Desarrollo maduro', depth: 0.65 },
  { label: '2,400 kg', h: '55%', year: '2023', desc: 'Maduración plena', depth: 0.85 },
  { label: '3,100 kg', h: '75%', year: '2024', desc: 'Capacidad óptima', depth: 1.0 },
  { label: '3,800 kg', h: '90%', year: '2025', desc: 'Fase expansiva', depth: 1.15 },
  { label: '4,200 kg', h: '100%', year: '2026', desc: 'Máximo biológico', highlight: true, depth: 1.25 },
];

const INNOVATION_LOG = [
  {
    id: 1,
    title: "Consolidación Vetiver Fase III",
    category: "Biológico",
    date: "Enero 2026",
    image: "https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&q=80&w=800",
    desc: "10 hectáreas de Vetiver alcanzando su máximo potencial de captura en el cinturón verde.",
    status: "Operativo"
  },
  {
    id: 2,
    title: "Monitoreo Satelital",
    category: "Tecnología",
    date: "Marzo 2026",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80&w=800",
    desc: "Integración de datos satelitales para verificación de biomasa en tiempo real.",
    status: "Activo"
  },
  {
    id: 3,
    title: "Micro-red Hidrógeno",
    category: "Energía",
    date: "Mayo 2026",
    image: "https://images.unsplash.com/photo-1563791877225-450f34024508?auto=format&fit=crop&q=80&w=800",
    desc: "Primeras pruebas de maquinaria pesada propulsada por hidrógeno generado in-situ.",
    status: "Piloto"
  },
];

const GROWTH_FACTORS = {
  'Establecido (Año 1-2)': 7.5,
  'Maduro (Año 3-5)': 15.0,
  'Consolidado (Año 6+)': 18.5,
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

const LERP_FACTOR = 0.12; 

const Interactive3DStage: React.FC<{ depth: number, year: string, color: string, isLarge?: boolean }> = ({ depth, year, color, isLarge }) => {
  const targets = useRef<InteractiveState>({ ...INITIAL_STATE });
  const [current, setCurrent] = useState<InteractiveState>({ ...INITIAL_STATE });
  const [interactionMode, setInteractionMode] = useState<'rotate' | 'pan' | 'zoom' | 'idle'>('idle');
  
  const stageRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);

  const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;

  const animate = useCallback(() => {
    if (targets.current.isAutoOrbit && !isDragging.current) {
      targets.current.rotateY += 0.2;
    }

    setCurrent(prev => ({
      rotateX: lerp(prev.rotateX, targets.current.rotateX, LERP_FACTOR),
      rotateY: lerp(prev.rotateY, targets.current.rotateY, LERP_FACTOR),
      zoom: lerp(prev.zoom, targets.current.zoom, LERP_FACTOR),
      panX: lerp(prev.panX, targets.current.panX, LERP_FACTOR),
      panY: lerp(prev.panY, targets.current.panY, LERP_FACTOR),
      isAutoOrbit: targets.current.isAutoOrbit
    }));

    requestRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
    targets.current.isAutoOrbit = false;
    if (e.shiftKey || e.button === 1) setInteractionMode('pan');
    else setInteractionMode('rotate');
    stageRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) {
      if (e.shiftKey) setInteractionMode('pan');
      else setInteractionMode('idle');
      return;
    }
    const deltaX = e.clientX - lastPos.current.x;
    const deltaY = e.clientY - lastPos.current.y;
    if (e.shiftKey || e.button === 1) {
      setInteractionMode('pan');
      targets.current.panX += deltaX;
      targets.current.panY += deltaY;
    } else {
      setInteractionMode('rotate');
      targets.current.rotateY += deltaX * 0.4;
      targets.current.rotateX = Math.max(-60, Math.min(60, targets.current.rotateX - deltaY * 0.4));
    }
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    setInteractionMode('idle');
    stageRef.current?.releasePointerCapture(e.pointerId);
  };

  const handleWheel = (e: React.WheelEvent) => {
    setInteractionMode('zoom');
    const zoomSpeed = 0.0015;
    targets.current.zoom = Math.max(0.4, Math.min(3, targets.current.zoom - e.deltaY * zoomSpeed));
    setTimeout(() => { if (!isDragging.current) setInteractionMode('idle'); }, 1000);
  };

  const resetView = () => { targets.current = { ...INITIAL_STATE, isAutoOrbit: true }; };

  const brightness = Math.cos((current.rotateY * Math.PI) / 180) * 0.3 + 0.9;
  const sideBrightness = Math.sin((current.rotateY * Math.PI) / 180) * 0.3 + 0.7;

  return (
    <div 
      ref={stageRef}
      className="relative w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden select-none bg-gradient-to-b from-slate-900 via-slate-950 to-black touch-none group/viewer"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
      onDoubleClick={resetView}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-8 right-8 flex flex-col items-end gap-2 z-30 pointer-events-none">
        <div className={`px-4 py-2 rounded-2xl border transition-all duration-300 flex items-center gap-3 shadow-2xl backdrop-blur-md ${interactionMode !== 'idle' ? 'bg-primary/20 border-primary/40 text-primary scale-100 opacity-100' : 'bg-white/5 border-white/10 text-slate-500 scale-95 opacity-40'}`}>
          <span className="material-symbols-outlined text-lg">
            {interactionMode === 'pan' ? 'pan_tool' : interactionMode === 'zoom' ? 'zoom_in' : '3d_rotation'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">MODO: {interactionMode === 'idle' ? 'VISTA LIBRE' : interactionMode.toUpperCase()}</span>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-8 left-8 flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span> Bio-Simulator 2026 v3.0
          </span>
          <span className="text-[32px] font-black text-white tracking-tighter">{year}</span>
        </div>
      </div>

      <div className="perspective-1000" style={{ transform: `translate(${current.panX}px, ${current.panY}px) scale(${current.zoom})` }}>
        <div className="cube-container" style={{ transform: `rotateX(${current.rotateX}deg) rotateY(${current.rotateY}deg)`, width: isLarge ? '240px' : '180px', height: isLarge ? '360px' : '280px' }}>
          <div className="cube-face top-face flex items-center justify-center overflow-hidden" style={{ backgroundColor: color }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.5)_100%)]"></div>
            <div className="text-white/80 drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <span className="material-symbols-outlined text-6xl animate-pulse">eco</span>
            </div>
          </div>
          <div className="cube-face front-face" style={{ filter: `brightness(${brightness})` }}>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/90"></div>
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 200">
              <path className="root-path animate-root-sway-primary" d={`M 50 0 L 50 ${200 * depth}`} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color})`, opacity: 0.9 }} />
            </svg>
          </div>
          <div className="cube-face right-face" style={{ filter: `brightness(${sideBrightness})` }}></div>
          <div className="cube-face left-face" style={{ filter: `brightness(${2-sideBrightness})` }}></div>
        </div>
      </div>
    </div>
  );
};

const ImpactTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const avoided = payload.find((p: any) => p.dataKey === 'avoided')?.value || 0;
    const real = payload.find((p: any) => p.dataKey === 'real')?.value || 0;
    const milestone = payload[0]?.payload?.milestone;
    
    return (
      <div className="bg-slate-900/95 border border-white/20 p-6 rounded-[24px] shadow-3xl backdrop-blur-xl ring-1 ring-white/10">
        <div className="flex items-center justify-between gap-8 mb-4 border-b border-white/10 pb-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Corte {label}</p>
          <span className="text-[9px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">{milestone}</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-10">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Emisiones Brutas</span>
            <span className="text-sm font-black text-white">{real.toLocaleString()} t</span>
          </div>
          <div className="pt-4 mt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between gap-10">
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">Total Evitado</span>
              <span className="text-base font-black text-primary">-{avoided.toLocaleString()} tCO2e</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MitigationLever: React.FC<{ label: string, value: string, percent: number, color: string, icon: string }> = ({ label, value, percent, color, icon }) => (
  <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] hover:border-white/30 transition-all group">
    <div className="flex items-center justify-between mb-4">
      <div className={`size-10 rounded-xl flex items-center justify-center text-white`} style={{ backgroundColor: color }}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aporte: {percent}%</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter mb-4">{value} <span className="text-[10px] text-slate-500 font-bold uppercase">tCO₂e</span></p>
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

const VetiverProject: React.FC = () => {
  const [selectedYearIdx, setSelectedYearIdx] = useState(4);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const selectedData = PROJECTION_DATA[selectedYearIdx];

  const [simParams, setSimParams] = useState({ surface: '1500', density: '12', stage: 'Consolidado (Año 6+)' });
  const [simResult, setSimResult] = useState<{capture: number, credits: number} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRecalculate = () => {
    setIsChartLoading(true);
    setTimeout(() => {
      setIsChartLoading(false);
      const factor = GROWTH_FACTORS[simParams.stage as keyof typeof GROWTH_FACTORS];
      const annualCapture = parseFloat(simParams.surface) * parseFloat(simParams.density) * factor;
      setSimResult({ capture: annualCapture, credits: (annualCapture / 1000) * 65 });
    }, 600);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="flex flex-wrap justify-between items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase">Mitigación Consolidada 2026</h2>
          <p className="text-neutral-green-600 text-xl font-medium">Estamos en 2026. Análisis de impacto final hacia la meta neta negativa de 2027.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-6 py-3 rounded-[20px] flex items-center gap-3 text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all group">
             <span className="material-symbols-outlined text-lg">public</span> CERTIFICACIÓN 2026
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-slate-900 p-10 md:p-14 rounded-[56px] border border-white/5 shadow-3xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/15 via-transparent to-blue-500/10 pointer-events-none opacity-40"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12 relative z-10">
              <div className="max-w-md">
                <div className="flex items-center gap-5 mb-4">
                  <div className="size-16 rounded-[24px] bg-primary/20 border border-primary/30 flex items-center justify-center shadow-inner">
                    <span className="material-symbols-outlined text-primary text-4xl animate-pulse">radar</span>
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Impacto 2026</h3>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Consolidación de la trayectoria de descarbonización. El sistema valida el balance negativo logrado en 2026.
                </p>
              </div>
              
              <div className="flex flex-col md:items-end gap-3 bg-white/5 px-8 py-6 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-2xl group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-3 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Eficiencia Global 2026</span>
                </div>
                <p className="text-5xl font-black text-white tracking-tighter">88.2% <span className="text-xs text-slate-500 font-black uppercase tracking-widest ml-1">NET GAIN</span></p>
              </div>
            </div>

            <div className="h-[400px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={HISTORICAL_EMISSIONS} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', letterSpacing: '2px' }} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} unit=" t" />
                  <Tooltip content={<ImpactTooltip />} />
                  <Area type="monotone" dataKey="real" name="Emisiones Netas" stroke={COLORS.primary} strokeWidth={8} fillOpacity={0.1} fill={COLORS.primary} isAnimationActive={!isChartLoading} />
                  <Bar dataKey="avoided" barSize={10} fill="#3b82f6" radius={[8, 8, 0, 0]} opacity={0.5} name="Carbono Evitado" />
                  <ReferenceLine y={500} stroke="rgba(17, 212, 33, 0.4)" strokeDasharray="20 10" label={{ position: 'right', value: 'TARGET ZERO 2027', fill: COLORS.primary, fontSize: 11, fontWeight: 900, letterSpacing: '3px' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-16 border-t border-white/10">
              <MitigationLever label="Sumideros Vetiver" value="2,840" percent={65} color={COLORS.primary} icon="eco" />
              <MitigationLever label="Energía Renovable" value="1,280" percent={25} color={COLORS.blue500} icon="solar_power" />
              <MitigationLever label="Flota Hidrógeno" value="460" percent={10} color="#f97316" icon="local_shipping" />
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="bg-slate-950 rounded-[56px] overflow-hidden border border-white/10 shadow-3xl h-[600px] relative ring-1 ring-white/5 group">
              <Interactive3DStage depth={selectedData.depth} year={selectedData.year} color={COLORS.primary} />
              <div className="absolute top-1/2 right-8 -translate-y-1/2 flex flex-col gap-4 z-20">
                {PROJECTION_DATA.map((d, i) => (
                  <button 
                    key={d.year} 
                    onClick={() => setSelectedYearIdx(i)} 
                    className={`size-12 rounded-2xl border flex items-center justify-center text-[10px] font-black transition-all duration-500 ${selectedYearIdx === i ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/40 scale-110' : 'bg-black/60 text-slate-400 border-white/10 hover:border-white/30'}`}
                  >
                    {d.year.slice(-2)}
                  </button>
                ))}
              </div>
           </section>

           <section className="bg-white dark:bg-white/5 p-10 rounded-[48px] border border-primary/20 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xl font-black mb-8 flex items-center gap-4 dark:text-white uppercase tracking-tighter">
                <span className="material-symbols-outlined text-primary text-2xl">analytics</span> Simulador Meta 2027
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Área Expansión (m²)</label>
                  <input type="number" name="surface" value={simParams.surface} onChange={(e) => setSimParams({...simParams, surface: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] px-6 py-4 text-sm font-black dark:text-white focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <button onClick={handleRecalculate} className="w-full py-5 bg-slate-900 dark:bg-primary text-white font-black rounded-[24px] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined">refresh</span> PROYECTAR 2027
                </button>
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default VetiverProject;
