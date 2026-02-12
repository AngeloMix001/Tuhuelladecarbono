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

const LERP_FACTOR = 0.12; // Velocidad de suavizado

const Interactive3DStage: React.FC<{ depth: number, year: string, color: string, isLarge?: boolean }> = ({ depth, year, color, isLarge }) => {
  // Estados "objetivo" para interpolación
  const targets = useRef<InteractiveState>({ ...INITIAL_STATE });
  // Estados actuales (los que se renderizan)
  const [current, setCurrent] = useState<InteractiveState>({ ...INITIAL_STATE });
  const [interactionMode, setInteractionMode] = useState<'rotate' | 'pan' | 'zoom' | 'idle'>('idle');
  
  const stageRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const requestRef = useRef<number>(null);

  // Función de interpolación lineal (Lerp)
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
    
    // Detectar modo inicial
    if (e.shiftKey || e.button === 1) setInteractionMode('pan');
    else setInteractionMode('rotate');

    stageRef.current?.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) {
      // Si no estamos arrastrando, detectar si shift está presionado para actualizar el indicador
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
    
    // Limpiar indicador de zoom después de un tiempo
    setTimeout(() => {
      if (!isDragging.current) setInteractionMode('idle');
    }, 1000);
  };

  const resetView = () => {
    targets.current = { ...INITIAL_STATE, isAutoOrbit: true };
  };

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
      {/* Indicadores de Modo Refinados */}
      <div className="absolute top-8 right-8 flex flex-col items-end gap-2 z-30 pointer-events-none">
        <div className={`px-4 py-2 rounded-2xl border transition-all duration-300 flex items-center gap-3 shadow-2xl backdrop-blur-md ${interactionMode !== 'idle' ? 'bg-primary/20 border-primary/40 text-primary scale-100 opacity-100' : 'bg-white/5 border-white/10 text-slate-500 scale-95 opacity-40'}`}>
          <span className="material-symbols-outlined text-lg">
            {interactionMode === 'pan' ? 'pan_tool' : interactionMode === 'zoom' ? 'zoom_in' : '3d_rotation'}
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">
            MODO: {interactionMode === 'idle' ? 'VISTA LIBRE' : interactionMode.toUpperCase()}
          </span>
        </div>
        <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest text-right pr-2">
          Shift + Drag para Panear • Scroll para Zoom
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="absolute top-8 left-8 flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span> Simulación Bio-Radicular v2.5
          </span>
          <span className="text-[32px] font-black text-white tracking-tighter">{year}</span>
        </div>
        <div className="absolute left-8 bottom-24 flex flex-col items-start gap-4">
           {[0, 1, 2, 3, 4].map(m => (
             <div key={m} className="flex items-center gap-2 opacity-20">
                <div className="w-6 h-[1px] bg-white"></div>
                <span className="text-[9px] font-bold text-white tracking-widest">{m}m DEPTH</span>
             </div>
           ))}
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
        <button 
          onClick={() => { targets.current.isAutoOrbit = !targets.current.isAutoOrbit; }} 
          className={`size-14 rounded-3xl flex items-center justify-center border shadow-2xl transition-all ${current.isAutoOrbit ? 'bg-primary text-white border-primary shadow-primary/30' : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'}`}
          title="Auto-Órbita"
        >
          <span className={`material-symbols-outlined text-2xl ${current.isAutoOrbit ? 'animate-spin-slow' : ''}`}>sync</span>
        </button>
        <button 
          onClick={resetView} 
          className="size-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-2xl"
          title="Resetear Cámara"
        >
          <span className="material-symbols-outlined text-2xl">center_focus_strong</span>
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 25 }).map((_, i) => (
          <div key={i} className="absolute size-1 bg-primary/20 rounded-full blur-[2px] animate-float-particle" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 8}s`, animationDuration: `${12 + Math.random() * 15}s` }} />
        ))}
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
              <path className="root-path animate-root-sway-lateral-1" d={`M 50 ${20 * depth} Q 30 ${70 * depth} 15 ${120 * depth} M 50 ${90 * depth} Q 25 ${140 * depth} 30 ${200 * depth}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})`, opacity: 0.8 }} />
              <path className="root-path animate-root-sway-lateral-2" d={`M 50 ${20 * depth} Q 70 ${70 * depth} 85 ${120 * depth} M 50 ${90 * depth} Q 75 ${140 * depth} 70 ${200 * depth}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${color})`, opacity: 0.8 }} />
              <path className="root-path animate-root-pulse-slow" d={`M 50 ${130 * depth} Q 58 ${160 * depth} 42 ${210 * depth}`} fill="none" stroke={color} strokeWidth="1" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})`, opacity: 0.5 }} />
            </svg>
          </div>
          <div className="cube-face right-face" style={{ filter: `brightness(${sideBrightness})` }}></div>
          <div className="cube-face left-face" style={{ filter: `brightness(${2-sideBrightness})` }}></div>
          <div className="cube-face back-face"><div className="absolute inset-0 bg-slate-950/90"></div></div>
          <div className="cube-face bottom-face" style={{ backgroundColor: '#030201' }}></div>
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
      <div className="bg-slate-900 border border-white/10 p-6 rounded-3xl shadow-3xl backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-8 mb-4 border-b border-white/5 pb-4">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Corte {label}</p>
          <span className="text-[9px] font-black bg-primary/20 text-primary px-3 py-1 rounded-full uppercase tracking-widest">{milestone}</span>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-10">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Emisiones Reales</span>
            <span className="text-sm font-black text-white">{real.toLocaleString()} t</span>
          </div>
          <div className="flex items-center justify-between gap-10">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Escenario BAU</span>
            <span className="text-sm font-black text-slate-600 line-through decoration-red-500/40">{bau.toLocaleString()} t</span>
          </div>
          <div className="pt-4 mt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center justify-between gap-10">
              <span className="text-[11px] font-black text-primary uppercase tracking-widest">Carbono Evitado</span>
              <span className="text-base font-black text-primary">-{avoided.toLocaleString()} tCO2e</span>
            </div>
            <div className="flex items-center justify-between gap-10">
              <span className="text-[11px] font-black text-blue-400 uppercase tracking-widest">Ahorro Estimado</span>
              <span className="text-base font-black text-blue-400">${savings.toLocaleString()} USD</span>
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

  const [simParams, setSimParams] = useState({ surface: '500', density: '10', stage: 'Maduro (Año 3+)' });
  const [errors, setErrors] = useState({ surface: '', density: '' });
  const [simResult, setSimResult] = useState<{capture: number, credits: number} | null>(null);

  const selectedData = PROJECTION_DATA[selectedYearIdx];

  useEffect(() => {
    const timer = setTimeout(() => setIsChartLoading(false), 1000);
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
    }, 600);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 pb-20">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .cube-container { position: relative; transform-style: preserve-3d; }
        .cube-face { position: absolute; width: 100%; height: 100%; border: 1px solid rgba(255,255,255,0.04); transition: filter 0.3s ease; }
        .front-face { transform: translateZ(40px); background: #23180c; border-radius: 2px; }
        .back-face { transform: translateZ(-40px) rotateY(180deg); }
        .right-face { width: 80px; transform: rotateY(90deg) translateZ(100px); background: #150e07; }
        .left-face { width: 80px; transform: rotateY(-90deg) translateZ(80px); background: #150e07; }
        .top-face { height: 80px; transform: rotateX(90deg) translateZ(40px); }
        .bottom-face { height: 80px; transform: rotateX(-90deg) translateZ(240px); }
        
        .animate-spin-slow { animation: spin 15s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @keyframes float-particle { 0% { transform: translateY(0) translateX(0); opacity: 0; } 20% { opacity: 0.3; } 80% { opacity: 0.3; } 100% { transform: translateY(-120px) translateX(30px); opacity: 0; } }
        .animate-float-particle { animation: float-particle linear infinite; }
        
        @keyframes root-sway-fluid { 0%, 100% { transform: rotate(-0.8deg) skewX(-0.3deg); } 50% { transform: rotate(0.8deg) skewX(0.3deg); } }
        @keyframes root-sway-lateral { 0%, 100% { transform: rotate(0.5deg) scaleX(1); } 50% { transform: rotate(-0.5deg) scaleX(1.04); } }
        @keyframes root-pulse { 0%, 100% { opacity: 0.4; filter: drop-shadow(0 0 3px var(--pulse-color)); } 50% { opacity: 0.8; filter: drop-shadow(0 0 10px var(--pulse-color)); } }
        
        .animate-root-sway-primary { transform-origin: 50px 0px; animation: root-sway-fluid 14s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
        .animate-root-sway-lateral-1 { transform-origin: 50px 0px; animation: root-sway-lateral 16s ease-in-out infinite; animation-delay: -3s; }
        .animate-root-sway-lateral-2 { transform-origin: 50px 0px; animation: root-sway-lateral 20s ease-in-out infinite; animation-delay: -7s; }
        .animate-root-pulse-slow { animation: root-pulse 10s ease-in-out infinite; }
      `}</style>
      
      <header className="flex flex-wrap justify-between items-end gap-6">
        <div className="max-w-2xl">
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase">Centro Bio-Ingeniería Vetiver</h2>
          <p className="text-neutral-green-600 text-xl font-medium">Modelado predictivo de sumideros radiculares y captura biológica de CO₂.</p>
        </div>
        <button className="bg-white dark:bg-white/10 border border-primary/20 px-8 py-4 rounded-[24px] flex items-center gap-3 text-xs font-black text-slate-800 dark:text-white hover:bg-neutral-green-50 transition-all shadow-xl active:scale-95 group">
          <span className="material-symbols-outlined text-lg group-hover:rotate-12 transition-transform">science</span> DESCARGAR REPORTE TÉCNICO
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <section className="bg-slate-950 rounded-[56px] overflow-hidden border border-white/10 shadow-3xl h-[680px] relative ring-1 ring-white/5">
              <Interactive3DStage depth={selectedData.depth} year={selectedData.year} color={barColor} isLarge />
              
              <div className="absolute bottom-12 left-12 flex gap-16 z-20 pointer-events-none">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estimación Biomasa</span>
                  <span className="text-3xl font-black text-white tracking-tighter">{selectedData.label}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Profundidad Sistema</span>
                  <span className="text-3xl font-black text-primary tracking-tighter">{(selectedData.depth * 4).toFixed(2)}m</span>
                </div>
              </div>

              <div className="absolute top-1/2 right-10 -translate-y-1/2 flex flex-col gap-5 z-20">
                {PROJECTION_DATA.map((d, i) => (
                  <button 
                    key={d.year} 
                    onClick={() => setSelectedYearIdx(i)} 
                    className={`size-14 rounded-full border flex items-center justify-center text-xs font-black transition-all duration-500 ${selectedYearIdx === i ? 'bg-primary text-white border-primary shadow-2xl shadow-primary/40 scale-125' : 'bg-black/40 text-slate-400 border-white/10 hover:border-white/30 hover:bg-black/60'}`}
                  >
                    {d.year.slice(-2)}
                  </button>
                ))}
              </div>
           </section>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <section className="bg-slate-900 md:col-span-2 p-12 rounded-[64px] border border-white/5 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/10 via-transparent to-blue-500/10 pointer-events-none opacity-40"></div>
                
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12 relative z-10">
                  <div className="max-w-md">
                    <div className="flex items-center gap-5 mb-4">
                      <div className="size-14 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center shadow-inner">
                        <span className="material-symbols-outlined text-primary text-3xl">monitoring</span>
                      </div>
                      <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Mitigación Activa</h3>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed">Auditoría de emisiones evitadas mediante la implementación del sistema radicular en zonas operativas críticas.</p>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-3 bg-white/5 px-6 py-5 rounded-[32px] border border-white/10 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="size-3 rounded-full bg-primary animate-pulse shadow-[0_0_15px_rgba(17,212,33,1)]"></div>
                      <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Eficiencia Bio-Filtro</span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tighter">55.6% <span className="text-xs text-slate-500 font-black uppercase tracking-widest ml-1">NET SAVING</span></p>
                  </div>
                </div>

                <div className="h-80 w-full relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={HISTORICAL_EMISSIONS}>
                      <defs>
                        <linearGradient id="realGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#11d421" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#11d421" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="bauGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#64748b" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="rgba(255,255,255,0.06)" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', letterSpacing: '1px' }} 
                        dy={20} 
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
                        strokeWidth={2} 
                        strokeDasharray="12 6" 
                        fill="url(#bauGrad)" 
                        isAnimationActive={!isChartLoading}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="real" 
                        stroke="#11d421" 
                        strokeWidth={6} 
                        fill="url(#realGrad)" 
                        activeDot={{ r: 10, strokeWidth: 3, fill: '#fff', stroke: '#11d421' }}
                        isAnimationActive={!isChartLoading}
                      />
                      <Bar 
                        dataKey="avoided" 
                        barSize={8} 
                        fill="#3b82f6" 
                        radius={[6, 6, 0, 0]}
                        opacity={0.4}
                      />
                      <ReferenceLine y={1000} stroke="rgba(17, 212, 33, 0.25)" strokeDasharray="15 10" label={{ position: 'top', value: 'TARGET ZERO 2026', fill: '#11d421', fontSize: 11, fontWeight: 900, letterSpacing: '2px' }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/10 relative z-10">
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TCO2 Evitado Total</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-primary tracking-tighter">5,680</span>
                      <span className="text-[11px] font-black text-primary/70 bg-primary/10 px-2 py-0.5 rounded uppercase">tons</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Créditos Potenciales</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-blue-400 tracking-tighter">$142k</span>
                      <span className="text-[11px] font-black text-blue-400/70 bg-blue-400/10 px-2 py-0.5 rounded uppercase">usd</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Precisión Sensorica</p>
                    <div className="flex items-center gap-3">
                      <span className="text-4xl font-black text-white tracking-tighter">98.2%</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Status de Auditoría</p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="size-5 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(17,212,33,0.6)]">
                        <span className="material-symbols-outlined text-[12px] font-black text-white">verified</span>
                      </div>
                      <span className="text-xs font-black text-white uppercase tracking-widest">ISO 14064-3</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-white dark:bg-white/5 p-10 rounded-[64px] border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-center ring-1 ring-slate-100 dark:ring-white/5">
                 <div className="space-y-8">
                    <MetricCard label="Capacidad de Captura Bio" value="15.5" unit="k Ton" icon="eco" />
                    <MetricCard label="Optimización Radicular" value="92.4" unit="%" icon="expand" />
                 </div>
              </section>
           </div>
        </div>

        <div className="space-y-10">
           <section className="bg-white dark:bg-white/5 p-10 rounded-[56px] border border-primary/20 shadow-2xl relative overflow-hidden ring-1 ring-primary/5">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                 <span className="material-symbols-outlined text-8xl text-primary">biotech</span>
              </div>
              <h3 className="text-2xl font-black mb-10 flex items-center gap-4 dark:text-white uppercase tracking-tighter">
                <span className="material-symbols-outlined text-primary text-3xl">analytics</span> Simulador v3.2
              </h3>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <VetiverInput label="Área de Proyección (m²)" name="surface" value={simParams.surface} onChange={handleSimChange} error={errors.surface} icon="grid_view" type="number" />
                <VetiverInput label="Densidad de Siembra (p/m²)" name="density" value={simParams.density} onChange={handleSimChange} error={errors.density} icon="layers" type="number" />
                <div className="space-y-2.5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Estado Biológico</label>
                  <div className="relative">
                    <select name="stage" value={simParams.stage} onChange={handleSimChange} className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] px-5 py-4 text-sm font-bold dark:text-white outline-none focus:ring-2 focus:ring-primary/20 appearance-none cursor-pointer">
                      {Object.keys(GROWTH_FACTORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">expand_more</span>
                  </div>
                </div>
                <button 
                  onClick={handleRecalculate} 
                  className="w-full py-6 bg-slate-900 dark:bg-primary text-white font-black rounded-[28px] shadow-2xl transition-all flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">refresh</span> RECALCULAR PROYECCIÓN
                </button>
              </form>
              {simResult && (
                <div className="mt-10 p-8 bg-primary/5 rounded-[40px] border border-primary/20 animate-in zoom-in-95 shadow-inner">
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 text-center">Output Bio-Modelado</p>
                  <div className="flex flex-col items-center justify-center gap-2">
                     <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{simResult.capture.toLocaleString()}</span>
                       <span className="text-sm font-black text-primary/70 uppercase">kg/y</span>
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Capacidad neta de absorción</span>
                  </div>
                </div>
              )}
           </section>

           <section className="bg-slate-900 p-10 rounded-[56px] text-white shadow-3xl ring-1 ring-white/5">
              <h3 className="text-xl font-black mb-10 uppercase tracking-tight flex items-center gap-4">
                <span className="material-symbols-outlined text-primary">history_edu</span> Bitácora Técnica
              </h3>
              <div className="space-y-10">
                 {INNOVATION_LOG.map(item => (
                   <div key={item.id} className="flex gap-6 group cursor-pointer items-center">
                      <div className="size-20 rounded-[24px] overflow-hidden shrink-0 border border-white/10 shadow-2xl relative">
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">visibility</span>
                        </div>
                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-125 transition-transform duration-1000" alt={item.title} />
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1.5">{item.date}</span>
                        <h4 className="text-base font-black group-hover:text-primary transition-colors leading-tight">{item.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{item.category}</p>
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
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
      <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
      {label}
    </label>
    <div className="relative">
      <input 
        type={type} 
        name={name} 
        value={value} 
        onChange={onChange} 
        className={`w-full bg-slate-50 dark:bg-white/5 border ${error ? 'border-red-500' : 'border-slate-200 dark:border-white/10'} rounded-[20px] px-6 py-4 text-sm font-black dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner`} 
      />
      {error && <p className="text-[10px] font-bold text-red-500 mt-2 ml-2 animate-bounce">{error}</p>}
    </div>
  </div>
);

const MetricCard: React.FC<{ label: string, value: string, unit: string, icon: string }> = ({ label, value, unit, icon }) => (
  <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-[32px] border border-slate-100 dark:border-white/10 group hover:border-primary transition-all duration-500 shadow-sm">
    <div className="flex items-center gap-6">
      <div className="size-14 rounded-[20px] bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
          <span className="text-xs text-slate-500 font-black uppercase">{unit}</span>
        </div>
      </div>
    </div>
    <span className="material-symbols-outlined text-slate-200 group-hover:text-primary transition-colors">trending_up</span>
  </div>
);

export default VetiverProject;