
import * as XLSX from 'xlsx';
import { RegistroCO2 } from '../types';

/**
 * Exporta una lista de registros filtrados a un archivo Excel (.xlsx)
 * con el formato y orden de columnas solicitado por Puerto Columbo S.A.
 */
export const exportRegistrosToExcel = (registros: RegistroCO2[]) => {
  if (!registros || registros.length === 0) {
    throw new Error("No hay datos para exportar");
  }

  // Definición de cabeceras según requerimiento exacto
  const headers = ["ID", "Fecha", "Origen", "Emisiones (t)", "Captura (t)", "Estado"];
  
  // Mapeo de datos respetando el orden de columnas
  const dataRows = registros.map(r => [
    r.id,
    r.fecha,
    r.origen,
    r.emisiones,
    r.captura || 0,
    r.estado.replace('_', ' ')
  ]);

  // Creación de la hoja de cálculo
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);
  
  // Configuración de anchos de columna básicos
  const wscols = [
    { wch: 15 }, // ID
    { wch: 12 }, // Fecha
    { wch: 30 }, // Origen
    { wch: 15 }, // Emisiones
    { wch: 15 }, // Captura
    { wch: 15 }, // Estado
  ];
  worksheet['!cols'] = wscols;

  // Formateo numérico para las columnas de Emisiones (D) y Captura (E)
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
  for (let R = 1; R <= range.e.r; ++R) {
    // Columna D (index 3)
    const emCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 3 })];
    if (emCell) emCell.z = '0.0000';
    
    // Columna E (index 4)
    const capCell = worksheet[XLSX.utils.encode_cell({ r: R, c: 4 })];
    if (capCell) capCell.z = '0.0000';
  }

  // Creación del libro de trabajo
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Reporte Ambiental");

  // Generación y descarga del archivo
  const fileName = `Reporte_CO2_Columbo_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
