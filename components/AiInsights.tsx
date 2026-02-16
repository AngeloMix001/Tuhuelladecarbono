
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from "@google/genai";
import { useRegistros } from '../hooks/useRegistros';
import { exportRegistrosToExcel } from '../utils/export';

interface Message {
  role: 'user' | 'model' | 'system_action';
  text: string;
  isAudio?: boolean;
}

interface AiInsightsProps {
  data: any;
  kpis: any;
}

const STORAGE_CHAT_KEY = 'columbo_ai_chat_history';

const QUICK_PROMPTS = [
  { label: '📊 Resumen hoy', prompt: 'Dame un resumen de las emisiones registradas hoy.' },
  { label: '📂 Exportar Excel', prompt: 'Genera el reporte Excel de todos los registros.' },
  { label: '🌿 Estado Vetiver', prompt: '¿Cómo va la meta de captura del proyecto Vetiver?' },
  { label: '⚠️ Alertas', prompt: '¿Hay algún registro pendiente de validación o rechazado?' },
];

const agentTools: FunctionDeclaration[] = [
  {
    name: "get_environmental_records",
    description: "Obtiene la lista completa de registros ambientales históricos.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "register_emissions",
    description: "Registra una nueva operación de emisiones.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        origen: { type: Type.STRING },
        fecha: { type: Type.STRING },
        trucks: { type: Type.NUMBER },
        containers: { type: Type.NUMBER },
        electricity: { type: Type.NUMBER },
        diesel: { type: Type.NUMBER },
      },
      required: ["origen", "fecha", "electricity", "diesel"]
    }
  },
  {
    name: "trigger_excel_export",
    description: "Genera y descarga un reporte Excel.",
    parameters: { type: Type.OBJECT, properties: {} }
  }
];

const WaveformAnimation = () => (
  <div className="flex items-end gap-[4px] h-8 px-4">
    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
      <div 
        key={i} 
        className="w-1.5 bg-primary rounded-full animate-bounce" 
        style={{ 
          height: `${30 + Math.random() * 70}%`,
          animationDuration: `${0.3 + Math.random() * 0.4}s`,
          animationDelay: `${i * 0.04}s`,
          boxShadow: '0 0 15px rgba(17,212,33,0.4)'
        }}
      />
    ))}
  </div>
);

const MessageBubble = memo(({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  const isAction = msg.role === 'system_action';

  if (isAction) {
    return (
      <div className="flex justify-center my-6">
        <div className="bg-primary/5 border border-primary/20 rounded-full px-6 py-2 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
          <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#11d421]"></span>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">{msg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group animate-in fade-in slide-in-from-bottom-4 duration-300`}>
      <div className={`
        relative max-w-[90%] p-6 rounded-[32px] transition-all duration-300
        ${isUser 
          ? 'bg-slate-900 text-white rounded-br-none shadow-xl border border-white/5' 
          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-lg border border-slate-100 dark:border-white/5 backdrop-blur-xl'
        }
      `}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`size-7 rounded-lg flex items-center justify-center ${isUser ? 'bg-white/10' : 'bg-primary/10 text-primary'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {isUser ? (msg.isAudio ? 'mic' : 'person') : 'smart_toy'}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">
            {isUser ? 'Terminal Gestor' : 'Columbito AI'}
          </span>
        </div>
        <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
        <div className="text-[9px] mt-4 opacity-30 font-bold uppercase tracking-widest text-right">
          {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
        </div>
      </div>
    </div>
  );
});

const AiInsights: React.FC<AiInsightsProps> = ({ kpis }) => {
  const { registros, insertRegistro } = useRegistros();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_CHAT_KEY);
    return saved ? JSON.parse(saved) : [
      { role: 'model', text: 'Sistemas operativos. ¡Hola! Soy Columbito, tu asistente inteligente de Puerto Columbo.\n\nEstoy listo para ejecutar directivas de emisiones o procesar reportes mediante visión y voz.' }
    ];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Guardar historial al cambiar mensajes
  useEffect(() => {
    localStorage.setItem(STORAGE_CHAT_KEY, JSON.stringify(messages));
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = (reader.result as string).split(',')[1];
          sendMessage("", base64Audio);
        };
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Acceso al micrófono denegado.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const executeAction = async (call: any) => {
    const { name, args } = call;
    switch (name) {
      case 'get_environmental_records':
        setMessages(prev => [...prev, { role: 'system_action', text: 'Columbito consultando base de datos...' }]);
        return { result: "success", count: registros.length, latest: registros[0] };
      case 'register_emissions':
        setMessages(prev => [...prev, { role: 'system_action', text: `Columbito inyectando datos en terminal ${args.origen}...` }]);
        await insertRegistro({
          fecha: args.fecha,
          origen: args.origen,
          // Actualizado a 0.45 para alinearse con SEN Chile
          emisiones: (args.electricity * 0.45 + args.diesel * 2.68) / 1000,
          captura: 0,
          datos: args
        });
        return { result: "success", status: "Transacción confirmada en blockchain por Columbito" };
      case 'trigger_excel_export':
        setMessages(prev => [...prev, { role: 'system_action', text: 'Columbito compilando reporte de auditoría...' }]);
        exportRegistrosToExcel(registros);
        return { result: "success" };
      default:
        return { error: "Módulo no implementado" };
    }
  };

  const sendMessage = useCallback(async (userText: string, audioData?: string) => {
    if ((!userText.trim() && !audioData) || loading) return;
    
    const newUserMsg: Message = { role: 'user', text: audioData ? "[Comando de Voz]" : userText, isAudio: !!audioData };
    setMessages(prev => [...prev, newUserMsg]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const systemInstruction = `Eres Columbito, el asistente inteligente oficial de Puerto Columbo. Tu lenguaje es técnico, eficiente y servicial. 
      KPIs ACTUALES: Emisiones ${kpis.totalEmissions}t, Balance ${kpis.netBalance}t.
      Si el usuario pide reportes o datos, usa herramientas obligatoriamente. Identifícate siempre como Columbito si te preguntan quién eres.`;
      
      const contentsParts: any[] = [];
      if (userText) contentsParts.push({ text: userText });
      if (audioData) contentsParts.push({ inlineData: { mimeType: 'audio/webm', data: audioData } });

      const result = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: { parts: contentsParts },
        config: { systemInstruction, tools: [{ functionDeclarations: agentTools }] }
      });

      let fullText = "";
      let hasToolCall = false;

      for await (const chunk of result) {
        const c = chunk as any;
        if (c.functionCalls) {
          hasToolCall = true;
          for (const call of c.functionCalls) {
            const res = await executeAction(call);
            const finalRes = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: { parts: [...contentsParts, { text: `Resultado de la herramienta ${call.name}: ${JSON.stringify(res)}` }] },
              config: { systemInstruction }
            });
            setMessages(prev => [...prev, { role: 'model', text: finalRes.text || "Operación finalizada. ¿En qué más puedo ayudarte?" }]);
          }
        } else if (c.text) {
          fullText += c.text;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.role === 'model' && !hasToolCall) {
              const updated = [...prev];
              updated[updated.length - 1] = { ...last, text: fullText };
              return updated;
            } else if (!hasToolCall) {
              return [...prev, { role: 'model', text: fullText }];
            }
            return prev;
          });
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Lo siento, Columbito ha tenido un error de conexión. Reintente." }]);
    } finally {
      setLoading(false);
    }
  }, [registros, kpis, loading]);

  const clearChat = () => {
    if (window.confirm("¿Deseas que Columbito olvide el historial actual?")) {
      setMessages([{ role: 'model', text: 'Memoria purgada. ¡Hola de nuevo! Soy Columbito, listo para operar.' }]);
      localStorage.removeItem(STORAGE_CHAT_KEY);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-12 z-[60] size-20 bg-slate-900 dark:bg-primary rounded-[28px] shadow-[0_20px_40px_rgba(17,212,33,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[28px] animate-ping opacity-40"></div>
        <span className="material-symbols-outlined text-white text-4xl">smart_toy</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-500" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-lg bg-[#f8fafc] dark:bg-[#080a08] h-full shadow-3xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/5">
            
            {/* Header */}
            <div className="p-8 bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-white/10 flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="size-14 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined text-3xl">smart_toy</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-4 bg-primary border-4 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Columbito</h3>
                  <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Asistente IA Sincronizado</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={clearChat} className="size-10 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">delete_sweep</span>
                </button>
                <button onClick={() => setIsOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 flex items-center justify-center transition-all">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-2 scrollbar-hide">
              {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
              {loading && messages[messages.length-1]?.role !== 'model' && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/20 shadow-sm flex items-center gap-2">
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompts */}
            {!loading && !isRecording && (
              <div className="px-8 pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {QUICK_PROMPTS.map((q, i) => (
                  <button 
                    key={i} 
                    onClick={() => sendMessage(q.prompt)}
                    className="px-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-full text-[10px] font-black text-slate-600 dark:text-slate-400 hover:border-primary hover:text-primary transition-all uppercase tracking-widest shadow-sm"
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {/* Input Panel */}
            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 group">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={isRecording ? "Columbito te escucha..." : "Escribe a Columbito..."}
                    className={`
                      w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-2xl 
                      px-6 py-5 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 
                      transition-all placeholder:text-slate-400 placeholder:uppercase
                      ${isRecording ? 'pr-32' : ''}
                    `}
                    disabled={isRecording}
                  />
                  {isRecording && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <WaveformAnimation />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`
                      size-14 rounded-2xl flex items-center justify-center transition-all duration-300
                      ${isRecording 
                        ? 'bg-rose-500 text-white scale-110 shadow-lg shadow-rose-500/30 ring-4 ring-rose-500/10' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10'
                      }
                    `}
                  >
                    <span className="material-symbols-outlined text-2xl">{isRecording ? 'settings_voice' : 'mic'}</span>
                  </button>
                  
                  <button 
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading || isRecording}
                    className="size-14 bg-slate-900 dark:bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl shadow-primary/30 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-2xl">arrow_upward</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(AiInsights);
