import React, { useState } from 'react';
import type { QuizQuestion } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface ResultsScreenProps {
  score: number;
  quiz: QuizQuestion[];
  userAnswers: string[];
  onRestart: () => void;
  onNewQuizSameTopic: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, quiz, userAnswers, onRestart, onNewQuizSameTopic }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full flex flex-col items-center animate-fade-in">
      <div className="w-full text-center p-8 bg-white rounded-lg shadow-md mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">क्विज़ समाप्त!</h2>
        <p className="text-xl text-gray-600 mb-8">
          आपका अंतिम स्कोर है: <span className="font-bold text-orange-500">{score}</span> / {quiz.length}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-colors duration-200"
          >
            होम पर वापस जाएं
          </button>
          <button
            onClick={onNewQuizSameTopic}
            className="px-6 py-3 bg-orange-100 text-orange-700 font-semibold rounded-lg hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-colors duration-200"
          >
            नई क्विज़ (इसी विषय पर)
          </button>
        </div>
      </div>

      <div className="w-full">
        <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">प्रश्नों की समीक्षा</h3>
        <div className="space-y-2">
          {quiz.map((question, index) => {
            const userAnswer = userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            const isOpen = openIndex === index;

            return (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex items-center justify-between p-4 text-left"
                  aria-expanded={isOpen}
                  aria-controls={`accordion-content-${index}`}
                >
                  <div className="flex items-start">
                    {isCorrect ? 
                      <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" /> :
                      <XCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                    }
                    <p className="font-semibold text-gray-800" dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.question}`}} />
                  </div>
                  <ChevronDownIcon className={`w-6 h-6 text-gray-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
                </button>
                
                <div id={`accordion-content-${index}`} className={`accordion-content ${isOpen ? 'open' : ''}`}>
                  <div className="overflow-hidden">
                    <div className="px-4 pt-2 pb-4 space-y-2">
                      <div className={`flex items-start p-2 rounded-md ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                        <p className="text-gray-700">
                          <span className="font-medium">आपका उत्तर: </span>
                          <span dangerouslySetInnerHTML={{ __html: userAnswer || 'कोई उत्तर नहीं' }} />
                        </p>
                      </div>
                      
                      {!isCorrect && (
                        <div className="flex items-start p-2 rounded-md bg-green-50">
                          <p className="text-gray-700">
                            <span className="font-medium">सही उत्तर: </span>
                            <span dangerouslySetInnerHTML={{ __html: question.answer }} />
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};