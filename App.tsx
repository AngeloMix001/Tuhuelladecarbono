
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import DataInput from './components/DataInput';
import VetiverProject from './components/VetiverProject';
import Reports from './components/Reports';
import Profile from './components/Profile';

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
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/ingreso" element={<DataInput />} />
            <Route path="/vetiver" element={<VetiverProject />} />
            <Route path="/reportes" element={<Reports />} />
            <Route path="/perfil" element={<Profile />} />
          </Routes>
        </main>
        <footer className="mt-auto p-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Puerto Columbo S.A. – Panel de Gestión Ambiental Certificado</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
