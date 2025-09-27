import React, { useState } from 'react';
import type { Difficulty } from '../types';
import { XIcon } from './icons/XIcon';

interface QuizCustomizationModalProps {
  category: string;
  onClose: () => void;
  onStart: (difficulty: Difficulty, numQuestions: number) => void;
}

export const QuizCustomizationModal: React.FC<QuizCustomizationModalProps> = ({ category, onClose, onStart }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [numQuestions, setNumQuestions] = useState<string>('10');

  const numValue = parseInt(numQuestions, 10);
  const isInvalid = isNaN(numValue) || numValue < 1 || numValue > 28;

  const handleStart = () => {
    if (!isInvalid) {
        onStart(difficulty, numValue);
    }
  };
  
  const handleNumButtonClick = (amount: number) => {
    setNumQuestions(prev => {
        // If input is empty, default to 1 before incrementing/decrementing
        const currentNum = parseInt(prev, 10) || (amount > 0 ? 0 : 2);
        const newValue = currentNum + amount;
        if (newValue >= 1 && newValue <= 28) {
            return newValue.toString();
        }
        return prev;
    });
  }

  const handleNumInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
     // Allow only digits (up to 2) and an empty string.
    if (value === '' || /^\d{1,2}$/.test(value)) {
        setNumQuestions(value);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
        aria-modal="true"
        role="dialog"
    >
      <div className="bg-[#FFFBF5] rounded-xl shadow-2xl p-8 w-full max-w-md relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700" aria-label="Close">
            <XIcon className="w-6 h-6" />
        </button>
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Customize Your Quiz</h2>
            <p className="text-gray-500 mt-1">Category: "{category}"</p>
        </div>

        <div className="space-y-6">
            <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Difficulty</label>
                <div className="flex justify-between items-center gap-2">
                    {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                         <div key={level} className="w-full">
                            <input
                                type="radio"
                                id={level}
                                name="difficulty"
                                value={level}
                                checked={difficulty === level}
                                onChange={() => setDifficulty(level)}
                                className="sr-only peer"
                            />
                            <label
                                htmlFor={level}
                                className="block w-full text-center p-3 rounded-lg border-2 cursor-pointer transition-colors duration-200 peer-checked:bg-orange-100 peer-checked:border-orange-500 peer-checked:text-orange-700 peer-checked:font-bold border-orange-200 text-gray-600 hover:border-orange-400"
                            >
                                {level}
                            </label>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-lg font-semibold text-gray-700 mb-3">Number of Questions</label>
                <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center gap-4">
                        <button onClick={() => handleNumButtonClick(-1)} disabled={isNaN(numValue) || numValue <= 1} className="px-4 py-2 text-2xl font-bold bg-white border-2 border-orange-200 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed">-</button>
                        <input
                            type="text"
                            inputMode="numeric"
                            value={numQuestions}
                            onChange={handleNumInputChange}
                            className="text-2xl font-bold text-gray-800 w-20 text-center bg-white border-2 border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label="Number of questions"
                        />
                        <button onClick={() => handleNumButtonClick(1)} disabled={isNaN(numValue) || numValue >= 28} className="px-4 py-2 text-2xl font-bold bg-white border-2 border-orange-200 rounded-lg text-orange-500 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed">+</button>
                    </div>
                    {isInvalid && numQuestions !== '' && (
                        <p className="text-red-500 text-sm text-center mt-2" role="alert">
                            Please enter a number between 1 and 28.
                        </p>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-8">
             <button
                onClick={handleStart}
                disabled={isInvalid}
                className="w-full px-6 py-4 bg-orange-500 text-white font-bold text-lg rounded-lg shadow-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors duration-200 disabled:bg-orange-300 disabled:cursor-not-allowed"
            >
                क्विज़ शुरू करें
            </button>
        </div>
      </div>
    </div>
  );
};
