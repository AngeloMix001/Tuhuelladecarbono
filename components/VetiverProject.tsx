
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
  { year: '2026', real: 850, bau: 4800, avoided: 3950, savings: 98750, milestone: 'Optimización IA' },
  { year: '2027', real: 500, bau: 5100, avoided: 4600, savings: 115000, milestone: 'Net Zero Target' },
  { year: '2028', real: 320, bau: 5400, avoided: 5080, savings: 127000, milestone: 'Autonomía H2' },
  { year: '2029', real: 150, bau: 5800, avoided: 5650, savings: 141250, milestone: 'Carbono Negativo' },
  { year: '2030', real: -200, bau: 6200, avoided: 6400, savings: 160000, milestone: 'Liderazgo Global' },
];

// Cálculos basados en 250m2 iniciales + 50m2/año con densidad 5 plantas/m2
// Factores progresivos de maduración biológica aplicados
const PROJECTION_DATA = [
  { label: '9,375 kg', year: '2026', depth: 1.0, leaves: 0.8 }, // 250m2 * 5 * 7.5 (Establecido)
  { label: '13,500 kg', year: '2027', depth: 1.4, leaves: 1.1 }, // 300m2 * 5 * 9.0 (Transición)
  { label: '21,000 kg', year: '2028', depth: 1.9, leaves: 1.4 }, // 350m2 * 5 * 12.0 (Madurando)
  { label: '30,000 kg', year: '2029', depth: 2.4, leaves: 1.8 }, // 400m2 * 5 * 15.0 (Maduro)
  { label: '41,625 kg', year: '2030', depth: 3.0, leaves: 2.2 }, // 450m2 * 5 * 18.5 (Consolidado)
];

const GROWTH_FACTORS = {
  'Establecido (Año 1-2)': 7.5,
  'Maduro (Año 3-5)': 15.0,
  'Consolidado (Año 6+)': 18.5,
};

// --- REDISEÑADO: Vetiver Bio-Digital Stage 3D ---

interface VetiverPlantStageProps {
  depth: number;
  leaves: number;
  year: string;
  color: string;
}

const VetiverPlantStage: React.FC<VetiverPlantStageProps> = ({ depth, leaves, year, color }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const plantGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 2, 12);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const plantGroup = new THREE.Group();
    plantGroupRef.current = plantGroup;
    scene.add(plantGroup);

    // --- GENERAR PLANTA PROCEDIMENTAL ---
    const updatePlant = (dScale: number, lScale: number) => {
      plantGroup.clear();

      // Materiales
      const leafMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
      const rootMat = new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });

      // Hojas (Crecimiento hacia arriba)
      for (let i = 0; i < 60; i++) {
        const points = [];
        const angle = (i / 60) * Math.PI * 2;
        const spread = 0.5 + Math.random() * 1.5;
        const height = (2 + Math.random() * 2) * lScale;
        
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          const x = Math.cos(angle) * spread * t * t;
          const z = Math.sin(angle) * spread * t * t;
          const y = height * Math.sin(t * Math.PI / 2);
          points.push(new THREE.Vector3(x, y, z));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        plantGroup.add(new THREE.Line(geom, leafMat));
      }

      // Raíces (Crecimiento hacia abajo)
      for (let i = 0; i < 80; i++) {
        const points = [];
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.random() * 0.3;
        const rootDepth = (4 + Math.random() * 3) * dScale;
        
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          const x = Math.cos(angle) * radius * (1 - t * 0.5) + (Math.random() - 0.5) * 0.1 * t;
          const z = Math.sin(angle) * radius * (1 - t * 0.5) + (Math.random() - 0.5) * 0.1 * t;
          const y = -t * rootDepth;
          points.push(new THREE.Vector3(x, y, z));
        }
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        plantGroup.add(new THREE.Line(geom, rootMat));
      }

      // Núcleo de Energía en la base
      const coreGeom = new THREE.SphereGeometry(0.3, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending });
      const core = new THREE.Mesh(coreGeom, coreMat);
      core.position.y = 0;
      plantGroup.add(core);
    };

    updatePlant(depth, leaves);

    // --- PARTÍCULAS DE CO2 ---
    const partCount = 300;
    const partGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) positions[i] = (Math.random() - 0.5) * 15;
    partGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const partMat = new THREE.PointsMaterial({ color: color, size: 0.05, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(partGeom, partMat);
    particlesRef.current = particles;
    scene.add(particles);

    const animate = () => {
      const time = Date.now() * 0.001;
      if (plantGroupRef.current) plantGroupRef.current.rotation.y += 0.003;

      if (particlesRef.current) {
        const pos = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < partCount; i++) {
          const ix = i * 3, iy = i * 3 + 1, iz = i * 3 + 2;
          // Atracción hacia las hojas (y > 0)
          pos[ix] *= 0.985;
          pos[iz] *= 0.985;
          pos[iy] += (Math.sin(time + i) * 0.01) + 0.02;

          if (pos[iy] > 5) {
            pos[ix] = (Math.random() - 0.5) * 10;
            pos[iz] = (Math.random() - 0.5) * 10;
            pos[iy] = -5;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(requestRef.current);
      renderer.dispose();
    };
  }, [color]);

  // Actualizar crecimiento cuando cambian los props
  useEffect(() => {
    if (plantGroupRef.current) {
      const leafMat = new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
      const rootMat = new THREE.LineBasicMaterial({ color: '#3b82f6', transparent: true, opacity: 0.4, blending: THREE.AdditiveBlending });
      
      plantGroupRef.current.clear();
      
      // Re-generar Hojas
      for (let i = 0; i < 60; i++) {
        const points = [];
        const angle = (i / 60) * Math.PI * 2;
        const spread = 0.5 + Math.random() * 1.5;
        const h = (2 + Math.random() * 2) * leaves;
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          points.push(new THREE.Vector3(Math.cos(angle) * spread * t * t, h * Math.sin(t * Math.PI / 2), Math.sin(angle) * spread * t * t));
        }
        plantGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), leafMat));
      }
      // Re-generar Raíces
      for (let i = 0; i < 80; i++) {
        const points = [];
        const angle = Math.random() * Math.PI * 2;
        const d = (4 + Math.random() * 3) * depth;
        for (let j = 0; j <= 10; j++) {
          const t = j / 10;
          points.push(new THREE.Vector3(Math.cos(angle) * 0.2 * (1-t), -t * d, Math.sin(angle) * 0.2 * (1-t)));
        }
        plantGroupRef.current.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), rootMat));
      }
    }
  }, [depth, leaves, color]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#030703] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none p-10 flex flex-col justify-between z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="size-2 bg-primary rounded-full animate-ping"></div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.5em] drop-shadow-[0_0_8px_rgba(17,212,33,0.8)]">VETIVER DIGITAL TWIN</span>
            </div>
            <h4 className="text-4xl font-black text-white tracking-tighter tabular-nums">{year}</h4>
          </div>
          <div className="text-right bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/5">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Capacidad Absorción</p>
            <p className="text-xl font-black text-primary uppercase tracking-tighter">
              {PROJECTION_DATA.find(d => d.year === year)?.label}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="space-y-4">
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Crecimiento Foliar</span>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${leaves * 40}%` }}></div>
                </div>
             </div>
             <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Profundidad Radicular</span>
                <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${depth * 30}%` }}></div>
                </div>
             </div>
          </div>
          <div className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] [writing-mode:vertical-rl]">COLUMBO_BIO_2030</div>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(17,212,33,0.1)_0%,transparent_70%)]"></div>
    </div>
  );
};

// --- Resto de Componentes del Dashboard ---

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
              <span className="text-base font-black text-primary">{avoided > 0 ? '-' : '+'}{Math.abs(avoided).toLocaleString()} tCO2e</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const MitigationLever: React.FC<{ label: string, value: string, percent: number, color: string, icon: string, delay?: string }> = ({ label, value, percent, color, icon, delay = "0ms" }) => (
  <div 
    className="bg-white/5 border border-white/10 p-5 rounded-[24px] transition-all duration-300 group hover:border-white/40 hover:scale-[1.05] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] cursor-default animate-in slide-in-from-bottom-8"
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`size-10 rounded-xl flex items-center justify-center text-white transition-transform duration-500 group-hover:rotate-12`} style={{ backgroundColor: color }}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Aporte: {percent}%</span>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-2xl font-black text-white tracking-tighter mb-4 transition-colors duration-300 group-hover:text-primary">{value} <span className="text-[10px] text-slate-500 font-bold uppercase">tCO₂e</span></p>
    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
      <div className="h-full transition-all duration-1000 ease-out" style={{ width: `${percent}%`, backgroundColor: color }}></div>
    </div>
  </div>
);

const VetiverProject: React.FC = () => {
  const [selectedYearIdx, setSelectedYearIdx] = useState(0);
  const [isChartLoading, setIsChartLoading] = useState(true);
  const selectedData = PROJECTION_DATA[selectedYearIdx];

  // Configuración inicial basada en: 250m2 y 5 plantas/m2
  const [simParams, setSimParams] = useState({ surface: '250', density: '5', stage: 'Establecido (Año 1-2)' });
  const [simResult, setSimResult] = useState<{capture: number, credits: number} | null>(null);

  const validationErrors = useMemo(() => ({
    surface: !simParams.surface || parseFloat(simParams.surface) <= 0,
    density: !simParams.density || parseFloat(simParams.density) <= 0
  }), [simParams.surface, simParams.density]);

  const hasErrors = Object.values(validationErrors).some(error => error);

  useEffect(() => {
    const timer = setTimeout(() => setIsChartLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleRecalculate = () => {
    if (hasErrors) return;
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
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase">Ruta Carbono Negativo 2030</h2>
          <p className="text-neutral-green-600 text-xl font-medium">Gemelo digital y proyecciones de impacto ambiental para el cierre de década.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-6 py-3 rounded-[20px] flex items-center gap-3 text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all group">
             <span className="material-symbols-outlined text-lg">verified_user</span> AUDITORÍA 2030
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
                    <span className="material-symbols-outlined text-primary text-4xl animate-pulse">monitoring</span>
                  </div>
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Trayectoria 2026-2030</h3>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Plan maestro de descarbonización total. La integración de Vetiver con energía renovable nos permite proyectar un balance negativo para 2030.
                </p>
              </div>
              
              <div className="flex flex-col md:items-end gap-3 bg-white/5 px-8 py-6 rounded-[40px] border border-white/10 backdrop-blur-2xl shadow-2xl group hover:border-primary/40 transition-all">
                <div className="flex items-center gap-4">
                  <div className="size-3 rounded-full bg-primary animate-pulse"></div>
                  <span className="text-[11px] font-black text-slate-300 uppercase tracking-[0.3em]">Eficiencia Estimada</span>
                </div>
                <p className="text-5xl font-black text-white tracking-tighter">104.2% <span className="text-xs text-slate-500 font-black uppercase tracking-widest ml-1">NET NEGATIVE</span></p>
              </div>
            </div>

            <div className="h-[400px] w-full relative z-10 min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={400}>
                <ComposedChart data={HISTORICAL_EMISSIONS} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="12 12" vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b', letterSpacing: '2px' }} dy={20} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }} unit=" t" />
                  <Tooltip content={<ImpactTooltip />} />
                  <Area type="monotone" dataKey="real" name="Emisiones Netas" stroke={COLORS.primary} strokeWidth={8} fillOpacity={0.1} fill={COLORS.primary} isAnimationActive={!isChartLoading} />
                  <Bar dataKey="avoided" barSize={10} fill="#3b82f6" radius={[8, 8, 0, 0]} opacity={0.5} name="Carbono Evitado" />
                  <ReferenceLine y={0} stroke="rgba(17, 212, 33, 0.4)" strokeDasharray="20 10" label={{ position: 'right', value: 'TARGET ZERO REACHED', fill: COLORS.primary, fontSize: 11, fontWeight: 900, letterSpacing: '3px' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-16 border-t border-white/10">
              <MitigationLever label="Sumideros Vetiver (2030)" value="4,500" percent={70} color={COLORS.primary} icon="eco" delay="100ms" />
              <MitigationLever label="Energía Solar (2030)" value="1,200" percent={19} color={COLORS.blue500} icon="solar_power" delay="200ms" />
              <MitigationLever label="Hidrógeno Verde (2030)" value="700" percent={11} color="#f97316" icon="local_shipping" delay="300ms" />
            </div>
          </section>
        </div>

        <div className="lg:col-span-4 space-y-8">
           <section className="bg-[#030703] rounded-[56px] overflow-hidden border border-white/10 shadow-3xl h-[600px] relative ring-1 ring-white/5 group">
              <VetiverPlantStage depth={selectedData.depth} leaves={selectedData.leaves} year={selectedData.year} color={COLORS.primary} />
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

           <section className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-primary/20 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xl font-black mb-8 flex items-center gap-4 dark:text-white uppercase tracking-tighter leading-tight">
                <span className="material-symbols-outlined text-primary text-2xl">science</span> Simulador Biológico
              </h3>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Superficie Total</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={simParams.surface} 
                      onChange={(e) => setSimParams({...simParams, surface: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] px-6 py-4 text-sm font-black dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">m²</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Densidad de Siembra</label>
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      value={simParams.density} 
                      onChange={(e) => setSimParams({...simParams, density: e.target.value})} 
                      className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] px-6 py-4 text-sm font-black dark:text-white outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all" 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">P/m²</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Etapa de Maduración</label>
                  <select 
                    value={simParams.stage} 
                    onChange={(e) => setSimParams({...simParams, stage: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[20px] px-6 py-4 text-sm font-black dark:text-white focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none appearance-none cursor-pointer"
                  >
                    {Object.keys(GROWTH_FACTORS).map(stage => (
                      <option key={stage} value={stage} className="dark:bg-slate-900">{stage}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={handleRecalculate} 
                  disabled={hasErrors || isChartLoading}
                  className="w-full py-5 bg-slate-900 dark:bg-primary text-white font-black rounded-[24px] shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.1em]"
                >
                  <span className={`material-symbols-outlined ${isChartLoading ? 'animate-spin' : ''}`}>
                    {isChartLoading ? 'sync' : 'refresh'}
                  </span> 
                  RECALCULAR MODELO
                </button>

                {simResult && !hasErrors && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Proyección Anual 2030</p>
                    <div className="flex justify-center items-baseline gap-2">
                      <span className="text-5xl font-black text-primary tracking-tighter">{simResult.capture.toLocaleString()}</span>
                      <span className="text-xs font-black text-primary/60 uppercase tracking-widest">kgCO₂e</span>
                    </div>
                  </div>
                )}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
};

export default VetiverProject;
