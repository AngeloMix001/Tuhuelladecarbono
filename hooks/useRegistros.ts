
import { useState, useEffect, useCallback } from 'react';
import { RegistroCO2, EstadoRegistro } from '../types';

const STORAGE_KEY = 'puerto_columbo_carbon_records';

export const useRegistros = () => {
  const [registros, setRegistros] = useState<RegistroCO2[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      const parsed = data ? JSON.parse(data) : [];
      setRegistros(parsed);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const insertRegistro = async (nuevo: Omit<RegistroCO2, 'id' | 'timestamp' | 'estado'>) => {
    const registroCompleto: RegistroCO2 = {
      ...nuevo,
      id: `REC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      timestamp: new Date().toISOString(),
      estado: 'EN_VALIDACION'
    };

    const actualizados = [registroCompleto, ...registros];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizados));
    setRegistros(actualizados);
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
