export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export enum GameState {
  START = 'start',
  LOADING = 'loading',
  QUIZ = 'quiz',
  RESULTS = 'results',
  ERROR = 'error',
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';