
import React, { memo } from 'react';

interface HeaderProps {
  title: string;
  breadcrumb: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumb, isDarkMode, toggleDarkMode, onMenuClick }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-neutral-green-100 dark:border-neutral-green-900 px-4 md:px-8 py-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-4">
        {/* Botón Hamburguesa - Solo Móvil */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>

        <div>
          <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{breadcrumb}</p>
          <h2 className="text-lg md:text-xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">{title}</h2>
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-6">
        <div className="relative max-w-xs hidden xl:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm w-48 xl:w-64 focus:ring-2 focus:ring-primary/20 dark:text-white" 
            placeholder="Buscar reportes..." 
            type="text" 
          />
        </div>
        
        <div className="flex items-center gap-1 md:gap-4 pl-2 md:pl-4 md:border-l border-slate-200 dark:border-slate-800">
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <span className="material-symbols-outlined text-2xl">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full relative transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
