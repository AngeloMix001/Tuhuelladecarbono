
import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const LogoTC = memo(() => (
  <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
    <path d="M60 10H85L70 35H45L60 10Z" fill="#11d421" /> 
    <path d="M20 40H75L60 65H5L20 40Z" fill="#3b82f6" /> 
    <path d="M5 70H30L15 95H-10L5 70Z" fill="#11d421" /> 
    <path d="M78 40C88 40 95 48 95 60C95 72 88 80 78 80H70L80 60L70 40H78Z" fill="#3b82f6" fillOpacity="0.9" />
    <path d="M78 80C88 80 95 88 95 95H70C70 88 75 82 78 80Z" fill="#3b82f6" />
  </svg>
));

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
  const complianceValue = 84;

  return (
    <>
      {/* Overlay para móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity animate-in fade-in duration-300" 
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-[70] w-64 bg-white dark:bg-background-dark border-r border-neutral-green-100 dark:border-neutral-green-900 flex flex-col shrink-0 
        transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:block
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex flex-col h-full gap-1">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <LogoTC />
              <div>
                <h1 className="text-slate-900 dark:text-white text-sm font-black leading-tight uppercase tracking-tight">Puerto Columbo</h1>
                <p className="text-neutral-green-600 dark:text-primary text-[10px] font-black uppercase tracking-[0.2em]">Gestión de Carbono</p>
              </div>
            </div>
            {/* Botón de cerrar solo en móvil */}
            <button 
              onClick={onClose} 
              className="lg:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
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
            
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all mt-2"
            >
              <span className="material-symbols-outlined">logout</span>
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          </nav>

          <div className="mt-auto flex flex-col gap-4">
            <div className="p-4 bg-neutral-green-50 dark:bg-white/5 rounded-2xl border border-neutral-green-100 dark:border-white/10 shadow-sm">
              <p className="text-[10px] font-black text-neutral-green-800 dark:text-primary uppercase tracking-widest mb-2">Impacto Vetiver</p>
              <div className="w-full bg-neutral-green-200 dark:bg-white/10 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full shadow-[0_0_8px_rgba(17,212,33,0.5)] transition-all duration-1000" 
                  style={{ width: `${complianceValue}%` }}
                ></div>
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-neutral-green-600 dark:text-slate-500 font-bold">Meta 2027</p>
                <p className="text-[10px] text-primary font-black">{complianceValue}%</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 group cursor-pointer hover:border-primary/50 transition-all">
              <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-800 border-2 border-white dark:border-slate-700 bg-cover bg-center shadow-sm" style={{ backgroundImage: "url('https://picsum.photos/seed/carlos/100')" }}></div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-800 dark:text-white truncate">Carlos R.</p>
                <p className="text-[10px] text-slate-500 font-bold truncate">Gestor Ambiental</p>
              </div>
              <span className="material-symbols-outlined text-sm text-slate-400 ml-auto group-hover:text-primary transition-colors">settings</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default memo(Sidebar);
