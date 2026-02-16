
import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar.tsx';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import DataInput from './components/DataInput.tsx';
import VetiverProject from './components/VetiverProject.tsx';
import Reports from './components/Reports.tsx';
import Profile from './components/Profile.tsx';
import Login from './components/Login.tsx';
import AiInsights from './components/AiInsights.tsx';

const App: React.FC = () => {
  const location = useLocation();
  
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true' || 
           sessionStorage.getItem('isLoggedIn') === 'true';
  });
  
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

  const handleLogin = (status: boolean, remember: boolean = false) => {
    setIsAuthenticated(status);
    if (status) {
      if (remember) {
        localStorage.setItem('isLoggedIn', 'true');
        sessionStorage.removeItem('isLoggedIn');
      } else {
        sessionStorage.setItem('isLoggedIn', 'true');
        localStorage.removeItem('isLoggedIn');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('isLoggedIn');
  };

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);
  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  
  if (!isAuthenticated) {
    return <Login onLogin={(remember) => handleLogin(true, remember)} />;
  }

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/ingreso': return 'Ingreso de Datos Operativos';
      case '/vetiver': return 'Proyecto Vetiver';
      case '/reportes': return 'Informes';
      case '/perfil': return 'Perfil de Usuario';
      default: return 'Panel de Gestión CO₂';
    }
  };

  const getBreadcrumb = () => {
    switch (location.pathname) {
      case '/ingreso': return 'Gestión / Ingreso de Datos';
      case '/vetiver': return 'Gestión / Proyecto Vetiver';
      case '/reportes': return 'Gestión / Informes';
      case '/perfil': return 'Cuenta / Perfil';
      default: return 'Panel Principal';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} onLogout={handleLogout} />
      
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <AiInsights kpis={{ totalEmissions: "1.790,5", netBalance: "1.577,2" }} data={[]} />

        <footer className="mt-auto p-8 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2026 Puerto Columbo S.A. – Sistema de Gestión Ambiental</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
