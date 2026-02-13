
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
  <div className="flex items-end gap-1 h-4 px-2">
    {[0, 1, 2, 3, 4].map((i) => (
      <div 
        key={i} 
        className="w-1 bg-primary rounded-full animate-bounce" 
        style={{ 
          height: `${Math.random() * 100}%`,
          animationDuration: `${0.5 + Math.random()}s`
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
        <div className="bg-primary/5 border border-primary/20 rounded-full px-5 py-2 flex items-center gap-3 animate-in fade-in zoom-in duration-500">
          <span className="size-1.5 bg-primary rounded-full animate-pulse shadow-[0_0_8px_#11d421]"></span>
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{msg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group transition-all duration-300`}>
      <div className={`
        relative max-w-[85%] p-5 rounded-[24px] transition-all
        ${isUser 
          ? 'bg-slate-900 text-white rounded-br-none shadow-xl border border-white/5' 
          : 'bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-lg border border-slate-200/50 dark:border-white/5 backdrop-blur-md'
        }
      `}>
        {!isUser && (
          <div className="absolute -left-1 top-6 w-1 h-8 bg-primary rounded-full shadow-[0_0_8px_#11d421]"></div>
        )}
        
        <div className="flex items-center gap-2 mb-3">
          <div className={`size-7 rounded-lg flex items-center justify-center ${isUser ? 'bg-white/10' : 'bg-primary/10 text-primary'}`}>
            <span className="material-symbols-outlined text-[16px]">
              {isUser ? (msg.isAudio ? 'mic' : 'person') : 'smart_toy'}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-50">
            {isUser ? (msg.isAudio ? 'Voz de Gestor' : 'Gestor Ambiental') : 'Columbo AI Agent'}
          </span>
        </div>

        <p className="text-[13px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
        
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-black/5 dark:border-white/5 opacity-40 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-bold uppercase tracking-widest">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
          {!isUser && (
            <span className="material-symbols-outlined text-[12px] text-primary">verified</span>
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
    { role: 'model', text: 'Bienvenido al Centro de Mando Ambiental. Estoy conectado a los sistemas de Puerto Columbo.\n\nPuedo automatizar tus reportes, registrar nuevas operaciones o analizar la trayectoria de carbono. ¿Qué orden deseas ejecutar?' }
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
        setMessages(prev => [...prev, { role: 'system_action', text: 'Extrayendo historial del servidor...' }]);
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
        return { result: "success", status: "Sincronizado" };
      case 'trigger_excel_export':
        setMessages(prev => [...prev, { role: 'system_action', text: 'Generando binario Excel...' }]);
        exportRegistrosToExcel(registros);
        return { result: "success" };
      default:
        return { error: "No implementado" };
    }
  };

  const sendMessage = useCallback(async (userText: string, audioData?: string) => {
    if ((!userText.trim() && !audioData) || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: audioData ? "[Mensaje de Voz]" : userText, isAudio: !!audioData }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const systemInstruction = `Eres un AGENTE ESTRATÉGICO para Puerto Columbo. Usa herramientas para cada orden operativa.`;
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
            contents: { parts: [...contentsParts, { text: `Tool Output: ${JSON.stringify(res)}` }] },
            config: { systemInstruction }
          });
          setMessages(prev => [...prev, { role: 'model', text: final.text || "Operación completada." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "Entendido." }]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Error de enlace con la IA central." }]);
    } finally {
      setLoading(false);
    }
  }, [registros, kpis, loading]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-10 z-[60] size-16 bg-slate-900 dark:bg-primary rounded-[22px] shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center group"
      >
        <div className="absolute inset-0 bg-primary/20 rounded-[22px] animate-ping opacity-50"></div>
        <span className="material-symbols-outlined text-white text-3xl group-hover:rotate-12 transition-transform">precision_manufacturing</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-[#fdfdfd] dark:bg-[#0c0e0c] h-full shadow-3xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/10">
            
            {/* Header Moderno */}
            <div className="p-8 bg-white dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-5">
                <div className="size-14 rounded-2xl bg-gradient-to-br from-primary to-green-700 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                  <span className="material-symbols-outlined text-3xl animate-pulse">robot_2</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Columbo System Agent</h3>
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-primary rounded-full animate-pulse shadow-[0_0_5px_#11d421]"></span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Núcleo Activo</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-slate-400">close</span>
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-8 space-y-2 scrollbar-hide bg-gradient-to-b from-transparent to-primary/5">
              {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
              {loading && (
                <div className="flex justify-start mb-6">
                  <div className="bg-white/80 dark:bg-slate-800/80 p-5 rounded-2xl border border-primary/20 backdrop-blur-sm">
                    <div className="flex gap-2">
                      <div className="size-1.5 bg-primary rounded-full animate-bounce"></div>
                      <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="size-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Footer / Input Area */}
            <div className="p-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 flex items-center">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
                    placeholder={isRecording ? "Capturando audio..." : "Escribe una instrucción operativa..."}
                    className={`
                      w-full bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl 
                      px-6 py-5 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/30 
                      transition-all placeholder:text-slate-400
                      ${isRecording ? 'pr-24' : ''}
                    `}
                    disabled={isRecording}
                  />
                  {isRecording && (
                    <div className="absolute right-4 flex items-center gap-2">
                      <WaveformAnimation />
                    </div>
                  )}
                </div>

                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  className={`
                    size-16 rounded-2xl flex items-center justify-center transition-all shadow-xl
                    ${isRecording 
                      ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-500/30' 
                      : 'bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-primary hover:bg-primary/10'
                    }
                  `}
                >
                  <span className="material-symbols-outlined text-2xl">{isRecording ? 'mic_none' : 'mic'}</span>
                </button>
                
                <button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading || isRecording}
                  className="size-16 bg-primary text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30 disabled:opacity-20 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-2xl">rocket</span>
                </button>
              </div>
              <p className="mt-5 text-[9px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Control de voz activo mediante red neuronal Gemini
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(AiInsights);
