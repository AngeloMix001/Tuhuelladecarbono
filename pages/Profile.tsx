
import React, { useState } from 'react';

interface ProfileProps {
  isSidebarCollapsed?: boolean;
}

interface NotificationConfig {
  id: string;
  label: string;
  enabled: boolean;
  hasThreshold?: boolean;
  threshold?: number;
  channels?: string[];
}

interface NotificationEvent {
  id: string;
  type: 'alert' | 'report' | 'update';
  message: string;
  timestamp: string;
  channels: string[];
}

const Profile: React.FC<ProfileProps> = ({ isSidebarCollapsed = false }) => {
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  
  const [notifications, setNotifications] = useState<NotificationConfig[]>([
    { 
      id: 'co2_alerts', 
      label: 'Alertas Críticas de CO₂', 
      enabled: true, 
      hasThreshold: true, 
      threshold: 85,
      channels: ['Email', 'Push']
    },
    { 
      id: 'weekly_reports', 
      label: 'Resúmenes de Reportes Semanales', 
      enabled: true 
    },
    { 
      id: 'vetiver_updates', 
      label: 'Actualizaciones del Proyecto Vetiver', 
      enabled: false 
    },
  ]);

  const [notificationHistory] = useState<NotificationEvent[]>([
    {
      id: '1',
      type: 'alert',
      message: 'Alerta crítica de CO₂: Umbral excedido (92.4 tCO₂e)',
      timestamp: 'Hoy, 10:15 AM',
      channels: ['Push', 'Email']
    },
    {
      id: '2',
      type: 'report',
      message: 'Reporte Semanal enviado satisfactoriamente',
      timestamp: 'Lunes, 09:00 AM',
      channels: ['Email']
    },
    {
      id: '3',
      type: 'update',
      message: 'Nueva actualización Proyecto Vetiver disponible',
      timestamp: '24 Oct, 14:20 PM',
      channels: ['Push']
    },
    {
      id: '4',
      type: 'alert',
      message: 'Alerta: Consumo de Diesel inusual detectado',
      timestamp: '22 Oct, 11:05 AM',
      channels: ['Email', 'SMS']
    }
  ]);

  const toggleNotification = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, enabled: !n.enabled } : n
    ));
  };

  const updateThreshold = (id: string, value: number) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, threshold: value } : n
    ));
  };

  const getImpactColor = (val: number) => {
    if (val < 50) return 'text-primary';
    if (val < 100) return 'text-amber-500';
    return 'text-red-500';
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'alert': return 'warning';
      case 'report': return 'description';
      case 'update': return 'auto_awesome';
      default: return 'notifications';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'alert': return 'text-red-500 bg-red-500/10';
      case 'report': return 'text-primary bg-primary/10';
      case 'update': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-slate-500 bg-slate-500/10';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8 pb-32">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Perfil de Usuario</h1>
        <p className="text-sm md:text-base text-slate-500 font-medium">Gestione su configuración y cuenta corporativa.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6 md:space-y-8">
          {/* User Card */}
          <section className="bg-white dark:bg-slate-panel/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
            <div className="h-24 md:h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
              <div className="absolute -bottom-10 md:-bottom-12 left-6 md:left-8">
                <div className="size-20 md:size-24 rounded-2xl md:rounded-3xl border-4 border-white dark:border-slate-900 bg-white shadow-xl overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCsaS_735kAGpjPmKPLToL_40ywG8cMUsVzZgFGelK4NGK0mY3yoWCqUh3xTFzC6U6Ry5BRR595Rky-8kjknDqGArPLXzjLHymMjSkB5fJw3X82vZnbAAW6GmriSebuCbCnVSxukSFRjbjJUL01Zfs3c3z3-jWDHeF3dojmOw6Ep-DmQ-WO1oCuyugQFjNzh-SZqsZ7Rc_6-JO3yDprgTpVjU7lUmV7rps3isw1wo9O3VATwHn-BeZ12CVKhVu42OesN6fHIchmxG8" 
                    alt="Carlos Rodriguez"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
            <div className="pt-14 md:pt-16 px-6 md:px-8 pb-6 md:pb-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 md:gap-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">Carlos Rodriguez</h3>
                  <div className="flex items-center gap-2 mt-1 text-primary font-bold text-xs md:text-sm">
                    <span className="material-symbols-outlined text-base md:text-lg">verified_user</span>
                    Gestor Ambiental
                  </div>
                </div>
                <button className="bg-primary text-white px-5 py-2 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-dark transition-all shadow-lg shadow-primary/20 text-xs md:text-sm">
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Editar Perfil
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 mt-8 md:mt-10">
                {[
                  { label: 'Correo Corporativo', val: 'gestor.ambiental@puertocolumbo.com' },
                  { label: 'Empresa', val: 'Puerto Columbo S.A.' },
                  { label: 'Ubicación', val: 'Terminal Central' },
                  { label: 'Miembro desde', val: 'Enero 2022' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                    <p className="font-bold text-slate-700 dark:text-slate-200 truncate text-xs md:text-sm">{item.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white dark:bg-slate-panel/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm space-y-6 md:space-y-8">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary text-xl md:text-2xl">security</span>
              <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Seguridad de la Cuenta</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nueva Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirmar Contraseña</label>
                <input type="password" placeholder="••••••••" className="w-full bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none dark:text-white" />
              </div>
            </div>

            <div className={`transition-all duration-500 rounded-2xl md:rounded-[2rem] p-4 md:p-6 border ${is2FAEnabled ? 'bg-primary/5 border-primary/30 shadow-lg' : 'bg-slate-50 border-slate-200 dark:bg-white/5 dark:border-slate-700'}`}>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`size-12 rounded-xl flex items-center justify-center shrink-0 ${is2FAEnabled ? 'bg-primary text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                    <span className="material-symbols-outlined text-xl material-symbols-fill">{is2FAEnabled ? 'verified' : 'phonelink_lock'}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">Doble Factor (2FA)</p>
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${is2FAEnabled ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {is2FAEnabled ? 'Activo' : 'Off'}
                      </span>
                    </div>
                    <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-medium leading-tight">Protección extra mediante app móvil.</p>
                  </div>
                </div>
                <button onClick={() => setIs2FAEnabled(!is2FAEnabled)} className={`relative w-12 md:w-14 h-6 md:h-7 rounded-full transition-all duration-300 ${is2FAEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 left-1 size-4 md:size-5 bg-white rounded-full transition-all duration-300 ${is2FAEnabled ? 'translate-x-6 md:translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </section>

          {/* New Notification History */}
          <section className="bg-white dark:bg-slate-panel/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl md:text-2xl">notifications_active</span>
                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">Historial de Notificaciones</h3>
              </div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notificationHistory.map((event) => (
                <div key={event.id} className="py-4 md:py-5 flex items-start gap-3 md:gap-4 group hover:bg-slate-50 dark:hover:bg-white/5 transition-colors px-2 rounded-xl">
                  <div className={`size-8 md:size-10 rounded-xl flex items-center justify-center shrink-0 ${getEventColor(event.type)}`}>
                    <span className="material-symbols-outlined text-lg md:text-xl">{getEventIcon(event.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                      <p className="text-xs md:text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{event.message}</p>
                      <span className="text-[9px] md:text-[10px] font-bold text-slate-400 whitespace-nowrap">{event.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                      <span className="text-[8px] md:text-[9px] font-bold text-slate-500 uppercase tracking-tighter shrink-0">Vía:</span>
                      {event.channels.map(chan => (
                        <span key={chan} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-[8px] font-black text-slate-500 uppercase shrink-0">
                          {chan}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-slate-500 hover:text-primary transition-all flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-sm">history</span>
              Ver más registros
            </button>
          </section>
        </div>

        {/* Right Column: Sidebar info */}
        <div className="space-y-6 md:space-y-8">
          <section className="bg-white dark:bg-slate-panel/40 border border-slate-200 dark:border-slate-800 rounded-2xl md:rounded-3xl p-6 shadow-sm">
            <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">history</span>
              Log de Actividad
            </h3>
            <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-slate-100 dark:before:bg-white/5">
              {[
                { label: 'Umbral CO₂ editado', time: 'Ahora', icon: 'settings_alert' },
                { label: 'Sesión iniciada', time: 'Hoy, 08:45', icon: 'login' },
                { label: 'Reporte generado', time: 'Ayer, 16:20', icon: 'description' },
              ].map((activity, idx) => (
                <div key={idx} className="flex items-center gap-3 relative">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary z-10 shrink-0 border border-white dark:border-slate-900">
                    <span className="material-symbols-outlined text-xs">{activity.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-tight truncate">{activity.label}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-panel rounded-2xl md:rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 size-32 bg-primary/20 rounded-full blur-2xl group-hover:bg-primary/30 transition-all"></div>
            <h4 className="text-base md:text-lg font-black mb-2 relative z-10">¿Ayuda técnica?</h4>
            <p className="text-xs md:text-sm text-slate-400 font-medium leading-relaxed mb-6 relative z-10">
              Contáctenos si necesita ajustar umbrales específicos.
            </p>
            <button className="flex items-center gap-2 text-primary font-black text-xs md:text-sm group/btn relative z-10">
              Soporte IT
              <span className="material-symbols-outlined text-base group-hover/btn:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </section>
        </div>
      </div>

      {/* Action Bar */}
      <div className={`fixed bottom-0 right-0 left-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4 md:p-6 z-30 transition-all duration-300 ${isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64'}`}>
        <div className="max-w-6xl mx-auto flex justify-end gap-3 md:gap-4">
          <button className="px-5 md:px-8 py-2.5 rounded-xl text-xs md:text-sm font-black text-slate-500 hover:bg-slate-100 transition-all">
            Cancelar
          </button>
          <button className="bg-primary text-white px-6 md:px-10 py-2.5 rounded-xl font-black text-xs md:text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
