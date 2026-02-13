
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiInsightsProps {
  data: any;
  kpis: any;
}

// --- SUB-COMPONENTES MEMOIZADOS ---

const MessageBubble = memo(({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      <div className={`max-w-[88%] rounded-[28px] p-5 shadow-sm border backdrop-blur-md ${
        isUser 
          ? 'bg-slate-900 text-white border-slate-800 rounded-br-none' 
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/50 dark:border-white/5 rounded-bl-none shadow-xl'
      }`}>
        <div className="flex items-center gap-2 mb-2 opacity-50">
          <span className="material-symbols-outlined text-[14px]">
            {isUser ? 'person' : 'smart_toy'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isUser ? 'Analista Senior' : 'AI Strategic Advisor'}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
          <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {!isUser && (
            <button 
              onClick={() => navigator.clipboard.writeText(msg.text)}
              className="text-[9px] font-black text-primary hover:underline uppercase tracking-widest flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[12px]">content_copy</span>
              Copiar
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

const QuickAction = memo(({ action, onClick }: { action: any, onClick: (label: string) => void }) => (
  <button 
    onClick={() => onClick(action.label)}
    className="group text-[10px] font-black text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-5 py-2.5 rounded-2xl hover:border-primary hover:bg-primary/5 hover:text-primary transition-all flex items-center gap-3 shadow-sm active:scale-95"
  >
    <div className="size-6 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
      <span className="material-symbols-outlined text-[16px]">{action.icon}</span>
    </div>
    {action.label.toUpperCase()}
  </button>
));

const AiInsights: React.FC<AiInsightsProps> = ({ data, kpis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Bienvenido, Angel. He analizado el cierre de Febrero 2026. Los sumideros biológicos del Proyecto Vetiver están operando al 94% de eficiencia. \n\n¿Deseas una proyección del balance neto para el próximo trimestre o prefieres revisar las estrategias de descarbonización de la flota?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll optimizado
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [messages, loading, isOpen]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const systemInstruction = `
        Identidad: Eres el "Director Estratégico de Sostenibilidad IA" de Puerto Columbo S.A.
        Contexto Temporal: Febrero de 2026.
        Misión: Ayudar a los gestores ambientales a interpretar el éxito del balance Carbono Negativo y planificar la Autonomía Energética 2027.
        
        Datos de Soporte (Métricas Reales):
        - Balance Neto Actual: ${kpis.netBalance} tCO2e (Carbono Negativo logrado).
        - Emisiones Brutas: ${kpis.totalEmissions} tCO2e.
        - Eficiencia Operativa: ${kpis.efficiency} kg/v.
        - Tendencia de Reducción: ${kpis.reductionTrend}.
        - Historial Operativo: ${JSON.stringify(data)}.

        Directrices de Respuesta:
        1. Tono: Ejecutivo, basado en datos, visionario y altamente profesional.
        2. Conocimiento: Experto en sistemas Vetiver (bio-captura), hidrógeno verde y logística portuaria.
        3. Formato: Usa listas si es necesario, pero mantén las respuestas por debajo de 150 palabras a menos que se pida un informe detallado.
        4. Idioma: Español profesional de Chile/Latinoamérica.
        
        Recuerda: El usuario es Angel Gutierrez, Gestor Ambiental Senior. Trátalo con respeto pero como un colega de alto nivel.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          topP: 0.95,
        }
      });

      const aiText = response.text || "He detectado una interrupción en el enlace de datos. Por favor, reformula tu consulta técnica.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Sistema de análisis temporalmente fuera de línea. Reintentando sincronización..." }]);
    } finally {
      setLoading(false);
    }
  }, [kpis, data, loading]);

  const quickActions = useMemo(() => [
    { label: "Análisis Balance Negativo", icon: "monitoring" },
    { label: "Ruta Hacia Autonomía 2027", icon: "rocket_launch" },
    { label: "Impacto Vetiver Fase III", icon: "eco" },
    { label: "Optimización de Flota", icon: "local_shipping" }
  ], []);

  const handleToggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <>
      <button 
        onClick={handleToggleChat}
        className="fixed bottom-8 right-8 bg-slate-900 dark:bg-primary text-white p-5 rounded-[24px] shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center group border-4 border-white dark:border-slate-800 ring-4 ring-primary/20"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">insights</span>
          <span className="absolute -top-1 -right-1 size-3.5 bg-primary rounded-full border-2 border-white dark:border-slate-800 animate-ping"></span>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 group-hover:ml-4 whitespace-nowrap font-black text-xs uppercase tracking-[0.2em]">
          Estratega IA Online
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-500" 
            onClick={handleToggleChat} 
          />
          
          <div className="relative w-full max-w-xl bg-slate-50 dark:bg-slate-900 h-full shadow-[-40px_0_80px_rgba(0,0,0,0.3)] flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/10">
            
            {/* Header del Chat */}
            <div className="p-8 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="size-14 rounded-[22px] bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-white text-3xl">smart_toy</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-4 bg-primary border-2 border-white dark:border-slate-800 rounded-full"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Strategic Advisor</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Sincronizado</span>
                    <span className="text-[10px] text-slate-400 font-bold">•</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">v4.0.2 Stable</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleToggleChat}
                className="size-12 rounded-2xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-2xl">close_fullscreen</span>
              </button>
            </div>

            {/* Area de Mensajes */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth scrollbar-hide bg-[radial-gradient(circle_at_top_right,rgba(17,212,33,0.05),transparent)]">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} />
              ))}
              
              {loading && (
                <div className="flex justify-start w-[90%] animate-in fade-in duration-300">
                  <div className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-white/5 rounded-[32px] rounded-bl-none p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                       <div className="flex gap-1">
                          <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                          <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                          <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                       </div>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Procesando Vectores de Sostenibilidad...</span>
                    </div>
                    <div className="space-y-3">
                      <div className="h-2 bg-slate-200/50 dark:bg-slate-700/30 rounded-full w-full"></div>
                      <div className="h-2 bg-slate-200/50 dark:bg-slate-700/30 rounded-full w-4/5"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Acciones Rápidas */}
            {!loading && (
              <div className="px-8 py-4 flex flex-wrap gap-3 bg-transparent">
                {quickActions.map((action, i) => (
                  <QuickAction key={i} action={action} onClick={sendMessage} />
                ))}
              </div>
            )}

            {/* Input de Usuario */}
            <div className="p-8 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-white/5 backdrop-blur-2xl">
              <div className="relative flex items-center gap-4">
                <div className="flex-1 relative group">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Escribe tu consulta estratégica..."
                    className="w-full bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-6 py-5 text-sm font-medium focus:ring-2 focus:ring-primary/40 outline-none transition-all dark:text-white placeholder:text-slate-400"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enter para enviar</span>
                  </div>
                </div>
                <button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:grayscale ring-4 ring-primary/10"
                >
                  <span className="material-symbols-outlined text-3xl">send</span>
                </button>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  Análisis basado en datos certificados ISO 14064
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(AiInsights);
