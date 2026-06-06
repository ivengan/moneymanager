import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI;
let model;

try {
  if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Fast model for text parsing
  }
} catch (error) {
  console.warn("Gemini initialization failed. Check your API key.", error);
}

/**
 * Parses raw text (SMS or receipt notes) into structured transaction data.
 * @param {string} rawText - The raw input text.
 * @returns {Promise<Object>} - Parsed transaction data containing amount, merchant, and category.
 */
export async function parseTransactionText(rawText) {
  if (!model) {
    console.warn("Gemini not configured. Returning fallback data.");
    return {
      amount: 0,
      merchant: "Unknown (No AI)",
      category: "Uncategorized"
    };
  }

  const prompt = `
    You are a personal finance assistant. Parse the following raw transaction text or SMS and extract the amount, merchant name, and best matching category.
    Categories should be broad (e.g., Food & Beverage, Transport, Transfer, Shopping, Utilities).
    
    Raw text: "${rawText}"
    
    Return EXACTLY a JSON object with this format (no markdown, no backticks, just JSON):
    {
      "amount": number,
      "merchant": "string",
      "category": "string"
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (err) {
    console.error('Error parsing with Gemini:', err);
    return {
      amount: 0,
      merchant: "Error parsing",
      category: "Uncategorized"
    };
  }
}
