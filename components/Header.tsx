
import React from 'react';

interface HeaderProps {
  title: string;
  breadcrumb: string;
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumb }) => {
  return (
    <header className="sticky top-0 z-10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-neutral-green-100 dark:border-neutral-green-900 px-8 py-4 flex items-center justify-between">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{breadcrumb}</p>
        <h2 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h2>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative max-w-xs hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input 
            className="pl-10 pr-4 py-2 bg-slate-100 dark:bg-white/5 border-none rounded-lg text-sm w-64 focus:ring-2 focus:ring-primary/20 dark:text-white" 
            placeholder="Buscar reportes..." 
            type="text" 
          />
        </div>
        
        <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full relative transition-colors">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
