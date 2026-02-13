
import React, { useState, useRef, useEffect, useCallback, memo, useMemo } from 'react';
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

// --- DEFINICIÓN DE HERRAMIENTAS PARA EL AGENTE ---

const agentTools: FunctionDeclaration[] = [
  {
    name: "get_environmental_records",
    description: "Obtiene la lista completa de registros ambientales históricos para análisis de tendencias, auditoría o consulta de datos específicos.",
    parameters: { type: Type.OBJECT, properties: {} }
  },
  {
    name: "register_emissions",
    description: "Registra una nueva operación de emisiones en el sistema de Puerto Columbo.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        origen: { type: Type.STRING, description: "Nombre del terminal (Ej: 'Puerto Columbo Valparaíso' o 'Puerto Columbo San Antonio')" },
        fecha: { type: Type.STRING, description: "Fecha en formato YYYY-MM-DD" },
        trucks: { type: Type.NUMBER, description: "Número de camiones procesados" },
        containers: { type: Type.NUMBER, description: "Número de contenedores (TEUs)" },
        electricity: { type: Type.NUMBER, description: "Consumo de electricidad en kWh" },
        diesel: { type: Type.NUMBER, description: "Consumo de diesel en Litros" },
      },
      required: ["origen", "fecha", "electricity", "diesel"]
    }
  },
  {
    name: "trigger_excel_export",
    description: "Genera y descarga automáticamente un reporte en formato Excel con los datos actuales filtrados o completos.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        filter_terminal: { type: Type.STRING, description: "Opcional: Filtrar por terminal específico antes de exportar." }
      }
    }
  }
];

const MessageBubble = memo(({ msg }: { msg: Message }) => {
  const isUser = msg.role === 'user';
  const isAction = msg.role === 'system_action';

  if (isAction) {
    return (
      <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-500">
        <div className="bg-primary/5 border border-primary/20 rounded-full px-4 py-1.5 flex items-center gap-2">
          <span className="size-2 bg-primary rounded-full animate-pulse"></span>
          <span className="text-[9px] font-black text-primary uppercase tracking-widest">{msg.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-3 duration-500`}>
      <div className={`max-w-[88%] rounded-[28px] p-5 shadow-sm border backdrop-blur-md ${
        isUser 
          ? 'bg-slate-900 text-white border-slate-800 rounded-br-none' 
          : 'bg-white/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200/50 dark:border-white/5 rounded-bl-none shadow-xl'
      }`}>
        <div className="flex items-center gap-2 mb-2 opacity-50">
          <span className="material-symbols-outlined text-[14px]">
            {isUser ? (msg.isAudio ? 'mic' : 'person') : 'smart_toy'}
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            {isUser ? (msg.isAudio ? 'Voz de Gestor' : 'Gestor Ambiental') : 'AI Autonomous Agent'}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-black/5 dark:border-white/5">
          <span className="text-[8px] opacity-40 font-bold uppercase tracking-widest">
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>
    </div>
  );
});

const AiInsights: React.FC<AiInsightsProps> = ({ data, kpis }) => {
  const { registros, insertRegistro } = useRegistros();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Agente Estratégico Online. Estoy conectado a la base de datos de Puerto Columbo y tengo permisos para registrar datos, analizar tendencias y generar reportes Excel.\n\n¿En qué misión puedo asistirte hoy? Puedes escribirme o usar el micrófono.' }
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

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
      console.error("Error al acceder al micrófono:", err);
      alert("No se pudo acceder al micrófono. Por favor verifica los permisos.");
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
        setMessages(prev => [...prev, { role: 'system_action', text: 'Consultando historial de emisiones...' }]);
        return { result: "success", data: registros };

      case 'register_emissions':
        setMessages(prev => [...prev, { role: 'system_action', text: `Registrando operación en ${args.origen}...` }]);
        const EMISSION_FACTORS = { ELECTRICITY: 0.16, DIESEL: 2.68 };
        const emissions = ((args.electricity * EMISSION_FACTORS.ELECTRICITY) + (args.diesel * EMISSION_FACTORS.DIESEL)) / 1000;
        await insertRegistro({
          fecha: args.fecha,
          origen: args.origen,
          emisiones: emissions,
          captura: 0,
          datos: {
            trucks: args.trucks || 0,
            containers: args.containers || 0,
            electricity: args.electricity,
            diesel: args.diesel
          }
        });
        return { result: "success", message: "Registro guardado correctamente", id: `REC-${Math.random().toString(36).substr(2,4).toUpperCase()}` };

      case 'trigger_excel_export':
        setMessages(prev => [...prev, { role: 'system_action', text: 'Compilando datos y generando Excel...' }]);
        const toExport = args.filter_terminal 
          ? registros.filter(r => r.origen.includes(args.filter_terminal))
          : registros;
        exportRegistrosToExcel(toExport);
        return { result: "success", message: "Archivo Excel generado y descargado." };

      default:
        return { error: "Herramienta no encontrada" };
    }
  };

  const sendMessage = useCallback(async (userText: string, audioData?: string) => {
    if ((!userText.trim() && !audioData) || loading) return;

    const displayMessage = audioData ? "[Mensaje de Voz]" : userText;
    setMessages(prev => [...prev, { role: 'user', text: displayMessage, isAudio: !!audioData }]);
    setInput('');
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const systemInstruction = `
        Eres un AGENTE AUTÓNOMO DE IA para Puerto Columbo S.A.
        Tu objetivo es ejecutar tareas operativas de principio a fin.
        
        REGLAS DE OPERACIÓN:
        1. Si el usuario te pide registrar algo (por texto o voz), usa 'register_emissions'.
        2. Si el usuario te pide un informe o exportar, usa 'trigger_excel_export'.
        3. Si el usuario te hace preguntas analíticas, primero usa 'get_environmental_records'.
        4. Eres capaz de entender audio directamente. Si recibes audio, procésalo como una instrucción directa.
        
        CONTEXTO ACTUAL:
        - Fecha: Febrero 2026.
        - Empresa: Puerto Columbo S.A.
        - KPIs Clave: ${JSON.stringify(kpis)}.
      `;

      // Definir las partes del contenido
      const contentsParts: any[] = [];
      if (userText) contentsParts.push({ text: userText });
      if (audioData) {
        contentsParts.push({
          inlineData: {
            mimeType: 'audio/webm',
            data: audioData
          }
        });
      }

      // Primera llamada: El modelo decide si usa herramientas
      let response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        contents: { parts: contentsParts },
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: agentTools }]
        }
      });

      // Manejo de Bucle de Acciones (Agentic Loop)
      if (response.functionCalls) {
        const functionResponses = [];
        for (const call of response.functionCalls) {
          const result = await executeAction(call);
          functionResponses.push({
            id: call.id,
            name: call.name,
            response: result
          });
        }

        // Segunda llamada con resultados de herramientas
        const finalResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-native-audio-preview-12-2025',
          contents: {
            parts: [
              ...contentsParts,
              ...functionResponses.map(fr => ({
                text: `Resultado de la herramienta ${fr.name}: ${JSON.stringify(fr.response)}`
              }))
            ]
          },
          config: { systemInstruction }
        });

        setMessages(prev => [...prev, { role: 'model', text: finalResponse.text || "Operación procesada con éxito." }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "He recibido tu instrucción. ¿Hay algo más que deba ejecutar?" }]);
      }

    } catch (error) {
      console.error("Agent Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: "Error en el procesamiento. Asegúrate de que el micrófono esté bien configurado." }]);
    } finally {
      setLoading(false);
    }
  }, [registros, insertRegistro, kpis, loading]);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-slate-900 dark:bg-primary text-white p-5 rounded-[24px] shadow-2xl hover:scale-110 transition-all z-50 flex items-center justify-center group border-4 border-white dark:border-slate-800 ring-4 ring-primary/20"
      >
        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">precision_manufacturing</span>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 group-hover:ml-4 whitespace-nowrap font-black text-xs uppercase tracking-[0.2em]">
          Agente Autónomo
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm animate-in fade-in" onClick={() => setIsOpen(false)} />
          
          <div className="relative w-full max-w-xl bg-slate-50 dark:bg-slate-900 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-white/10">
            
            <div className="p-8 bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg">
                  <span className="material-symbols-outlined text-2xl animate-pulse">robot_2</span>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Columbo System Agent</h3>
                  <div className="flex items-center gap-2">
                    <span className="size-2 bg-primary rounded-full"></span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Escucha Activa</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><span className="material-symbols-outlined">close</span></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
              {messages.map((msg, idx) => <MessageBubble key={idx} msg={msg} />)}
              {loading && (
                <div className="flex justify-start animate-pulse">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
                    <div className="flex gap-1.5">
                      <div className="size-2 bg-primary rounded-full animate-bounce"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="size-2 bg-primary rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-white dark:bg-slate-800/80 border-t border-slate-200 dark:border-white/5">
              <div className="flex items-center gap-3">
                <button 
                  onMouseDown={startRecording}
                  onMouseUp={stopRecording}
                  onMouseLeave={stopRecording}
                  onTouchStart={startRecording}
                  onTouchEnd={stopRecording}
                  className={`size-14 rounded-2xl flex items-center justify-center transition-all shadow-lg ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse scale-110 shadow-red-500/40' 
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-primary hover:bg-primary/10'
                  }`}
                  title="Mantén presionado para hablar"
                >
                  <span className="material-symbols-outlined text-2xl">
                    {isRecording ? 'graphic_eq' : 'mic'}
                  </span>
                </button>

                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                  placeholder={isRecording ? "Escuchando..." : "Instrucción de tarea..."}
                  className={`flex-1 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-primary/40 transition-all ${isRecording ? 'opacity-50' : ''}`}
                  disabled={isRecording}
                />
                
                <button 
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading || isRecording}
                  className="size-14 bg-primary text-white rounded-2xl flex items-center justify-center shadow-xl disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-2xl">rocket</span>
                </button>
              </div>
              <p className="mt-4 text-[9px] text-center text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[14px]">record_voice_over</span>
                Mantén presionado el micrófono para dar órdenes por voz.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default memo(AiInsights);
