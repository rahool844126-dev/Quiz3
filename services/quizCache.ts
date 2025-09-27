import type { QuizQuestion } from '../types';

const QUIZ_CACHE_PREFIX = 'hqm-quiz:';
const STATS_CACHE_KEY = 'hqm-question-stats';
const CACHE_EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedQuiz {
  timestamp: number;
  questions: QuizQuestion[];
}

interface QuestionStats {
  [questionText: string]: {
    correct: number;
    incorrect: number;
  };
}

const getQuestionStats = (): QuestionStats => {
  try {
    const stats = localStorage.getItem(STATS_CACHE_KEY);
    return stats ? JSON.parse(stats) : {};
  } catch (error) {
    console.error("Error reading question stats:", error);
    return {};
  }
};

const saveQuestionStats = (stats: QuestionStats): void => {
  try {
    localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Error saving question stats:", error);
  }
};

export const updateQuestionStat = (questionText: string, isCorrect: boolean): void => {
  const stats = getQuestionStats();
  if (!stats[questionText]) {
    stats[questionText] = { correct: 0, incorrect: 0 };
  }
  if (isCorrect) {
    stats[questionText].correct += 1;
  } else {
    stats[questionText].incorrect += 1;
  }
  saveQuestionStats(stats);
};


export const saveQuizToCache = (key: string, questions: QuizQuestion[]): void => {
  try {
    const data: CachedQuiz = {
      timestamp: Date.now(),
      questions,
    };
    localStorage.setItem(QUIZ_CACHE_PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving quiz to cache:", error);
  }
};

export const getQuizFromCache = (key: string, numQuestions: number): QuizQuestion[] | null => {
  try {
    const cachedItem = localStorage.getItem(QUIZ_CACHE_PREFIX + key);
    if (!cachedItem) {
      return null;
    }

    const data: CachedQuiz = JSON.parse(cachedItem);
    
    if (Date.now() - data.timestamp > CACHE_EXPIRATION_MS) {
      localStorage.removeItem(QUIZ_CACHE_PREFIX + key);
      return null;
    }

    // If not enough questions in cache for smart selection, return shuffled subset
    if (data.questions.length <= numQuestions) {
       // Simple shuffle and return
        return [...data.questions].sort(() => Math.random() - 0.5);
    }
    
    // --- Spaced Repetition Logic ---
    const stats = getQuestionStats();
    let weightedQuestions = data.questions.map(q => {
      const questionStat = stats[q.question];
      let weight = 10; // Base weight for unseen questions
      if (questionStat) {
        // Increase weight for incorrect answers, decrease for correct ones
        weight = 10 - (questionStat.correct * 2) + (questionStat.incorrect * 5);
      }
      return { question: q, weight: Math.max(1, weight) }; // Ensure weight is at least 1
    });

    const selectedQuestions: QuizQuestion[] = [];
    let totalWeight = weightedQuestions.reduce((sum, q) => sum + q.weight, 0);

    for (let i = 0; i < numQuestions; i++) {
        let randomWeight = Math.random() * totalWeight;
        let chosenIndex = -1;

        for (let j = 0; j < weightedQuestions.length; j++) {
            randomWeight -= weightedQuestions[j].weight;
            if (randomWeight < 0) {
                chosenIndex = j;
                break;
            }
        }
        
        if (chosenIndex !== -1) {
            const [chosenItem] = weightedQuestions.splice(chosenIndex, 1);
            selectedQuestions.push(chosenItem.question);
            totalWeight -= chosenItem.weight;
        } else {
            // Fallback in case of floating point inaccuracies, take the last one
             if (weightedQuestions.length > 0) {
                const [fallbackItem] = weightedQuestions.splice(weightedQuestions.length - 1, 1);
                selectedQuestions.push(fallbackItem.question);
                totalWeight -= fallbackItem.weight;
            }
        }
    }

    return selectedQuestions;

  } catch (error) {
    console.error("Error retrieving quiz from cache:", error);
    return null;
  }
};