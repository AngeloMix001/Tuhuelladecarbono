
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const AIChatbox: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = { role: 'user', text: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const chat = ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'Eres el Asistente Eco-IA de Puerto Columbo S.A. Tu objetivo es ayudar a los empleados a entender el panel de control de CO2, explicar qué son las emisiones de alcance 1 y 2, y detallar cómo el Proyecto Vetiver ayuda a la neutralidad de carbono. Sé profesional, servicial y conciso.',
        },
      });

      let modelResponseText = '';
      const streamResponse = await chat.sendMessageStream({ message: inputValue });
      
      // Initial empty model message to start streaming into
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of streamResponse) {
        const chunkText = chunk.text;
        if (chunkText) {
          modelResponseText += chunkText;
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = modelResponseText;
            return newMessages;
          });
        }
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Lo siento, ha ocurrido un error al conectar con el asistente. Por favor, intenta de nuevo.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[calc(100vw-2rem)] sm:w-[380px] h-[500px] md:h-[520px] bg-white dark:bg-slate-panel rounded-[2rem] md:rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-4 md:p-6 bg-primary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-8 md:size-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined material-symbols-fill text-lg md:text-xl">smart_toy</span>
              </div>
              <div>
                <p className="text-xs md:text-sm font-black uppercase tracking-widest">Asistente Eco-IA</p>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 md:size-2 bg-white rounded-full animate-pulse"></span>
                  <p className="text-[9px] md:text-[10px] font-bold opacity-80 uppercase tracking-tighter">En línea</p>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-6 md:py-10">
                <span className="material-symbols-outlined text-3xl md:text-4xl text-primary/20 mb-2">eco</span>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">¿En qué puedo ayudarte?</p>
                <div className="mt-4 md:mt-6 flex flex-wrap gap-2 justify-center">
                  {['Proyecto Vetiver', 'Emisiones', 'Reportes'].map(hint => (
                    <button 
                      key={hint}
                      onClick={() => setInputValue(hint)}
                      className="text-[9px] md:text-[10px] font-black border border-slate-200 dark:border-slate-700 rounded-full px-3 py-1.5 hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[90%] p-3 md:p-4 rounded-2xl text-xs md:text-sm font-medium ${
                  msg.role === 'user' 
                    ? 'bg-primary text-white rounded-tr-none shadow-md' 
                    : 'bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800'
                }`}>
                  {msg.text || (isTyping && idx === messages.length - 1 ? <span className="animate-pulse">...</span> : '')}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-white/5">
            <div className="relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Pregúntame algo..."
                className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-full px-5 md:px-6 py-2.5 md:py-3 pr-12 text-xs md:text-sm font-medium focus:ring-2 focus:ring-primary outline-none transition-all"
              />
              <button 
                onClick={handleSendMessage}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 size-8 md:size-9 bg-primary text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              >
                <span className="material-symbols-outlined text-lg md:text-xl">send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="size-12 md:size-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all border-4 border-white dark:border-slate-900"
      >
        <span className="material-symbols-outlined text-2xl md:text-3xl material-symbols-fill">
          {isOpen ? 'keyboard_arrow_down' : 'smart_toy'}
        </span>
      </button>
    </div>
  );
};

export default AIChatbox;
