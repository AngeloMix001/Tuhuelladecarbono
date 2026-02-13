
import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
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

// --- DEFINICIÓN DE HERRAMIENTAS ---
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
  <div className="flex items-end gap-[3px] h-6 px-3">
    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
      <div 
        key={i} 
        className="w-1 bg-primary rounded-full animate-bounce" 
        style={{ 
          height: `${20 + Math.random() * 80}%`,
          animationDuration: `${0.4 + Math.random() * 0.6}s`,
          animationDelay: `${i * 0.05}s`
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
      <div className="flex justify-center my-8">
        <div className="bg-primary/5 border border-primary/20 rounded-full px-6 py-2.5 flex items-center gap-3 animate-in fade-in zoom-in duration-500 shadow-[0_0_20px_rgba(17,212,33,0.05)]">
          <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_10px_#11d421]"></span>
          <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">{msg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-8 group transition-all duration-300`}>
      <div className={`
        relative max-w-[88%] p-6 rounded-[28px] transition-all duration-500
        ${isUser 
          ? 'bg-slate-900 text-white rounded-br-none shadow-2xl border border-white/5 hover:bg-slate-800' 
          : 'bg-white/95 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-xl border border-slate-200/50 dark:border-white/5 backdrop-blur-xl hover:shadow-2xl'
        }
      `}>
        {!isUser && (
          <div className="absolute -left-1.5 top-8 w-1.5 h-10 bg-primary rounded-full shadow-[0_0_12px_#11d421]"></div>
        )}
        
        <div className="flex items-center gap-3 mb-4">
          <div className={`size-8 rounded-xl flex items-center justify-center ${isUser ? 'bg-white/10' : 'bg-primary/10 text-primary'}`}>
            <span className="material-symbols-outlined text-[18px]">
              {isUser ? (msg.isAudio ? 'mic' : 'account_circle') : 'smart_toy'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
              {isUser ? (msg.isAudio ? 'Comando de Voz' : 'Gestor de Terminal') : 'Columbo Core AI'}
            </span>
          </div>
        </div>

        <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap selection:bg-primary/30">{msg.text}</p>
        
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-black/5 dark:border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
              {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
          {!isUser && (
            <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-md">
              <span className="material-symbols-outlined text-[10px] text-primary">security</span>
              <span className="text-[8px] font-black text-primary uppercase">Cifrado G-12</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

const AiInsights: React.FC<AiInsightsProps> = ({ kpis }) => {
  const { registros, insertRegistro } = useRegistros();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Sistemas operativos. Bienvenido al núcleo de gestión de Puerto Columbo.\n\nEstoy listo para ejecutar directivas de emisiones, auditar historial o procesar reportes mediante visión y voz. ¿Qué operación desea iniciar?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (isOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

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
      alert("Permiso de micrófono denegado.");
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
        setMessages(prev => [...prev, { role: 'system_action', text: 'Sincronizando base de datos central...' }]);
        return { result: "success", data: registros };
      case 'register_emissions':
        setMessages(prev => [...prev, { role: 'system_action', text: `Inyectando datos en ${args.origen}...` }]);
        await insertRegistro({
          fecha: args.fecha,
          origen: args.origen,
          emisiones: (args.electricity * 0.16 + args.diesel * 2.68) / 1000,
          captura: 0,
          datos: args
        });
        return { result: "success", status: "Transacción Finalizada" };
      case 'trigger_excel_export':
        setMessages(prev => [...prev, { role: 'system_action', text: 'Compilando paquete de auditoría...' }]);
        exportRegistrosToExcel(registros);
        return { result: "success" };
      default:
        return { error: "Prototipo no disponible" };
    }
  };

  const sendMessage = useCallback(async (userText: string, audioData?: string) => {
    if ((!userText.trim() && !audioData) || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: audioData ? "[Comando de Voz Procesado]" : userText, isAudio: !!audioData }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const systemInstruction = `Actúa como el CORE AI de Puerto Columbo. Eres técnico, eficiente y directo. Usa herramientas para cualquier gestión de datos. El usuario es personal autorizado.`;
      const contentsParts: any[] = [];
      if (userText) contentsParts.push({ text: userText });
      if (audioData) contentsParts.push({ inlineData: { mimeType: 'audio/webm', data: audioData } });

      let response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: contentsParts },
        config: { systemInstruction, tools: [{ functionDeclarations: agentTools }] }
      });

      if (response.functionCalls) {
        for (const call of response.functionCalls) {
          const res = await executeAction(call);
          const final = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [...contentsParts, { text: `Resultado de la operación: ${JSON.stringify(res)}` }] },
            config: { systemInstruction }
          });
          setMessages(prev => [...prev, { role: 'model', text: final.text || "Directiva completada." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "Entendido. Sistemas a la espera." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Fallo en el enlace neuronal. Reinicie sesión." }]);
    } finally {
      setLoading(false);
    }
  }, [registros, kpis, loading]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-12 right-12 z-[60] size-20 bg-slate-900 dark:bg-primary rounded-[26px] shadow-[0_25px_50px_-12px_rgba(17,212,33,0.3)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[26px] animate-ping opacity-40"></div>
        <span className="material-symbols-outlined text-white text-4xl group-hover:rotate-12 transition-transform">memory</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-500" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-[#fafafa] dark:bg-[#0a0c0a] h-full shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-700 border-l border-white/5">
            
            {/* Header Industrial */}
            <div className="p-10 bg-white dark:bg-slate-900/40 border-b border-slate-200 dark:border-white/5 flex items-center justify-between backdrop-blur-2xl">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="size-16 rounded-2xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white shadow-xl shadow-primary/20">
                    <span className="material-symbols-outlined text-4xl">automation</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 size-5 bg-primary border-4 border-white dark:border-slate-900 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Columbo Core AI</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 rounded-md border border-primary/20">Auditando Red</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="size-12 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center transition-all group active:scale-90"
              >
                <span className="material-symbols-outlined text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">close</span>
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-10 space-y-2 scrollbar-hide bg-[radial-gradient(circle_at_top_right,rgba(17,212,33,0.03),transparent)]">
              {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
              {loading && (
                <div className="flex justify-start mb-8 animate-pulse">
                  <div className="bg-white/90 dark:bg-slate-800/90 p-6 rounded-2xl border border-primary/20 shadow-lg">
                    <div className="flex gap-2">
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Futuristic Control Panel (Footer) */}
            <div className="p-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl border-t border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-5">
                <div className="relative flex-1 group">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={isRecording ? "Transcribiendo..." : "Envía una directiva técnica..."}
                    className={`
                      w-full bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 rounded-[20px] 
                      px-8 py-6 text-sm font-bold dark:text-white outline-none focus:ring-4 focus:ring-primary/10 
                      transition-all placeholder:text-slate-400 placeholder:uppercase placeholder:tracking-widest
                      ${isRecording ? 'pr-32' : ''}
                    `}
                    disabled={isRecording}
                  />
                  {isRecording && (
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center">
                      <WaveformAnimation />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onMouseDown={startRecording}
                    onMouseUp={stopRecording}
                    onMouseLeave={stopRecording}
                    className={`
                      size-16 rounded-[20px] flex items-center justify-center transition-all duration-300 shadow-xl
                      ${isRecording 
                        ? 'bg-rose-500 text-white animate-pulse scale-110 shadow-rose-500/30 ring-4 ring-rose-500/10' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10'
                      }
                    `}
                    title="Mantén para hablar"
                  >
                    <span className="material-symbols-outlined text-2xl font-light">{isRecording ? 'graphic_eq' : 'mic'}</span>
                  </button>
                  
                  <button 
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || loading || isRecording}
                    className="size-16 bg-slate-900 dark:bg-primary text-white rounded-[20px] flex items-center justify-center shadow-2xl shadow-primary/30 disabled:opacity-20 transition-all hover:scale-105 active:scale-95 group"
                  >
                    <span className="material-symbols-outlined text-2xl group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">send</span>
                  </button>
                </div>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-[14px]">bolt</span>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">Cálculo Hiper-rápido</span>
                </div>
                <div className="flex items-center gap-2">
                   <span className="material-symbols-outlined text-[14px]">verified</span>
                   <span className="text-[8px] font-black uppercase tracking-[0.2em]">Auditado por Gemini</span>
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
