
import React from 'react';
import { Page } from '../types';

interface SidebarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onNavigate, isCollapsed, onToggle }) => {
  const navItems = [
    { id: 'dashboard' as Page, label: 'Dashboard', icon: 'dashboard' },
    { id: 'data-entry' as Page, label: 'Ingreso de Datos', icon: 'database' },
    { id: 'vetiver' as Page, label: 'Proyecto Vetiver', icon: 'psychology_alt' },
    { id: 'reports' as Page, label: 'Reportes', icon: 'description' },
    { id: 'profile' as Page, label: 'Perfil', icon: 'person' },
  ];

  const handleNavigate = (id: Page) => {
    onNavigate(id);
    if (window.innerWidth < 1024) {
      onToggle(); // Close sidebar on mobile after navigation
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside className={`bg-white dark:bg-background-dark flex flex-col border-r border-slate-200 dark:border-slate-800 shrink-0 h-full fixed lg:relative z-50 transition-all duration-300 ${isCollapsed ? '-translate-x-full lg:translate-x-0 lg:w-20' : 'translate-x-0 w-64'}`}>
        <div className="p-4 flex flex-col h-full">
          {/* Header / Logo */}
          <div className={`flex items-center gap-3 mb-10 mt-2 ${isCollapsed ? 'justify-center' : 'px-2'}`}>
            <div className="size-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-xl font-bold">eco</span>
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <h1 className="text-slate-900 dark:text-white font-bold text-base leading-tight">Panel CO₂</h1>
                <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Puerto Columbo S.A.</p>
              </div>
            )}
          </div>

          {/* Toggle Button (Desktop Only) */}
          <button 
            onClick={onToggle}
            className={`hidden lg:flex absolute -right-3 top-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 size-6 rounded-full items-center justify-center shadow-sm hover:text-primary transition-all z-30`}
          >
            <span className={`material-symbols-outlined text-base transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}>
              chevron_left
            </span>
          </button>

          {/* Navigation */}
          <nav className="space-y-1 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.id)}
                title={isCollapsed ? item.label : ''}
                className={`w-full flex items-center gap-3 py-3 rounded-xl transition-all font-semibold text-sm ${
                  isCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  activePage === item.id
                    ? 'bg-primary/10 text-primary border-r-4 border-primary lg:rounded-r-none'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className={`material-symbols-outlined text-[22px] shrink-0 ${activePage === item.id ? 'material-symbols-fill' : ''}`}>
                  {item.icon}
                </span>
                {(!isCollapsed || window.innerWidth < 1024) && <span className="overflow-hidden whitespace-nowrap">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* Footer / User */}
          <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className={`flex items-center gap-3 p-2 bg-slate-50 dark:bg-white/5 rounded-xl ${isCollapsed ? 'justify-center px-0' : ''}`}>
              <div className="size-9 rounded-full bg-slate-900 dark:bg-primary/20 flex items-center justify-center text-white text-[10px] font-black overflow-hidden shrink-0">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsaS_735kAGpjPmKPLToL_40ywG8cMUsVzZgFGelK4NGK0mY3yoWCqUh3xTFzC6U6Ry5BRR595Rky-8kjknDqGArPLXzjLHymMjSkB5fJw3X82vZnbAAW6GmriSebuCbCnVSxukSFRjbjJUL01Zfs3c3z3-jWDHeF3dojmOw6Ep-DmQ-WO1oCuyugQFjNzh-SZqsZ7Rc_6-JO3yDprgTpVjU7lUmV7rps3isw1wo9O3VATwHn-BeZ12CVKhVu42OesN6fHIchmxG8" 
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              {(!isCollapsed || window.innerWidth < 1024) && (
                <div className="overflow-hidden whitespace-nowrap">
                  <p className="text-xs font-black text-slate-900 dark:text-white truncate">Carlos Rodriguez</p>
                  <p className="text-[9px] text-slate-500 font-bold truncate">Gestor Ambiental</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
