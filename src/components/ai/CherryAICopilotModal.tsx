import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
} from "lucide-react";

interface CherryAICopilotModalProps {
  onClose: () => void;
}

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

const PRESETS = [
  {
    title: "🔍 Clientes en Riesgo / Caída",
    prompt:
      "Analiza la cartera de clientes y detecta aquellos con caída de consumo mayor al 15% o sin compras recientes. Recomienda acciones concretas para el preventista.",
  },
  {
    title: "⚙️ Auditoría de Comodatos",
    prompt:
      "Evalúa las máquinas de café en comodato. ¿Cuáles están rindiendo por debajo del umbral mínimo de 25 kg/mes o presentan riesgo financiero?",
  },
  {
    title: "🔥 Balance de Tueste",
    prompt:
      "Calcula la demanda pendiente en pedidos frente al stock disponible y sugiere cuántos lotes de café verde y qué perfiles tostar esta semana.",
  },
  {
    title: "💰 Plan Táctico de Cobranzas",
    prompt:
      "Revisa las cuentas corrientes con deuda vencida y redacta un plan de acción priorizado para recuperar liquidez esta semana.",
  },
];

export const CherryAICopilotModal: React.FC<CherryAICopilotModalProps> = ({ onClose }) => {
  const { queryCherryAI, currentOrg } = useApp();

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "m-1",
      sender: "ai",
      text: `¡Hola! Soy **Cherry AI**, tu copiloto operativo y analítico para **${currentOrg.name}**.\n\nTengo acceso en tiempo real a tus clientes, pedidos, máquinas en comodato, producción de tueste, logística y cuentas corrientes. ¿En qué puedo ayudarte a optimizar hoy?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInput("");
    setLoading(true);

    try {
      const aiResponse = await queryCherryAI(textToSend);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: aiResponse,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: "ai",
        text: "Ocurrió un inconveniente al consultar el motor de inteligencia. Por favor verifica la conexión.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/40 p-4 backdrop-blur-xs text-[#1A1A1A]">
      <div className="flex h-[88vh] w-full max-w-3xl flex-col rounded-xl border border-[#1A1A1A]/10 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A]/10 bg-[#F9F7F2] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#8E2030] text-white shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-[#1A1A1A] text-base">CHERRY AI COPILOT</h3>
                <span className="rounded px-2 py-0.5 font-sans text-[9px] uppercase tracking-wider font-semibold bg-[#8E2030]/10 text-[#8E2030] border border-[#8E2030]/30">
                  Gemini Flash 2.5
                </span>
              </div>
              <p className="font-sans text-xs text-[#1A1A1A]/60">Inteligencia operativa en tiempo real para tostadurías</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg border border-[#1A1A1A]/10 bg-white p-2 text-[#1A1A1A]/60 hover:bg-[#F2EFE9] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 font-sans text-xs bg-white">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "ai" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8E2030] text-white shadow-2xs">
                  <Bot className="h-3.5 w-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 space-y-2 leading-relaxed ${
                  m.sender === "user"
                    ? "bg-[#1A1A1A] text-white font-medium shadow-xs"
                    : "border border-[#1A1A1A]/10 bg-[#F9F7F2] text-[#1A1A1A] shadow-2xs"
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>
                <div
                  className={`text-[9px] ${
                    m.sender === "user" ? "text-white/60 text-right" : "text-[#1A1A1A]/40 text-left"
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === "user" && (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#1A1A1A] text-white">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#8E2030] text-white animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
              </div>
              <div className="rounded-xl border border-[#1A1A1A]/10 bg-[#F9F7F2] px-4 py-3 text-[#1A1A1A]/60 animate-pulse flex items-center gap-2">
                <span>Analizando datos de la tostaduría con Gemini...</span>
              </div>
            </div>
          )}
        </div>

        {/* Preset Prompt Pills */}
        <div className="border-t border-[#1A1A1A]/10 bg-[#F9F7F2] px-4 py-2.5 overflow-x-auto flex gap-2 font-sans">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p.prompt)}
              disabled={loading}
              className="rounded-lg border border-[#1A1A1A]/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1A1A1A]/70 hover:border-[#8E2030] hover:text-[#8E2030] shrink-0 transition-colors disabled:opacity-50"
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="border-t border-[#1A1A1A]/10 bg-white p-4 font-sans">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a Cherry AI sobre clientes, tostados, entregas, máquinas..."
              className="flex-1 rounded-lg border border-[#1A1A1A]/15 bg-[#F9F7F2] px-4 py-2.5 text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:border-[#8E2030] outline-none text-xs"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1A1A1A] text-white shadow-xs hover:bg-[#8E2030] disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
