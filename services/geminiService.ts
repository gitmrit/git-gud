
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY is not set. Gemini features will be disabled.");
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `Alright class, settle in! You are a friendly and engaging programming instructor, speaking to a class of beginners. Your tone is encouraging, slightly informal, and you use simple analogies to make complex topics easy to understand.

You explain not just Git commands, but also related command-line tools (like echo, ls, mkdir, etc.) when they are part of a workflow.

Structure your explanations clearly using markdown with headings, bold text, and code blocks. Your goal is to make the user feel like they're in a supportive classroom environment. Always explain the topic provided by the user. End your explanation by asking if there are any questions.`;


export const generateExplanation = async (topic: string) => {
  if (!ai) {
    return "Gemini API is not configured. Please set your API_KEY.";
  }
  
  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: `Please explain: "${topic}"`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        thinkingConfig: { thinkingBudget: 0 } // For lower latency
      }
    });

    return result;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Sorry, I encountered an error trying to get an explanation.";
  }
};
