import React, { useState, useCallback } from 'react';
import { StartScreen } from './components/StartScreen';
import { QuizScreen } from './components/QuizScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { Loader } from './components/Loader';
import { generateFullQuiz } from './services/geminiService';
import { getQuizFromCache, saveQuizToCache, updateQuestionStat } from './services/quizCache';
import type { QuizQuestion, Difficulty } from './types';
import { GameState } from './types';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentQuizParams, setCurrentQuizParams] = useState<{topic: string; difficulty: Difficulty; numQuestions: number} | null>(null);

  const handleStartQuiz = useCallback(async (topic: string, difficulty: Difficulty, numQuestions: number, options: { forceRefetch?: boolean } = {}) => {
    setGameState(GameState.LOADING);
    setError(null);
    setCurrentQuizParams({ topic, difficulty, numQuestions });
    setUserAnswers([]); // Reset user answers for new quiz
    const cacheKey = `${topic}:${difficulty}:${numQuestions}`;
    
    if (!options.forceRefetch) {
      const cachedQuiz = getQuizFromCache(cacheKey, numQuestions);
      if (cachedQuiz) {
        setQuiz(cachedQuiz);
        setScore(0);
        setCurrentQuestionIndex(0);
        setGameState(GameState.QUIZ);
        return;
      }
    }

    try {
      const questions = await generateFullQuiz(topic, difficulty, numQuestions);
      saveQuizToCache(cacheKey, questions);
      setQuiz(questions);
      setScore(0);
      setCurrentQuestionIndex(0);
      setGameState(GameState.QUIZ);
    } catch (err) {
      console.error(err);
      setError('प्रश्नावली उत्पन्न करने में विफल। विषय बहुत अस्पष्ट हो सकता है या सेवा अनुपलब्ध हो सकती है। कृपया पुन: प्रयास करें।');
      setGameState(GameState.ERROR);
    }
  }, []);

  const handleAnswer = (questionText: string, selectedAnswer: string, isCorrect: boolean) => {
    updateQuestionStat(questionText, isCorrect);
    setUserAnswers(prev => [...prev, selectedAnswer]);
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleCorrectAnswerRetroactively = () => {
    setScore(prev => prev + 1);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setGameState(GameState.RESULTS);
    }
  };

  const handleRestart = () => {
    setGameState(GameState.START);
    setQuiz([]);
    setUserAnswers([]);
  };

  const handleNewQuizSameTopic = () => {
    if (currentQuizParams) {
        handleStartQuiz(
            currentQuizParams.topic, 
            currentQuizParams.difficulty, 
            currentQuizParams.numQuestions, 
            { forceRefetch: true }
        );
    }
  }
  
  const renderContent = () => {
    switch (gameState) {
      case GameState.START:
        return <StartScreen onStart={handleStartQuiz} />;
      case GameState.LOADING:
        return <Loader message="आपकी क्विज़ तैयार की जा रही है..." />;
      case GameState.QUIZ:
        return quiz.length > 0 && (
          <QuizScreen
            question={quiz[currentQuestionIndex]}
            onAnswer={handleAnswer}
            onNext={handleNextQuestion}
            score={score}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={quiz.length}
            onCorrectAnswerRetroactively={handleCorrectAnswerRetroactively}
            onGoHome={handleRestart}
          />
        );
      case GameState.RESULTS:
        return (
           <ResultsScreen
             score={score}
             quiz={quiz}
             userAnswers={userAnswers}
             onRestart={handleRestart}
             onNewQuizSameTopic={handleNewQuizSameTopic}
           />
        )
      case GameState.ERROR:
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-md animate-fade-in">
            <h2 className="text-2xl font-bold text-red-600 mb-4">उफ़! कुछ गलत हो गया।</h2>
            <p className="text-gray-600 max-w-md mb-6">{error}</p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors duration-200"
            >
              एक नया विषय आज़माएँ
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8 py-4">
          <div className="flex items-center gap-3">
            <LogoIcon className="w-8 h-8 text-orange-500" />
            <h1 className="text-xl font-bold text-gray-800">
              Hindi Quiz Master
            </h1>
          </div>
        </header>
        <main className="min-h-[400px] flex items-center justify-center">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;