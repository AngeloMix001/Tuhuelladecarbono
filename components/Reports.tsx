
import React, { lazy, Suspense } from 'react';

// Code splitting for the heavy report table
const TablaInformes = lazy(() => import('./TablaInformes'));

const Reports: React.FC = () => {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Base de Datos Ambiental</h1>
          <p className="text-slate-500 mt-1 font-medium">Control de trazabilidad y validación de huella de carbono.</p>
        </div>
      </header>
      
      <Suspense fallback={
        <div className="space-y-8 animate-pulse">
          <div className="h-64 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/10"></div>
          <div className="h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-200 dark:border-white/10"></div>
        </div>
      }>
        <TablaInformes />
      </Suspense>
    </div>
  );
};

export default Reports;
