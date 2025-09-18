
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

export const generateExplanation = async (topic: string) => {
  if (!ai) {
    return "Gemini API is not configured. Please set your API_KEY.";
  }
  
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: `You are an expert Git instructor. Explain the following Git concept or command to a beginner in a clear, concise, and friendly way. Use markdown for formatting. Concept: "${topic}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // For lower latency
      }
    });

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error trying to get an explanation.";
  }
};
