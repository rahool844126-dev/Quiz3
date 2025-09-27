import type { QuizQuestion, Difficulty } from '../types';

export const generateFullQuiz = async (topic: string, difficulty: Difficulty, count: number): Promise<QuizQuestion[]> => {
  try {
    const response = await fetch('/api/generateQuiz', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ topic, difficulty, count }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        console.error('Server error:', response.status, errorData);
        throw new Error(`Failed to fetch a new quiz. Server responded with status ${response.status}.`);
    }

    const quizData = await response.json();
    
    if (!Array.isArray(quizData) || quizData.length === 0) {
      throw new Error("API endpoint did not return a valid array of questions.");
    }

    // Validation can still be useful on the client side
    const firstQuestion = quizData[0];
    if (
        !firstQuestion.question || 
        !Array.isArray(firstQuestion.options) || 
        firstQuestion.options.length !== 4 || 
        !firstQuestion.answer ||
        !firstQuestion.options.includes(firstQuestion.answer) ||
        !firstQuestion.explanation
        ) {
      throw new Error("Invalid quiz question format received from server.");
    }
    
    return quizData as QuizQuestion[];

  } catch (error) {
    console.error("Error generating full quiz:", error);
    // Let the calling component handle the user-facing error message
    throw new Error("Failed to fetch a new quiz from the server.");
  }
};


interface VerificationResult {
  isIncorrect: boolean;
  userMessage: string;
}

export const verifyQuestion = async (quizQuestion: QuizQuestion): Promise<VerificationResult> => {
  try {
    const response = await fetch('/api/verifyQuestion', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ quizQuestion }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred' }));
        console.error('Server error:', response.status, errorData);
        throw new Error(`Failed to verify question. Server responded with status ${response.status}.`);
    }

    const result = await response.json();

    if (typeof result.isIncorrect !== 'boolean' || typeof result.userMessage !== 'string') {
        throw new Error("Invalid verification format from server.");
    }

    return result;
  } catch (error) {
    console.error("Error during question verification:", error);
    throw new Error("Failed to verify question with the server.");
  }
};