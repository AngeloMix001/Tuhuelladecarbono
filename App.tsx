
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Lazy loading components for performance
const Dashboard = lazy(() => import('./components/Dashboard'));
const DataInput = lazy(() => import('./components/DataInput'));
const VetiverProject = lazy(() => import('./components/VetiverProject'));
const Reports = lazy(() => import('./components/Reports'));
const Profile = lazy(() => import('./components/Profile'));

const LoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark">
    <div className="flex flex-col items-center gap-4">
      <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      <p className="text-xs font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Sistema 2026...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/ingreso': return 'Ingreso de Datos Operativos';
      case '/vetiver': return 'Configuración de Captura CO₂';
      case '/reportes': return 'Reportes y Exportación';
      case '/perfil': return 'Cuenta / Perfil';
      default: return 'Panel CO₂ Dashboard';
    }
  };

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/ingreso': return 'Gestión de CO₂ / Ingreso de Datos';
      case '/vetiver': return 'Gestión de CO₂ / Proyecto Vetiver';
      case '/reportes': return 'Gestión de CO₂ / Reportes';
      case '/perfil': return 'Cuenta / Perfil';
      default: return 'Gestión de Carbono';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header 
          title={getPageTitle()} 
          breadcrumb={getBreadcrumb()} 
          isDarkMode={isDarkMode} 
          toggleDarkMode={toggleDarkMode}
          onMenuClick={toggleSidebar}
        />
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ingreso" element={<DataInput />} />
              <Route path="/vetiver" element={<VetiverProject />} />
              <Route path="/reportes" element={<Reports />} />
              <Route path="/perfil" element={<Profile />} />
            </Routes>
          </Suspense>
        </main>
        <footer className="mt-auto p-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Puerto Columbo S.A. – Panel de Gestión Ambiental Certificado</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
