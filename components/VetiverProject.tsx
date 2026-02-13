
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as THREE from 'three';
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

const GROWTH_FACTORS = {
  'Establecido (Año 1-2)': 7.5,
  'Maduro (Año 3-5)': 15.0,
  'Consolidado (Año 6+)': 18.5,
};

// --- Optimized Three.js Visualization Component ---

interface ThreeRootStageProps {
  depth: number;
  year: string;
  color: string;
}

const ThreeRootStage: React.FC<ThreeRootStageProps> = ({ depth, year, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rootMeshRef = useRef<THREE.Group | null>(null);
  const requestRef = useRef<number>(0);

  // Memoize materials and geometries for reuse
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1.6, 3, 1.6), []);
  const cubeMaterial = useMemo(() => new THREE.MeshPhongMaterial({ 
    color: 0x14100b, 
    transparent: true, 
    opacity: 0.95,
    shininess: 5 
  }), []);
  
  const rootMaterial = useMemo(() => new THREE.MeshLambertMaterial({ 
    color: color,
    emissive: color,
    emissiveIntensity: 0.2
  }), [color]);

  // Procedural Root System Generator
  const generateRootSystem = useCallback((depthScale: number) => {
    const group = new THREE.Group();
    const numRoots = 15;
    const rootSegments = 16;
    
    for (let i = 0; i < numRoots; i++) {
      const points = [];
      const spread = 0.35;
      const angle = (i / numRoots) * Math.PI * 2;
      const radius = 0.1 + Math.random() * 0.2;
      
      for (let j = 0; j <= rootSegments; j++) {
        const t = j / rootSegments;
        const wiggleX = (Math.random() - 0.5) * 0.15 * t;
        const wiggleZ = (Math.random() - 0.5) * 0.15 * t;
        const x = Math.cos(angle) * radius + wiggleX + (Math.cos(angle) * spread * t);
        const z = Math.sin(angle) * radius + wiggleZ + (Math.sin(angle) * spread * t);
        const y = 1.5 - (t * 3 * depthScale); // From top of box down
        points.push(new THREE.Vector3(x, y, z));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      // Limit radial segments for performance
      const geometry = new THREE.TubeGeometry(curve, 16, 0.015 * (1.1 - points[points.length-1].y / 1.5), 6, false);
      const tube = new THREE.Mesh(geometry, rootMaterial);
      group.add(tube);
    }
    return group;
  }, [rootMaterial]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    camera.position.set(5, 3, 6.5);
    camera.lookAt(0, -0.5, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.6);
    scene.add(hemiLight);

    const pointLight = new THREE.PointLight(color, 1.5, 12);
    pointLight.position.set(0, 2, 0);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Visual Elements
    const soil = new THREE.Mesh(boxGeometry, cubeMaterial);
    scene.add(soil);

    const roots = generateRootSystem(depth);
    scene.add(roots);
    rootMeshRef.current = roots;

    // Animation Loop
    const animate = () => {
      if (!renderer || !scene || !camera) return;
      
      scene.rotation.y += 0.004;
      
      // Dynamic sway for roots
      if (rootMeshRef.current) {
        rootMeshRef.current.children.forEach((root, idx) => {
          root.rotation.z = Math.sin(Date.now() * 0.0008 + idx) * 0.015;
          root.rotation.x = Math.cos(Date.now() * 0.001 + idx) * 0.015;
        });
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      renderer.dispose();
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, []); // Run only on mount

  // Efficiently update depth without full re-mount
  useEffect(() => {
    if (sceneRef.current && rootMeshRef.current) {
      sceneRef.current.remove(rootMeshRef.current);
      // Proper disposal of old geometries to prevent memory leaks
      rootMeshRef.current.children.forEach((child: any) => {
        child.geometry.dispose();
      });
      
      const newRoots = generateRootSystem(depth);
      sceneRef.current.add(newRoots);
      rootMeshRef.current = newRoots;
    }
  }, [depth, generateRootSystem]);

  return (
    <div ref={containerRef} className="w-full h-full bg-gradient-to-b from-slate-900 via-slate-950 to-black relative overflow-hidden">
      <div className="absolute top-8 left-8 z-20 pointer-events-none">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
            <span className="size-2 rounded-full bg-primary animate-pulse"></span> Bio-Engineered System 4.0
          </span>
          <span className="text-3xl font-black text-white tracking-tighter">{year}</span>
        </div>
      </div>
      <div className="absolute bottom-8 left-8 z-20 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-md border border-white/5 px-4 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest">
          WebGL Performance Optimized
        </div>
      </div>
    </div>
  );
};

// --- Recharts Components & Main View ---

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
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Eficiencia de Terminal</span>
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
              <ThreeRootStage depth={selectedData.depth} year={selectedData.year} color={COLORS.primary} />
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
