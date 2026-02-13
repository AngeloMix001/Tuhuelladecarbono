
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import DataEntry from './pages/DataEntry';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Vetiver from './pages/Vetiver';
import AIChatbox from './components/AIChatbox';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarCollapsed(false);
      } else {
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'data-entry':
        return <DataEntry />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <Profile isSidebarCollapsed={isSidebarCollapsed} />;
      case 'vetiver':
        return <Vetiver />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 p-10">
            <span className="material-symbols-outlined text-6xl mb-4">construction</span>
            <h2 className="text-2xl font-bold text-center">Página en Construcción</h2>
            <p className="text-center">Estamos trabajando para completar esta sección.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden relative">
      {/* Mobile Top Header - Visible only on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-panel border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl font-bold">eco</span>
          </div>
          <span className="font-black text-slate-900 dark:text-white text-sm">Panel CO₂</span>
        </div>
        <button 
          onClick={() => setIsSidebarCollapsed(false)}
          className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      <Sidebar 
        activePage={currentPage} 
        onNavigate={setCurrentPage} 
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      
      <main className="flex-1 overflow-y-auto pt-16 lg:pt-0">
        <div className="max-w-[1600px] mx-auto">
          {renderPage()}
        </div>
        <AIChatbox />
      </main>
    </div>
  );
};

export default App;
