
import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-forest dark:text-white tracking-tight">Perfil de Usuario</h2>
        <p className="text-gray-500 mt-1">Gestione su información personal y configuración de cuenta corporativa.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Info */}
        <div className="lg:col-span-2 space-y-8">
          {/* Personal Info Card */}
          <section className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden shadow-sm">
            <div className="h-32 bg-gradient-to-r from-primary/20 to-primary/5 relative">
              <div className="absolute -bottom-12 left-8">
                <div className="size-24 rounded-2xl border-4 border-white dark:border-background-dark bg-white shadow-lg overflow-hidden">
                  <img alt="Foto de perfil" className="w-full h-full object-cover" src="https://picsum.photos/seed/carlos/300" />
                </div>
              </div>
            </div>
            <div className="pt-16 px-8 pb-8">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-forest dark:text-white">Carlos Rodriguez</h3>
                  <div className="flex items-center gap-2 mt-1 text-primary font-medium">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    <span className="text-sm">Gestor Ambiental</span>
                  </div>
                </div>
                <button className="bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary/90 transition-all flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Editar Perfil
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <InfoItem label="Correo Corporativo" value="gestor.ambiental@puertocolumbo.com" />
                <InfoItem label="Empresa" value="Puerto Columbo S.A." />
                <InfoItem label="Ubicación" value="Terminal Central, Puerto Columbo" />
                <InfoItem label="Miembro desde" value="Enero 2022" />
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">security</span>
              <h3 className="text-xl font-bold text-forest dark:text-white">Seguridad de la Cuenta</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="Nueva Contraseña" placeholder="••••••••" type="password" />
                <InputGroup label="Confirmar Contraseña" placeholder="••••••••" type="password" />
              </div>
              <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/20">
                <div className="flex gap-3">
                  <span className="material-symbols-outlined text-primary">authenticator</span>
                  <div>
                    <p className="text-sm font-bold text-forest dark:text-white">Autenticación de dos factores (2FA)</p>
                    <p className="text-xs text-gray-500">Añada una capa extra de seguridad a su cuenta.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Activity Log */}
        <div className="space-y-8">
          <section className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <span className="material-symbols-outlined text-primary">history</span>
              <h3 className="text-lg font-bold text-forest dark:text-white">Registro de Actividad</h3>
            </div>
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/50 before:via-gray-200 before:to-transparent">
              <ActivityItem icon="login" title="Inicio de sesión" time="Hoy, 08:45 AM" />
              <ActivityItem icon="description" title="Generación de reporte" time="Ayer, 16:20 PM" />
              <ActivityItem icon="edit_square" title="Actualización CO₂" time="24 Oct, 11:30 AM" />
              <ActivityItem icon="key" title="Cambio contraseña" time="20 Oct, 09:15 AM" />
            </div>
            <button className="w-full mt-8 py-2 text-primary font-bold text-sm border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors">
              Ver todo el historial
            </button>
          </section>

          <div className="bg-forest rounded-xl p-6 text-white shadow-lg">
            <h4 className="font-bold mb-2">Ayuda y Soporte</h4>
            <p className="text-sm text-gray-300 mb-4">¿Necesita ayuda con la configuración de su cuenta o permisos?</p>
            <a className="inline-flex items-center gap-2 text-primary font-bold hover:underline" href="#">
              Contactar soporte IT
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end items-center gap-4 pt-8 border-t border-gray-200 dark:border-white/10">
        <button className="px-6 py-2 rounded-lg font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors">
          Cancelar
        </button>
        <button className="px-8 py-3 bg-primary text-white rounded-lg font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

const InfoItem: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div>
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className="text-forest dark:text-gray-200 font-medium text-sm">{value}</p>
  </div>
);

const InputGroup: React.FC<{ label: string, placeholder: string, type: string }> = ({ label, placeholder, type }) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-forest dark:text-gray-300">{label}</label>
    <input className="w-full bg-slate-50 dark:bg-white/5 border-gray-200 dark:border-white/10 rounded-lg px-4 py-3 focus:ring-primary focus:border-primary dark:text-white text-sm" placeholder={placeholder} type={type} />
  </div>
);

const ActivityItem: React.FC<{ icon: string, title: string, time: string }> = ({ icon, title, time }) => (
  <div className="relative flex items-center gap-4">
    <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary z-10 shrink-0 border border-white dark:border-background-dark">
      <span className="material-symbols-outlined text-sm">{icon}</span>
    </div>
    <div>
      <p className="text-xs font-bold text-forest dark:text-white">{title}</p>
      <p className="text-[10px] text-gray-500">{time}</p>
    </div>
  </div>
);

export default Profile;
