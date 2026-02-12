
import React from 'react';
import { NavLink } from 'react-router-dom';
import { NAVIGATION_ITEMS } from '../constants';

const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-white dark:bg-background-dark border-r border-neutral-green-100 dark:border-neutral-green-900 flex flex-col shrink-0">
      <div className="p-6 flex flex-col gap-1">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary p-2 rounded-lg text-white">
            <span className="material-symbols-outlined text-2xl">account_balance</span>
          </div>
          <div>
            <h1 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">Puerto Columbo</h1>
            <p className="text-neutral-green-600 text-[10px] font-bold uppercase tracking-widest">Gestión de Carbono</p>
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
                    ? 'bg-primary/10 text-primary font-semibold border-l-4 border-primary' 
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
        <div className="p-4 bg-neutral-green-50 dark:bg-white/5 rounded-xl border border-neutral-green-100 dark:border-white/10">
          <p className="text-xs text-neutral-green-800 dark:text-neutral-green-400 font-bold mb-1">Impacto Vetiver</p>
          <div className="w-full bg-neutral-green-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[72%]"></div>
          </div>
          <p className="text-[10px] text-neutral-green-600 dark:text-slate-500 mt-2 font-medium">72% de la meta anual 2024</p>
        </div>
        
        <div className="flex items-center gap-3 p-2 group cursor-pointer">
          <div className="size-9 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-primary/20 bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/carlos/100')" }}></div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-800 dark:text-white truncate">Carlos Rodriguez</p>
            <p className="text-[10px] text-slate-500 truncate">Gestor Ambiental</p>
          </div>
          <span className="material-symbols-outlined text-sm text-slate-400 ml-auto">settings</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
