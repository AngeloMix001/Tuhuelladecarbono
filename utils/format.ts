
/**
 * Formatea un número al estándar español (miles con punto, decimales con coma).
 * @param value Valor numérico a formatear
 * @param minDecimals Mínimo de decimales (por defecto 0)
 * @param maxDecimals Máximo de decimales (por defecto 2)
 */
export const formatNumber = (value: number, minDecimals: number = 0, maxDecimals: number = 2): string => {
  if (value === undefined || value === null) return '0';
  
  // Evitar RangeError asegurando que maxDecimals sea al menos igual a minDecimals
  // Esto permite llamadas como formatNumber(val, 4) sin tener que especificar el tercer argumento
  const finalMaxDecimals = Math.max(minDecimals, maxDecimals);

  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: finalMaxDecimals,
    useGrouping: true,
  }).format(value);
};
