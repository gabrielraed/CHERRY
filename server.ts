import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy initialize Gemini AI client
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// Health check endpoint
app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "CHERRY TOST - Coffee Business OS",
    timestamp: new Date().toISOString(),
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Gemini AI Copilot Endpoint grounded in actual business context
app.post("/api/ai/query", async (req: Request, res: Response) => {
  try {
    const { prompt, businessContext, history } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      // Fallback intelligent heuristic response when API key is not yet set
      return res.json({
        reply: `[Modo Asistente Local] Para análisis con Gemini en tiempo real, configura la clave GEMINI_API_KEY en los secretos. Aún así, según tus datos actuales: 
- Total Clientes: ${businessContext?.customersCount ?? "N/A"}
- Pedidos Atrasados: ${businessContext?.overdueOrdersCount ?? "0"}
- Clientes en Riesgo: ${businessContext?.riskCustomersCount ?? "0"}
- Máquinas en Comodato: ${businessContext?.consignedMachinesCount ?? "0"}
- Entregados sin facturar: ${businessContext?.deliveredUnbilledCount ?? "0"}`,
      });
    }

    const systemInstruction = `Eres CHERRY AI, el copiloto inteligente de CHERRY TOST (Coffee Business Operating System), una plataforma SaaS integral para tostadores de café de especialidad y distribuidores.

Tu rol es asistir a directores, gerentes, jefes de producción, preventistas y responsables de cobranzas analizando datos reales de su negocio de café.

DIRECTIVAS ESTRICTAS:
1. Responde SIEMPRE en Español con tono profesional, ejecutivo, claro y enfocado en café de especialidad y gestión comercial/operativa.
2. Basa tus respuestas ÚNICAMENTE en el contexto de negocio proporcionado (clientes, pedidos, máquinas, cobranzas, producción, logística). NUNCA inventes datos numéricos que no estén en el contexto.
3. Si la información no está disponible en el contexto, responde claramente: "No tengo información suficiente en la base de datos actual para determinarlo."
4. Proporciona insights prácticos: alertas de clientes en riesgo de abandono (caída de consumo de café), máquinas con bajo consumo en comodato (payback lento), pedidos atrasados de café tostado, stock crítico de café verde/tostado, entregas sin facturar y cobranzas vencidas.
5. Usa formato Markdown limpio con negritas, listas y emojis sobrios.

Contexto actual de la empresa:
${JSON.stringify(businessContext || {}, null, 2)}
`;

    // Construct chat history or simple prompt
    let contentsPrompt = prompt;
    if (history && Array.isArray(history) && history.length > 0) {
      const formattedHistory = history
        .slice(-6)
        .map((m: { sender: string; text: string }) => `${m.sender === "user" ? "Usuario" : "Cherry AI"}: ${m.text}`)
        .join("\n");
      contentsPrompt = `Historial reciente:\n${formattedHistory}\n\nPregunta actual del usuario: ${prompt}`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: contentsPrompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const replyText = response.text || "No se pudo generar una respuesta.";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);
    return res.status(500).json({
      error: "Error procesando la consulta con Cherry AI",
      details: error?.message || "Internal server error",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`☕ CHERRY TOST Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
