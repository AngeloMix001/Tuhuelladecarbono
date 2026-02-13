
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
  { label: '4,200 kg', h: '100%', year: '2026', desc: 'Máximo biológico', highlight: true, depth: 1.4 },
];

const GROWTH_FACTORS = {
  'Establecido (Año 1-2)': 7.5,
  'Maduro (Año 3-5)': 15.0,
  'Consolidado (Año 6+)': 18.5,
};

// --- New "Bioscan Hologram" 3D Stage ---

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
  const rootsGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const scannerRef = useRef<THREE.Mesh | null>(null);
  const requestRef = useRef<number>(0);

  // Materiales reutilizables
  const rootMaterial = useMemo(() => new THREE.LineBasicMaterial({ 
    color: new THREE.Color(color), 
    transparent: true, 
    opacity: 0.6,
    blending: THREE.AdditiveBlending
  }), [color]);

  const particleMaterial = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(color),
    size: 0.04,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  }), [color]);

  // Generador de raíces tipo "Fibra Óptica"
  const generateHolographicRoots = useCallback((depthScale: number) => {
    const group = new THREE.Group();
    const numRoots = 120; // Más densidad para look tecnológico
    
    for (let i = 0; i < numRoots; i++) {
      const points = [];
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 0.4;
      
      // Raíces de Vetiver son famosas por ser muy verticales y profundas
      const segments = 12;
      for (let j = 0; j <= segments; j++) {
        const t = j / segments;
        const x = Math.cos(angle) * radius * (1 + t * 0.5);
        const z = Math.sin(angle) * radius * (1 + t * 0.5);
        const y = 1.5 - (t * 4 * depthScale); // Crecimiento vertical hacia abajo
        
        // Añadir una pequeña distorsión orgánica
        const noise = (Math.random() - 0.5) * 0.05 * t;
        points.push(new THREE.Vector3(x + noise, y, z + noise));
      }
      
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, rootMaterial);
      group.add(line);
    }
    return group;
  }, [rootMaterial]);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 1, 7);
    camera.lookAt(0, -1, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Pedestal Holográfico
    const baseGeom = new THREE.RingGeometry(0.8, 0.9, 64);
    const baseMat = new THREE.MeshBasicMaterial({ color: color, side: THREE.DoubleSide, transparent: true, opacity: 0.3 });
    const base = new THREE.Mesh(baseGeom, baseMat);
    base.rotation.x = Math.PI / 2;
    base.position.y = 1.55;
    scene.add(base);

    const baseFill = new THREE.Mesh(new THREE.CircleGeometry(0.8, 64), new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.05 }));
    baseFill.rotation.x = Math.PI / 2;
    baseFill.position.y = 1.55;
    scene.add(baseFill);

    // Sistema de Escaneo
    const scanGeom = new THREE.CylinderGeometry(1.2, 1.2, 0.02, 32, 1, true);
    const scanMat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.2, side: THREE.DoubleSide });
    const scanner = new THREE.Mesh(scanGeom, scanMat);
    scannerRef.current = scanner;
    scene.add(scanner);

    // Partículas de CO2 (Captura)
    const partCount = 200;
    const partGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(partCount * 3);
    for (let i = 0; i < partCount * 3; i++) positions[i] = (Math.random() - 0.5) * 6;
    partGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particles = new THREE.Points(partGeom, particleMaterial);
    particlesRef.current = particles;
    scene.add(particles);

    // Raíces iniciales
    const roots = generateHolographicRoots(depth);
    rootsGroupRef.current = roots;
    scene.add(roots);

    const animate = () => {
      if (!renderer || !scene || !camera) return;
      
      const time = Date.now() * 0.001;
      
      // Rotación suave del holograma
      scene.rotation.y += 0.005;

      // Animación de escaneo
      if (scannerRef.current) {
        scannerRef.current.position.y = Math.sin(time * 0.5) * 2 - 1;
        scannerRef.current.scale.setScalar(1 + Math.cos(time * 0.5) * 0.2);
      }

      // Animación de partículas (succión hacia el centro/raíces)
      if (particlesRef.current) {
        const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < partCount; i++) {
          const ix = i * 3;
          const iy = i * 3 + 1;
          const iz = i * 3 + 2;

          // Mover hacia el origen (pedestal)
          positions[ix] *= 0.99;
          positions[iz] *= 0.99;
          positions[iy] += 0.01;

          // Reset si llegan al centro
          if (Math.abs(positions[ix]) < 0.1 && Math.abs(positions[iz]) < 0.1) {
            positions[ix] = (Math.random() - 0.5) * 6;
            positions[iz] = (Math.random() - 0.5) * 6;
            positions[iy] = -4 + Math.random() * 2;
          }
        }
        particlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
      requestRef.current = requestAnimationFrame(animate);
    };
    animate();

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
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Actualización eficiente de la profundidad
  useEffect(() => {
    if (sceneRef.current && rootsGroupRef.current) {
      sceneRef.current.remove(rootsGroupRef.current);
      rootsGroupRef.current.children.forEach((child: any) => child.geometry.dispose());
      const newRoots = generateHolographicRoots(depth);
      sceneRef.current.add(newRoots);
      rootsGroupRef.current = newRoots;
    }
  }, [depth, generateHolographicRoots]);

  return (
    <div ref={containerRef} className="w-full h-full bg-[#050a06] relative overflow-hidden group">
      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none p-8 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="size-1.5 bg-primary rounded-full animate-ping"></span>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Bioscan v4.2.1</span>
            </div>
            <h4 className="text-3xl font-black text-white tracking-tighter">{year}</h4>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estado Sistema</p>
            <p className="text-xs font-black text-primary uppercase">Óptimo</p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${depth * 70}%` }}></div>
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase">Profundidad</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '85%' }}></div>
              </div>
              <span className="text-[8px] font-black text-slate-500 uppercase">Densidad</span>
            </div>
          </div>
          <div className="bg-primary/10 border border-primary/20 px-3 py-1 rounded-lg backdrop-blur-sm">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">Certificado Carbono Negativo</span>
          </div>
        </div>
      </div>

      {/* Grid decorativo */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(17,212,33,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(17,212,33,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
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

  // Validación reactiva
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
          <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter mb-3 uppercase">Mitigación Consolidada 2026</h2>
          <p className="text-neutral-green-600 text-xl font-medium">Análisis avanzado de captura biológica mediante el Sistema Vetiver.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-primary text-white px-6 py-3 rounded-[20px] flex items-center gap-3 text-xs font-black shadow-xl hover:scale-105 active:scale-95 transition-all group">
             <span className="material-symbols-outlined text-lg">verified_user</span> AUDITORÍA 2026
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
                  <h3 className="text-4xl font-black text-white uppercase tracking-tighter">Impacto Consolidado</h3>
                </div>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  Consolidación de la trayectoria de descarbonización. El sistema valida el balance negativo logrado en 2026 mediante sumideros biológicos.
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
           <section className="bg-[#050a06] rounded-[56px] overflow-hidden border border-white/10 shadow-3xl h-[600px] relative ring-1 ring-white/5 group">
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

           <section className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-primary/20 shadow-2xl relative overflow-hidden group">
              <h3 className="text-xl font-black mb-8 flex items-center gap-4 dark:text-white uppercase tracking-tighter leading-tight">
                <span className="material-symbols-outlined text-primary text-2xl">science</span> Simulador Biológico
              </h3>
              <div className="space-y-6">
                {/* Input Superficie */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Superficie Total</label>
                    {validationErrors.surface && <span className="text-[9px] font-bold text-rose-500 uppercase">Valor Inválido</span>}
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Ej: 1500 m²"
                      value={simParams.surface} 
                      onChange={(e) => setSimParams({...simParams, surface: e.target.value})} 
                      className={`
                        w-full bg-slate-50 dark:bg-white/5 border rounded-[20px] px-6 py-4 text-sm font-black dark:text-white outline-none transition-all
                        ${validationErrors.surface 
                          ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                          : 'border-slate-200 dark:border-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary'}
                      `} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">m²</span>
                  </div>
                </div>

                {/* Input Densidad */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Densidad de Siembra</label>
                    {validationErrors.density && <span className="text-[9px] font-bold text-rose-500 uppercase">Valor Inválido</span>}
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      placeholder="Ej: 12 plantas/m²"
                      value={simParams.density} 
                      onChange={(e) => setSimParams({...simParams, density: e.target.value})} 
                      className={`
                        w-full bg-slate-50 dark:bg-white/5 border rounded-[20px] px-6 py-4 text-sm font-black dark:text-white outline-none transition-all
                        ${validationErrors.density 
                          ? 'border-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]' 
                          : 'border-slate-200 dark:border-white/10 focus:ring-4 focus:ring-primary/10 focus:border-primary'}
                      `} 
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">P/m²</span>
                  </div>
                </div>

                {/* Selector de Etapa */}
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
                  className={`
                    w-full py-5 text-white font-black rounded-[24px] shadow-xl transition-all flex items-center justify-center gap-3 uppercase tracking-[0.1em]
                    ${hasErrors 
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed grayscale' 
                      : 'bg-slate-900 dark:bg-primary hover:scale-[1.02] active:scale-[0.98] shadow-primary/20'}
                  `}
                >
                  <span className={`material-symbols-outlined ${isChartLoading ? 'animate-spin' : ''}`}>
                    {isChartLoading ? 'sync' : 'refresh'}
                  </span> 
                  {isChartLoading ? 'CALCULANDO...' : 'RECALCULAR MODELO'}
                </button>

                {simResult && !hasErrors && (
                  <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10 animate-in slide-in-from-top-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">Proyección de Captura Anual</p>
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
