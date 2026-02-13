
import { useState, useEffect, useCallback } from 'react';
import { RegistroCO2, EstadoRegistro } from '../types';

const STORAGE_KEY = 'puerto_columbo_carbon_records';

const MOCK_INITIAL_DATA: RegistroCO2[] = [
  {
    id: 'REC-A7BD',
    fecha: '2026-02-14',
    timestamp: new Date().toISOString(),
    emisiones: 0.8421,
    captura: 0.12,
    estado: 'APROBADO',
    origen: 'Puerto Columbo Valparaíso',
    datos: { trucks: 45, containers: 82, electricity: 1200, diesel: 450 }
  },
  {
    id: 'REC-B92F',
    fecha: '2026-02-12',
    timestamp: new Date().toISOString(),
    emisiones: 1.2450,
    captura: 0.08,
    estado: 'EN_VALIDACION',
    origen: 'Puerto Columbo San Antonio',
    datos: { trucks: 62, containers: 110, electricity: 1800, diesel: 620 }
  }
];

export const useRegistros = () => {
  const [registros, setRegistros] = useState<RegistroCO2[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistros = useCallback(() => {
    setLoading(true);
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        setRegistros(JSON.parse(data));
      } else {
        // Inicializar con mock data si es la primera vez
        localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_INITIAL_DATA));
        setRegistros(MOCK_INITIAL_DATA);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertRegistro = async (nuevo: Omit<RegistroCO2, 'id' | 'timestamp' | 'estado'>) => {
    const registroCompleto: RegistroCO2 = {
      ...nuevo,
      id: `REC-${Math.random().toString(36).substr(2, 4).toUpperCase()}${Math.floor(Math.random()*100)}`,
      timestamp: new Date().toISOString(),
      estado: 'EN_VALIDACION'
    };

    const actualizados = [registroCompleto, ...registros];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
    setRegistros(actualizados);
    
    // Disparar evento para que otros componentes (como el widget del dashboard) se enteren
    window.dispatchEvent(new Event('localDataChanged'));
    return registroCompleto;
  };

  const updateRegistro = async (id: string, cambios: Partial<RegistroCO2>) => {
    const actualizados = registros.map(r => r.id === id ? { ...r, ...cambios } : r);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
    setRegistros(actualizados);
    window.dispatchEvent(new Event('localDataChanged'));
  };

  const cambiarEstado = async (id: string, nuevoEstado: EstadoRegistro) => {
    await updateRegistro(id, { estado: nuevoEstado });
  };

  const deleteRegistro = async (id: string) => {
    const actualizados = registros.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
    setRegistros(actualizados);
    window.dispatchEvent(new Event('localDataChanged'));
  };

  useEffect(() => {
    fetchRegistros();
    
    const handleStorageChange = (e: any) => {
      if (e.key === STORAGE_KEY || !e.key) fetchRegistros();
    };
    
    window.addEventListener('localDataChanged', fetchRegistros);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('localDataChanged', fetchRegistros);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [fetchRegistros]);

  return {
    registros,
    loading,
    insertRegistro,
    updateRegistro,
    cambiarEstado,
    deleteRegistro,
    refetch: fetchRegistros
  };
};
