
import React, { useState } from 'react';

interface LoginProps {
  onLogin: (remember: boolean) => void;
}

const LogoTC = () => (
  <svg width="64" height="64" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M60 10H85L70 35H45L60 10Z" fill="#11d421" /> 
    <path d="M20 40H75L60 65H5L20 40Z" fill="#3b82f6" /> 
    <path d="M5 70H30L15 95H-10L5 70Z" fill="#11d421" /> 
  </svg>
);

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('agutierrez@puertocolumbo.com');
  const [password, setPassword] = useState('Angel2026');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validación restringida a las credenciales solicitadas
    setTimeout(() => {
      if (email === 'agutierrez@puertocolumbo.com' && password === 'Angel2026') {
        onLogin(rememberMe);
      } else {
        setError('Credenciales no autorizadas. Por favor verifique su correo y contraseña.');
        setIsLoading(false);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 relative overflow-hidden">
      {/* Decoración de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-[450px] relative z-10 animate-in fade-in zoom-in duration-500">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-10 rounded-[48px] shadow-3xl ring-1 ring-white/5">
          <div className="flex flex-col items-center mb-10">
            <div className="mb-6 p-4 bg-white/5 rounded-[24px] border border-white/10 shadow-inner">
              <LogoTC />
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight text-center leading-none">Puerto Columbo S.A.</h1>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.3em] mt-3">Gestión CO₂ – Acceso Autorizado</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 animate-in shake duration-300">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-xs font-bold text-red-500 uppercase tracking-tight">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Correo Electrónico</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  placeholder="ejemplo@puertocolumbo.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-sm focus:ring-2 focus:ring-primary/40 focus:border-primary outline-none transition-all placeholder:text-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="size-4 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/20 cursor-pointer" 
                />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-300 transition-colors">Recordarme</span>
              </label>
              <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest">¿Olvido su clave?</a>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-5 bg-primary hover:bg-primary/90 text-white font-black rounded-[24px] shadow-xl shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-lg">sync</span>
                  Verificando Acceso...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-lg">login</span>
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-white/5 text-center">
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-[0.2em]">Puerto Columbo S.A. – Área Privada</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
