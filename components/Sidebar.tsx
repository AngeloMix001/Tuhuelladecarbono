
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';

const LogoTC = () => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    {/* Forma T estilizada con bloques */}
    <path d="M60 10H85L70 35H45L60 10Z" fill="#11d421" /> {/* Verde superior */}
    <path d="M20 40H75L60 65H5L20 40Z" fill="#3b82f6" /> {/* Azul medio */}
    <path d="M5 70H30L15 95H-10L5 70Z" fill="#11d421" /> {/* Verde inferior */}
    
    {/* Forma C estilizada a la derecha */}
    <path d="M78 40C88 40 95 48 95 60C95 72 88 80 78 80H70L80 60L70 40H78Z" fill="#3b82f6" fillOpacity="0.9" />
    <path d="M78 80C88 80 95 88 95 95H70C70 88 75 82 78 80Z" fill="#3b82f6" />
  </svg>
);

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-background-dark border-r border-neutral-green-100 dark:border-neutral-green-900 flex flex-col shrink-0">
      <div className="p-6 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-1 rounded-lg flex items-center justify-center">
            <LogoTC />
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-sm font-black leading-tight uppercase tracking-tight">Puerto Columbo</h1>
            <p className="text-neutral-green-600 dark:text-primary text-[10px] font-black uppercase tracking-[0.2em]">Gestión de Carbono</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAVIGATION_ITEMS.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' 
                    : 'text-slate-600 hover:bg-neutral-green-50 dark:hover:bg-white/5 dark:text-slate-400'
                }`
              }
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 flex flex-col gap-4">
        <div className="p-4 bg-neutral-green-50 dark:bg-white/5 rounded-2xl border border-neutral-green-100 dark:border-white/10 shadow-sm">
          <p className="text-[10px] font-black text-neutral-green-800 dark:text-primary uppercase tracking-widest mb-2">Impacto Vetiver</p>
          <div className="w-full bg-neutral-green-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[72%] shadow-[0_0_8px_rgba(17,212,33,0.5)]"></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-[10px] text-neutral-green-600 dark:text-slate-500 font-bold">Meta 2024</p>
            <p className="text-[10px] text-primary font-black">72%</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 group cursor-pointer hover:border-primary/50 transition-all">
          <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 bg-cover bg-center shadow-sm" style={{ backgroundImage: "url('https://picsum.photos/seed/carlos/100')" }}></div>
          <div className="overflow-hidden">
            <p className="text-xs font-black text-slate-800 dark:text-white truncate">Carlos Rodriguez</p>
            <p className="text-[10px] text-slate-500 font-bold truncate">Gestor Ambiental</p>
          </div>
          <span className="material-symbols-outlined text-sm text-slate-400 ml-auto group-hover:text-primary transition-colors">settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
