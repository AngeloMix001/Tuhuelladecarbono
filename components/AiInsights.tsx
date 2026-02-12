
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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`max-w-[85%] rounded-3xl p-4 shadow-sm border ${
        isUser 
          ? 'bg-slate-900 text-white border-slate-800 rounded-br-none' 
          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 rounded-bl-none'
      }`}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
        <span className="text-[9px] opacity-40 mt-2 block font-bold uppercase tracking-widest">
          {isUser ? 'Tú' : 'Asesor IA'} • {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </span>
      </div>
    </div>
  );
});

const QuickAction = memo(({ action, onClick }: { action: any, onClick: (label: string) => void }) => (
  <button 
    onClick={() => onClick(action.label)}
    className="text-[10px] font-black text-slate-600 dark:text-slate-400 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 px-4 py-2 rounded-full hover:border-primary hover:text-primary transition-all flex items-center gap-2"
  >
    <span className="material-symbols-outlined text-sm">{action.icon}</span>
    {action.label.toUpperCase()}
  </button>
));

const AiInsights: React.FC<AiInsightsProps> = ({ data, kpis }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: '¡Hola! Soy tu Consultor de Sostenibilidad IA. He analizado los datos de Puerto Columbo. ¿En qué puedo ayudarte hoy?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll optimizado
  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  const sendMessage = useCallback(async (userText: string) => {
    if (!userText.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Create a new GoogleGenAI instance right before making an API call per guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const systemInstruction = `
        Eres el Consultor Senior de Sostenibilidad de Puerto Columbo S.A. 
        Analiza datos ambientales.
        DATOS ACTUALES:
        - KPIs: ${JSON.stringify(kpis)}
        - Historial Mensual: ${JSON.stringify(data)}
        - Proyecto: Vetiver (captura biológica).
        
        REGLAS:
        1. Profesionalismo corporativo.
        2. Usa datos reales de los KPIs.
        3. Fomenta soluciones basadas en naturaleza.
        4. Respuestas concisas.
      `;

      // Refactored to use systemInstruction config and proper content structure
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: systemInstruction,
        }
      });

      const aiText = response.text || "Lo siento, tuve un problema procesando esa información.";
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error de conexión. Reintenta en unos momentos." }]);
    } finally {
      setLoading(false);
    }
  }, [kpis, data, loading]);

  // Added useMemo to React imports to fix "Cannot find name 'useMemo'" error
  const quickActions = useMemo(() => [
    { label: "Análisis del balance neto", icon: "balance" },
    { label: "¿Cómo va el proyecto Vetiver?", icon: "eco" },
    { label: "Sugerencias para reducir Diesel", icon: "ev_station" }
  ], []);

  const handleToggleChat = useCallback(() => setIsOpen(prev => !prev), []);

  return (
    <>
      {/* Botón Flotante Memoizado Visualmente */}
      <button 
        onClick={handleToggleChat}
        className="fixed bottom-8 right-8 bg-slate-900 dark:bg-primary text-white p-4 rounded-2xl shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center group border-4 border-white dark:border-slate-800"
      >
        <div className="relative">
          <span className="material-symbols-outlined text-2xl group-hover:rotate-12 transition-transform">auto_awesome</span>
          <span className="absolute -top-1 -right-1 size-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        </div>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 group-hover:ml-3 whitespace-nowrap font-black text-xs uppercase tracking-widest">
          Consultar IA
        </span>
      </button>

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={handleToggleChat} 
          />
          
          <div className="relative w-full max-w-lg bg-slate-50 dark:bg-slate-900 h-full shadow-[-20px_0_50px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-500">
            
            {/* Header del Chat */}
            <div className="p-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl animate-pulse">psychology</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Advisor Inteligente</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">En línea</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={handleToggleChat}
                className="size-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Área de Mensajes */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth scrollbar-hide">
              {messages.map((msg, idx) => (
                <MessageBubble key={idx} msg={msg} />
              ))}
              
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl rounded-bl-none p-4 flex gap-2 shadow-sm">
                    <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="size-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Sugerencias Rápidas */}
            {messages.length < 3 && !loading && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {quickActions.map((action, i) => (
                  <QuickAction key={i} action={action} onClick={sendMessage} />
                ))}
              </div>
            )}

            {/* Input de Chat */}
            <div className="p-6 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
              <div className="relative flex items-center gap-3">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder="Pregunta algo..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all dark:text-white"
                />
                <button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <span className="material-symbols-outlined text-2xl">arrow_upward</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(AiInsights);
