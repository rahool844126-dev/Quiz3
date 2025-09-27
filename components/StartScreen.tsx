import React, { useState } from 'react';
import { ShuffleIcon } from './icons/ShuffleIcon';
import { MixIcon } from './icons/MixIcon';
import { BookIcon } from './icons/BookIcon';
import { QuizCustomizationModal } from './QuizCustomizationModal';
import type { Difficulty } from '../types';
import { SearchIcon } from './icons/SearchIcon';

interface StartScreenProps {
  onStart: (topic: string, difficulty: Difficulty, numQuestions: number) => void;
}

const categories = [
  'इतिहास', 'भूगोल', 'विज्ञान', 'बॉलीवुड', 'क्रिकेट', 'राजनीति', 
  'साहित्य', 'गणित', 'सामान्य ज्ञान', 'कला और संस्कृति'
];

// Helper function to shuffle array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [topic, setTopic] = useState('');
  const [modalCategory, setModalCategory] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim()) {
      setModalCategory(topic.trim());
    }
  };

  const handleCategoryClick = (category: string) => {
    setModalCategory(category);
  };
  
  const handleSurpriseMe = () => {
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setModalCategory(randomCategory);
  }

  const handleMixQuiz = () => {
    const shuffled = shuffleArray(categories);
    const numToPick = Math.floor(Math.random() * 2) + 2; // Pick 2 or 3
    const mixedCategories = shuffled.slice(0, numToPick).join(', ');
    setModalCategory(mixedCategories);
  }

  const handleStartQuiz = (difficulty: Difficulty, numQuestions: number) => {
    if (modalCategory) {
        onStart(modalCategory, difficulty, numQuestions);
    }
  }

  return (
    <>
      <div className="w-full text-center flex flex-col items-center animate-fade-in">
        <h2 className="text-4xl font-bold mb-3 text-gray-900">अपनी ज्ञान यात्रा शुरू करें</h2>
        <p className="text-gray-500 mb-8 max-w-md">100 से अधिक श्रेणियों में से चुनें और अपने ज्ञान का परीक्षण करें।</p>
        
        <div className="w-full max-w-lg space-y-4">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="श्रेणी खोजें (e.g., History, Itihas)..."
                className="w-full pl-4 pr-12 py-3 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 transition-all duration-200"
                aria-label="Quiz topic"
              />
              <button
                type="submit"
                disabled={!topic.trim()}
                className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-gray-400 rounded-r-lg hover:text-orange-500 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-orange-400"
                aria-label="Create quiz"
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </div>
          </form>

          <div className="flex items-center justify-center gap-3">
              <button onClick={handleSurpriseMe} className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors text-sm">
                  <ShuffleIcon className="w-4 h-4"/>
                  Surprise Me
              </button>
              <button onClick={handleMixQuiz} className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 font-medium rounded-lg hover:bg-orange-100 transition-colors text-sm">
                  <MixIcon className="w-4 h-4" />
                  Mix Quiz
              </button>
          </div>
          
        </div>

        <div className="w-full border-t border-orange-100 my-8"></div>
        
        <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className="flex items-center gap-4 p-4 bg-white border border-orange-100 rounded-lg shadow-sm hover:shadow-md hover:border-orange-300 transition-all duration-200 ease-in-out transform hover:-translate-y-1"
            >
              <div className="p-3 bg-orange-100 rounded-lg">
                  <BookIcon className="w-6 h-6 text-orange-500"/>
              </div>
              <span className="font-semibold text-gray-800">{category}</span>
            </button>
          ))}
        </div>
      </div>
      {modalCategory && (
        <QuizCustomizationModal
            category={modalCategory}
            onClose={() => setModalCategory(null)}
            onStart={handleStartQuiz}
        />
      )}
    </>
  );
};