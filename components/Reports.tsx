
import React from 'react';
import TablaInformes from './TablaInformes';

const Reports: React.FC = () => {
  return (
    <div className="space-y-8 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Base de Datos Ambiental</h1>
          <p className="text-slate-500 mt-1 font-medium">Control de trazabilidad y validación de huella de carbono.</p>
        </div>
      </header>
      <TablaInformes />
    </div>
  );
};

export default Reports;
