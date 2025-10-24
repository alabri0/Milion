
import React from 'react';
import { AudioService } from '../services/audioService';

interface HomeScreenProps {
  onStartGame: () => void;
  onGoToSettings: () => void;
  onGoToLeaderboard: () => void;
  audioService: AudioService;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ onStartGame, onGoToSettings, onGoToLeaderboard, audioService }) => {
  
  const handleButtonClick = (action: () => void) => {
    audioService.playClick();
    action();
  };

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 animate-fade-in">
      <img 
        src="/back.jpg" 
        alt="شعار اللعبة" 
        className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-amber-400 object-cover mb-6 shadow-lg animate-pop-in"
      />
      
      <h1 className="text-5xl md:text-7xl font-bold text-amber-400 mb-12 animate-slide-in-down" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7)' }}>
        من سيربح المليون؟
      </h1>
      <div className="space-y-6 w-full max-w-sm">
        <button
          onClick={() => handleButtonClick(onStartGame)}
          className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '200ms' }}
        >
          إبدأ اللعبة
        </button>
        <button
          onClick={() => handleButtonClick(onGoToSettings)}
          className="w-full px-8 py-4 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '300ms' }}
        >
          الإعدادات
        </button>
        <button
          onClick={() => handleButtonClick(onGoToLeaderboard)}
          className="w-full px-8 py-4 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105 animate-slide-in-up"
          style={{ animationDelay: '400ms' }}
        >
          قائمة المتصدرين
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;
