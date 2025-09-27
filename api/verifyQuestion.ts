import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Type } from "@google/genai";

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

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
        const { quizQuestion } = req.body;
        if (!quizQuestion) {
            return res.status(400).json({ error: 'Missing required parameter: quizQuestion' });
        }

        const { question, options, answer } = quizQuestion as QuizQuestion;
        const prompt = `
            As a fact-checker, please analyze the following Hindi quiz question.
            Determine if the provided 'correct answer' is factually correct and if it is one of the provided options.
            Also, check if the other options are plausible but incorrect.

            Question: "${question}"
            Options: ${JSON.stringify(options)}
            Provided Correct Answer: "${answer}"

            First, in your analysis, determine if the question is valid.
            Then, respond in JSON format with two fields:
            1. "is_correct": a boolean (true if the question and answer are valid, false otherwise).
            2. "reasoning": a brief explanation in simple Hindi for your conclusion. For example, if it's correct, say "AI ने इस प्रश्न को सही पाया।". If it's incorrect, explain why (e.g., "दिया गया उत्तर गलत है, सही उत्तर ... है।").

            Your entire response must be only the JSON object.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        is_correct: { type: Type.BOOLEAN },
                        reasoning: { type: Type.STRING }
                    },
                    required: ['is_correct', 'reasoning']
                },
                temperature: 0.2,
            }
        });

        const jsonText = response.text.trim();
        const verification = JSON.parse(jsonText);

        if (typeof verification.is_correct !== 'boolean' || typeof verification.reasoning !== 'string') {
            throw new Error("Invalid verification format from API.");
        }

        const result = {
            isIncorrect: !verification.is_correct,
            userMessage: verification.reasoning,
        };

        res.status(200).json(result);

    } catch (error) {
        console.error("Error in verifyQuestion function:", error);
        res.status(500).json({ error: "Failed to verify question." });
    }
}