import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

type ChatMessage = {
  name: string;
  message: string;
  timestamp?: string;
};

export async function generarResumen(messages: ChatMessage[]) {
  try {
    const textoChat = messages.map((m) => `${m.name}: ${m.message}`).join("\n");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const prompt = `
      Resume la siguiente conversación de la reunión.
      Incluye:
      - Temas principales
      - Decisiones tomadas
      - Acciones pendientes

      Conversación:
      ${textoChat}
    `;

    const result = await model.generateContent(prompt);

    return result.response.text();
  } catch (error) {
    console.error("Error generando resumen con Gemini:", error);
    throw new Error("No se pudo generar el resumen.");
  }
}
