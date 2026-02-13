
import React, { memo, useState, useRef, useEffect } from 'react';

interface HeaderProps {
  title: string;
  breadcrumb: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onMenuClick: () => void;
}

interface Notification {
  id: number;
  title: string;
  time: string;
  icon: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, breadcrumb, isDarkMode, toggleDarkMode, onMenuClick }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: 1, title: "Nuevo registro pendiente en San Antonio", time: "Hace 5 min", icon: "pending_actions", type: 'warning', read: false },
    { id: 2, title: "Validación exitosa: REC-A82F", time: "Hace 1 hora", icon: "verified", type: 'success', read: false },
    { id: 3, title: "Meta de captura Febrero alcanzada", time: "Hoy, 09:00", icon: "eco", type: 'success', read: false },
    { id: 4, title: "Actualización de factores de emisión", time: "Ayer", icon: "info", type: 'info', read: true },
  ]);

  const popoverRef = useRef<HTMLDivElement>(null);
  const hasUnread = notifications.some(n => !n.read);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

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
        
        <div className="flex items-center gap-1 md:gap-4 pl-2 md:pl-4 md:border-l border-slate-200 dark:border-slate-800 relative" ref={popoverRef}>
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all flex items-center justify-center"
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            <span className="material-symbols-outlined text-2xl">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          
          <button 
            onClick={toggleNotifications}
            className={`p-2 rounded-full relative transition-all ${showNotifications ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            {hasUnread && (
              <span className="absolute top-2 right-2 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark animate-pulse"></span>
            )}
          </button>

          {/* Panel de Notificaciones */}
          {showNotifications && (
            <div className="absolute top-14 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 z-[100]">
              <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/5">
                <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Notificaciones</h4>
                <button 
                  onClick={markAllAsRead}
                  className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest"
                >
                  Marcar leídas
                </button>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-50 dark:border-white/5 last:border-0 ${!n.read ? 'bg-primary/5 dark:bg-primary/5' : ''}`}
                    >
                      <div className={`size-9 rounded-xl flex items-center justify-center shrink-0 ${
                        n.type === 'success' ? 'bg-green-100 text-green-600' : 
                        n.type === 'warning' ? 'bg-orange-100 text-orange-600' : 
                        'bg-blue-100 text-blue-600'
                      }`}>
                        <span className="material-symbols-outlined text-lg">{n.icon}</span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className={`text-[11px] leading-snug ${n.read ? 'text-slate-600 dark:text-slate-400' : 'text-slate-900 dark:text-white font-bold'}`}>
                          {n.title}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-1 font-medium">{n.time}</p>
                      </div>
                      {!n.read && <div className="size-1.5 rounded-full bg-primary mt-1 shrink-0"></div>}
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-slate-300 text-4xl">notifications_off</span>
                    <p className="text-xs text-slate-400 font-medium">No hay novedades</p>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 text-center">
                <button className="text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                  Ver historial de alertas
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default memo(Header);
