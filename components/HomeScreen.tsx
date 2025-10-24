import React, { useState } from 'react';
import { AudioService } from '../services/audioService';

interface HomeScreenProps {
  onStartGame: () => void;
  onStartAiGame: (topic: string, age: number | null) => void;
  onGoToSettings: () => void;
  onGoToLeaderboard: () => void;
  audioService: AudioService;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, onStartAiGame, onGoToSettings, onGoToLeaderboard, audioService }) => {
  const [aiTopic, setAiTopic] = useState('');
  const [aiAge, setAiAge] = useState('');

  const handleButtonClick = (action: () => void) => {
    audioService.playClick();
    action();
  };

  const handleAiGameStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiTopic.trim()) {
      audioService.playClick();
      const age = aiAge ? parseInt(aiAge, 10) : null;
      onStartAiGame(aiTopic.trim(), age);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in w-full max-w-lg">
      <img 
        src="/back.jpg" 
        alt="شعار اللعبة" 
        className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 object-cover mb-6 shadow-lg animate-pop-in"
      />
      
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-8 animate-slide-in-down" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
        من سيربح المليون؟
      </h1>
      
      {/* Main Game Buttons */}
      <div className="space-y-4 w-full max-w-sm">
        <button
          onClick={() => handleButtonClick(onStartGame)}
          className="w-full px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '200ms' }}
        >
          إبدأ اللعبة (أسئلة عامة)
        </button>
        <button
          onClick={() => handleButtonClick(onGoToSettings)}
          className="w-full px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '300ms' }}
        >
          الإعدادات
        </button>
        <button
          onClick={() => handleButtonClick(onGoToLeaderboard)}
          className="w-full px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '400ms' }}
        >
          قائمة المتصدرين
        </button>
      </div>

      {/* Divider */}
      <div className="my-8 w-full max-w-sm border-b-2 border-slate-600/50"></div>

      {/* AI Training Mode */}
      <div className="w-full max-w-sm animate-slide-in-up" style={{ animationDelay: '500ms' }}>
        <h2 className="text-2xl font-bold text-amber-300 mb-4">
          وضع التدريب بالذكاء الاصطناعي
        </h2>
        <form onSubmit={handleAiGameStart} className="flex flex-col items-center gap-4">
            <div className="w-full">
                <label htmlFor="ai-topic" className="block text-slate-300 mb-1">أدخل موضوعاً لتوليد أسئلة مخصصة:</label>
                <input
                    id="ai-topic"
                    type="text"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    placeholder="مثال: تاريخ الفراعنة، دوري أبطال أوروبا..."
                    className="w-full p-3 bg-slate-700 border border-slate-500 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    maxLength={50}
                    required
                />
            </div>
            <div className="w-full">
                <label htmlFor="ai-age" className="block text-slate-300 mb-1">حدد الفئة العمرية (اختياري):</label>
                <input
                    id="ai-age"
                    type="number"
                    value={aiAge}
                    onChange={(e) => setAiAge(e.target.value)}
                    placeholder="مثال: 10"
                    className="w-full p-3 bg-slate-700 border border-slate-500 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    min="5"
                    max="100"
                />
            </div>
            <button
                type="submit"
                disabled={!aiTopic.trim()}
                className="w-full px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105 disabled:bg-slate-500 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
                إبدأ بأسئلة الذكاء الاصطناعي
            </button>
        </form>
      </div>
    </div>
  );
};

export default HomeScreen;