
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AiInsightsProps {
  data: any;
  kpis: any;
}

const AiInsights: React.FC<AiInsightsProps> = ({ data, kpis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const generateInsight = async () => {
    setIsOpen(true);
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const prompt = `
        Actúa como un Consultor Senior de Sostenibilidad Ambiental para Puerto Columbo S.A.
        Analiza los siguientes datos de emisiones y captura de CO2:
        - Datos Mensuales (6 meses): ${JSON.stringify(data)}
        - KPIs actuales: ${JSON.stringify(kpis)}
        
        Proporciona un análisis breve (máximo 150 palabras) que incluya:
        1. Una observación clave sobre la tendencia actual.
        2. Una recomendación estratégica para mejorar el balance neto (menciona el proyecto Vetiver).
        3. Un mensaje motivador corto para el equipo operativo.
        
        Usa un tono profesional, experto y orientado a resultados.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setInsight(response.text || "No se pudo generar el análisis en este momento.");
    } catch (error) {
      console.error("Error generating AI insight:", error);
      setInsight("Error al conectar con el servicio de inteligencia artificial. Por favor, verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        onClick={generateInsight}
        className="fixed bottom-8 right-8 bg-forest dark:bg-primary text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center group border-4 border-white dark:border-background-dark"
        title="Análisis Inteligente"
      >
        <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 group-hover:ml-2 whitespace-nowrap font-bold text-sm">
          Análisis IA
        </span>
      </button>

      {/* Insight Sidebar/Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex justify-end animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md bg-white dark:bg-background-dark h-full shadow-2xl p-8 flex flex-col border-l border-primary/20 animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">psychology</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Smart Advisor</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="space-y-6">
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-full animate-pulse"></div>
                  <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full w-5/6 animate-pulse"></div>
                  <div className="h-32 bg-slate-100 dark:bg-white/5 rounded-xl w-full animate-pulse mt-8"></div>
                  <p className="text-center text-xs text-slate-400 italic">Analizando tendencias de carbono...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {insight}
                    </p>
                  </div>
                  
                  <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl p-4 mt-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-primary text-sm">info</span>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Aviso de IA</p>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Este análisis es generado automáticamente por modelos de lenguaje de última generación. 
                      Verifique los datos críticos con su consultor ambiental certificado.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={() => setIsOpen(false)}
              className="mt-8 w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AiInsights;
