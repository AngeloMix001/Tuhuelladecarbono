
import React from 'react';
import FormularioIngreso from './FormularioIngreso';

const DataInput: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="mb-4">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Registro de Emisiones</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1 uppercase text-[10px] font-black tracking-widest">Terminal de Carga Puerto Columbo</p>
      </div>
      <FormularioIngreso />
    </div>
  );
};

export default DataInput;
