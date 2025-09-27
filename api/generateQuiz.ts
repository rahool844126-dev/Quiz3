import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

// Duplicating types for robustness in serverless environment
type Difficulty = 'Easy' | 'Medium' | 'Hard';
interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

const quizQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question: {
      type: Type.STRING,
      description: 'The quiz question in Hindi.'
    },
    options: {
      type: Type.ARRAY,
      description: 'An array of 4 possible answers in Hindi. One must be correct.',
      items: {
        type: Type.STRING
      }
    },
    answer: {
      type: Type.STRING,
      description: 'The correct answer in Hindi, which must be one of the strings from the options array.'
    },
    explanation: {
      type: Type.STRING,
      description: 'A brief, one or two sentence explanation in simple Hindi about why the answer is correct.'
    }
  },
  required: ['question', 'options', 'answer', 'explanation']
};


export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
  
  if (!process.env.API_KEY) {
    console.error("API_KEY environment variable is not set.");
    return res.status(500).json({ error: "Server configuration error: API_KEY is not configured." });
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const { topic, difficulty, count } = req.body;

    if (!topic || !difficulty || !count) {
      return res.status(400).json({ error: 'Missing required parameters: topic, difficulty, count' });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate ${count} unique, ${difficulty.toLowerCase()} difficulty multiple-choice quiz questions about "${topic}". The user has selected Hindi language, so the questions, options, answers, and explanations MUST be in Hindi. Provide one correct answer and three plausible but incorrect options for each question. For each question, also provide a brief, one or two sentence explanation in simple Hindi about why the answer is correct. Return the result as an array of JSON objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: quizQuestionSchema
        },
        temperature: 0.8,
      },
    });

    const jsonText = response.text.trim();
    const quizData = JSON.parse(jsonText);

    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error("API did not return a valid array of questions.");
    }
    
    // Basic validation
    const firstQuestion = quizData[0];
    if (
        !firstQuestion.question || 
        !Array.isArray(firstQuestion.options) || 
        firstQuestion.options.length !== 4 || 
        !firstQuestion.answer ||
        !firstQuestion.options.includes(firstQuestion.answer) ||
        !firstQuestion.explanation
        ) {
      throw new Error("Invalid quiz question format received from API.");
    }

    res.status(200).json(quizData);

  } catch (error) {
    console.error("Error in generateQuiz function:", error);
    res.status(500).json({ error: "Failed to generate quiz." });
  }
}