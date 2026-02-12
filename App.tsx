
import React from 'react';
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
  
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/ingreso': return 'Ingreso de Datos Operativos';
      case '/vetiver': return 'Configuración de Captura CO₂';
      case '/reportes': return 'Reportes y Exportación';
      case '/perfil': return 'Perfil de Usuario';
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
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto">
        <Header title={getPageTitle()} breadcrumb={getBreadcrumb()} />
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
          <p className="text-xs text-slate-400 font-medium">© 2024 Puerto Columbo S.A. – Panel de Gestión Ambiental Certificado</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
