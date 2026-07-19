'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStadium } from '@/context/StadiumContext';
import { Shell } from '@/components/layout/Shell';
import { Button } from '@/components/ui/Button';
import { getDeterministicFallback } from '@/lib/ai/fallbacks';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isFallback?: boolean;
}

export default function AssistantPage() {
  const {
    zones,
    pois,
    incidents,
    userRole,
    language,
    aiEnabled
  } = useStadium();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState<string>('');
  const [suggestedFollowups, setSuggestedFollowups] = useState<string[]>(['Where is the nearest first aid?', 'Which gates are congested?', 'Where is the bus plaza?']);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);

  // Keep track of role and language for rendering-time reset
  const [prevRole, setPrevRole] = useState(userRole);
  const [prevLang, setPrevLang] = useState(language);

  // During-render reset pattern (React recommended)
  if (userRole !== prevRole || language !== prevLang) {
    setPrevRole(userRole);
    setPrevLang(language);
    setMessages([]); // Clear chat history on switch
    
    // Set default followups
    const followups = language === 'hi'
      ? ["गेट की स्थिति क्या है?", "चिकित्सा केंद्र कहाँ है?", "शौचालय कहाँ है?"]
      : language === 'hinglish'
        ? ["Gate status kya hai?", "Medical station kahan hai?", "Restroom kahan hai?"]
        : language === 'es'
          ? ["¿Estado de puertas?", "¿Dónde hay transporte?", "¿Dónde están los baños?"]
          : ["Where is the nearest first aid?", "Which gates are congested?", "Where is the bus plaza?"];
    setSuggestedFollowups(followups);
  }

  const getWelcomeMessageText = (role: string, lang: string) => {
    if (lang === 'hi') {
      return role === 'volunteer'
        ? "नमस्ते! मैं आपका ग्राउंड वालंटियर कोपायलट हूँ। आप स्टेडियम सुरक्षा अलर्ट, गेट, शौचालय या चिकित्सा कक्षों के बारे में सवाल पूछ सकते हैं। मैं रिपोर्ट को कैसे आगे बढ़ाएं, इसमें भी आपकी मदद करूँगा।"
        : "नमस्ते! मैं स्टेडियमफ्लो फैन असिस्टेंट हूँ। मैं आपको गेट, सीटें, चिकित्सा स्टेशन, शौचालय खोजने या सुलभ मार्ग (wheelchair paths) विकल्प ढूंढने में मदद कर सकता हूँ। मैं आपकी हिन्दी भाषा में सहायता करूँगा!";
    }
    if (lang === 'hinglish') {
      return role === 'volunteer'
        ? "Namaste! Main aapka Ground Volunteer Copilot hoon. Aap stadium safety alerts, gates, restrooms ya medical rooms ke baare me sawal puch sakte hain. Aap reports kaise escalate karein, isme bhi main help karunga."
        : "Namaste! Main StadiumFlow Fan Assistant hoon. Main aapki gates, seats, medical station, washrooms kahan hain ya step-free route path options kya hain, unme help kar sakta hoon. Main aapse Hinglish me hi baat karunga!";
    }
    if (lang === 'es') {
      return role === 'volunteer'
        ? "¡Hola! Soy tu Copiloto de Voluntarios. Puedo ayudarte con las reglas del estadio, accesos de puertas y escalación de incidentes de seguridad."
        : "¡Hola! Soy tu Asistente de StadiumFlow. Te ayudará a localizar puertas, baños, puntos médicos y rutas accesibles. ¿En qué puedo ayudarte?";
    }
    return role === 'volunteer'
      ? "Hello! I am your Ground Volunteer Copilot. I can assist with stadium guidelines, gate loads, restroom amenities, or how to escalate security incidents."
      : "Hello! I am the StadiumFlow Fan Assistant. I am here to help you navigate gates, seats, toilets, medical units, or find step-free route pathways. How can I help you today?";
  };

  // Auto scroll chat to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsgId = `usr_${idCounter.current++}`;
    const userMsg: Message = {
      id: userMsgId,
      role: 'user',
      text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setSuggestedFollowups([]);
    setIsTyping(true);

    try {
      // Assemble history (ignoring welcome since it is dynamically rendered)
      const history = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history,
          language,
          userRole,
          stadiumState: { zones, pois, incidents }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMsgId = `ai_${idCounter.current++}`;
        setMessages(prev => [
          ...prev,
          {
            id: aiMsgId,
            role: 'model',
            text: data.reply,
            isFallback: !aiEnabled || data.isFallback
          }
        ]);
        setSuggestedFollowups(data.suggestedFollowups || []);
      } else {
        throw new Error('API failure');
      }
    } catch {
      // Local fallback integration
      const fallbackReply = getDeterministicFallback(
        text,
        language,
        userRole,
        { zones, pois, incidents }
      );
      
      const fallbackMsgId = `ai_err_${idCounter.current++}`;
      setMessages(prev => [
        ...prev,
        {
          id: fallbackMsgId,
          role: 'model',
          text: fallbackReply.reply,
          isFallback: true
        }
      ]);
      setSuggestedFollowups(fallbackReply.suggestedFollowups);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Shell>
      <div className="max-w-4xl mx-auto w-full px-4 py-6 flex-grow flex flex-col gap-4">
        
        {/* Page Title */}
        <div className="border-b border-brand-border pb-3 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">
              {userRole === 'volunteer' ? 'Volunteer Assistant Hub' : 'StadiumFlow Copilot'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userRole === 'volunteer' 
                ? 'multilingual ground assistance & safety dispatch guidelines' 
                : 'grounded venue assistant'
              }
            </p>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan border border-brand-cyan/20">
            {language === 'hi' ? 'हिन्दी (Hindi)' : language === 'hinglish' ? 'Hinglish' : language === 'es' ? 'Español' : 'English'}
          </span>
        </div>

        {/* Chat box container */}
        <div className="flex-grow bg-brand-elevated border border-brand-border rounded-2xl flex flex-col overflow-hidden h-[450px] shadow-xl">
          
          {/* Messages list */}
          <div className="flex-grow overflow-y-auto p-4 flex flex-col gap-4">
            
            {/* Dynamic Welcome Message (always first) */}
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50">
                <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 pb-1 border-b border-slate-700/40 gap-4 select-none">
                  <span>Stadium Assistant</span>
                  {!aiEnabled && (
                    <span className="text-yellow-500 bg-yellow-500/10 px-1 rounded">
                      Resilient Fallback
                    </span>
                  )}
                </div>
                <p className="whitespace-pre-wrap">{getWelcomeMessageText(userRole, language)}</p>
              </div>
            </div>

            {messages.map(msg => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700/50'
                        : 'bg-brand-cyan text-slate-950 font-medium rounded-tr-none'
                    }`}
                  >
                    {/* Header for AI response to flag resilience fallback mode */}
                    {isAi && (
                      <div className="flex justify-between items-center text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1 pb-1 border-b border-slate-700/40 gap-4 select-none">
                        <span>Stadium Assistant</span>
                        {msg.isFallback && (
                          <span className="text-yellow-500 bg-yellow-500/10 px-1 rounded">
                            Resilient Fallback
                          </span>
                        )}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-slate-700/50 text-slate-400 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggested followups panel */}
          {suggestedFollowups.length > 0 && (
            <div className="p-3 bg-brand-dark/30 border-t border-brand-border/60 flex flex-wrap gap-2 select-none">
              {suggestedFollowups.map(text => (
                <button
                  key={text}
                  onClick={() => handleSendMessage(text)}
                  className="bg-brand-elevated hover:bg-slate-200 dark:hover:bg-slate-800 hover:border-slate-600 border border-brand-border text-slate-800 dark:text-slate-300 text-[10px] font-bold px-3 py-1 rounded-full transition-colors active:scale-95"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Input text form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputText);
            }}
            className="p-3 bg-brand-dark/70 border-t border-brand-border flex gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={language === 'hi' ? "अपना सवाल लिखें..." : language === 'hinglish' ? "Apna sawal likhein..." : language === 'es' ? "Escribe tu pregunta aquí..." : "Type your question..."}
              className="flex-grow bg-brand-dark border border-brand-border rounded-lg text-xs px-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-500 focus:border-brand-cyan focus:outline-none"
              aria-label="Chat input field"
            />
            <Button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              variant="primary"
              className="py-1 px-4 h-auto text-xs"
            >
              Send
            </Button>
          </form>

        </div>

      </div>
    </Shell>
  );
}
