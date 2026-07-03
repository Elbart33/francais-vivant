import { GoogleGenAI } from "@google/genai";

export async function callGemini({ system, user }) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const client = new GoogleGenAI({ apiKey });

  const fullPrompt = `${system}\n\n${user}`;

  const response = await client.models.generateContent({
    model: "gemini-2.0-flash",
    contents: fullPrompt,
    config: {
      temperature: 0.3,
      maxOutputTokens: 500,
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Réponse vide de Gemini");
  }

  return text;
}
