import React, { useState, useEffect } from 'react';
import type { QuizQuestion } from '../types';
import { verifyQuestion } from '../services/geminiService';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { FlagIcon } from './icons/FlagIcon';
import { HomeIcon } from './icons/HomeIcon';

interface QuizScreenProps {
  question: QuizQuestion;
  score: number;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (questionText: string, selectedAnswer: string, isCorrect: boolean) => void;
  onNext: () => void;
  onCorrectAnswerRetroactively: () => void;
  onGoHome: () => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({ question, score, questionNumber, totalQuestions, onAnswer, onNext, onCorrectAnswerRetroactively, onGoHome }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [reportResult, setReportResult] = useState<string | null>(null);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [wasUserAnswerCorrect, setWasUserAnswerCorrect] = useState(false);
  const [isConfirmingExit, setIsConfirmingExit] = useState(false);

  useEffect(() => {
    setSelectedAnswer(null);
    setIsAnswered(false);
    setShowExplanation(false);
    setIsReporting(false);
    setReportResult(null);
    setReportSubmitted(false);
    setWasUserAnswerCorrect(false);
  }, [question]);

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;

    if ('vibrate' in navigator) {
      navigator.vibrate(50); // Haptic feedback
    }
    
    const isCorrect = option === question.answer;
    setWasUserAnswerCorrect(isCorrect);
    setSelectedAnswer(option);
    setIsAnswered(true);
    onAnswer(question.question, option, isCorrect);
  };
  
  const handleReport = async () => {
    setIsReporting(true);
    setReportSubmitted(true);
    setReportResult(null);
    try {
      const result = await verifyQuestion(question);
      setReportResult(result.userMessage);

      if (result.isIncorrect && !wasUserAnswerCorrect) {
        onCorrectAnswerRetroactively();
      }
    } catch (error) {
      console.error("Error verifying question:", error);
      setReportResult("सत्यापन के दौरान एक त्रुटि हुई।");
    } finally {
      setIsReporting(false);
    }
  };
  
  const handleGoHomeClick = () => {
    setIsConfirmingExit(true);
  };


  const getButtonClass = (option: string) => {
    const baseClass = 'border';
    if (!isAnswered) {
      return `${baseClass} bg-white border-orange-200 hover:bg-orange-50 hover:border-orange-400`;
    }
    if (option === question.answer) {
      return `${baseClass} bg-green-100 border-green-400 text-green-800 font-bold`;
    }
    if (option === selectedAnswer) {
      return `${baseClass} bg-red-100 border-red-400 text-red-800`;
    }
    return `${baseClass} bg-gray-100 border-gray-200 opacity-60`;
  };
  
  const getIcon = (option: string) => {
    if (!isAnswered) return null;
    if (option === question.answer) return <CheckCircleIcon className="w-6 h-6 text-green-600 animate-pop-in" />;
    if (option === selectedAnswer) return <XCircleIcon className="w-6 h-6 text-red-600 animate-pop-in" />;
    return null;
  };

  const isLastQuestion = questionNumber === totalQuestions;

  return (
    <>
      <div className="w-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleGoHomeClick}
            className="p-2 rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-100 transition-colors"
            aria-label="मुख पृष्ठ पर वापस जाएं"
          >
            <HomeIcon className="w-7 h-7" />
          </button>
          <p className="text-lg font-semibold text-gray-700">प्रश्न {questionNumber}/{totalQuestions}</p>
          <p className="text-xl font-bold text-orange-500">Score: {score}</p>
        </div>
        <div className="bg-orange-50/50 p-6 rounded-lg mb-6 border border-orange-100">
          <p className="text-xl md:text-2xl font-semibold text-center text-gray-800" dangerouslySetInnerHTML={{ __html: question.question }} />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelectAnswer(option)}
              disabled={isAnswered}
              className={`w-full p-4 rounded-lg text-left text-lg font-medium transition-all duration-200 ease-in-out ${getButtonClass(option)} ${!isAnswered ? 'transform hover:scale-105' : 'cursor-default'} flex items-center justify-between`}
            >
              <span dangerouslySetInnerHTML={{ __html: option }} />
              {getIcon(option)}
            </button>
          ))}
        </div>

        {isAnswered && question.explanation && (
          <div className="mt-6 animate-fade-in">
            {!showExplanation ? (
              <div className="text-center">
                <button
                  onClick={() => setShowExplanation(true)}
                  className="px-6 py-2 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors"
                  aria-controls="explanation-content"
                  aria-expanded="false"
                >
                  स्पष्टीकरण देखें
                </button>
              </div>
            ) : (
              <div id="explanation-content" className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <h3 className="text-lg font-bold text-orange-800 mb-2">स्पष्टीकरण</h3>
                <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: question.explanation }} />
              </div>
            )}
          </div>
        )}

        {isAnswered && (
          <div className="mt-8 text-center animate-fade-in">
            <button
              onClick={onNext}
              className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200"
            >
              {isLastQuestion ? 'क्विज़ समाप्त करें' : 'अगला प्रश्न'}
            </button>
            <div className="h-8 mt-4 flex items-center justify-center">
              {!reportSubmitted ? (
                <button
                  onClick={handleReport}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-orange-600 transition-colors"
                  aria-live="polite"
                >
                  <FlagIcon className="w-4 h-4" />
                  गलत प्रश्न की रिपोर्ट करें
                </button>
              ) : isReporting ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="animate-spin h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>जाँच हो रही है...</span>
                </div>
              ) : (
                <p className="text-sm text-center text-gray-700 p-2 bg-gray-100 rounded-md" role="alert">
                  {reportResult}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {isConfirmingExit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="exit-dialog-title">
            <div className="bg-[#FFFBF5] rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
                <h2 id="exit-dialog-title" className="text-xl font-bold text-gray-800 mb-4">क्या आप निश्चित हैं?</h2>
                <p className="text-gray-600 mb-6">आपकी वर्तमान क्विज़ प्रगति खो जाएगी।</p>
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setIsConfirmingExit(false)}
                        className="px-6 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        रद्द करें
                    </button>
                    <button
                        onClick={onGoHome}
                        className="px-6 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                    >
                        क्विज़ छोड़ें
                    </button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};