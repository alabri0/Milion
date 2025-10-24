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
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div className="mb-12 animate-slide-in-down">
        <h1 className="text-6xl font-bold text-amber-400 drop-shadow-lg">من سيربح المليون؟</h1>
      </div>
      <div className="space-y-4 w-full max-w-xs animate-slide-in-up" style={{ animationDelay: '200ms' }}>
        <button
          onClick={() => handleButtonClick(onStartGame)}
          className="w-full px-8 py-4 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105"
        >
          ابدأ اللعبة
        </button>
         <button
          onClick={() => handleButtonClick(onGoToSettings)}
          className="w-full px-8 py-4 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105"
        >
          الإعدادات
        </button>
        <button
          onClick={() => handleButtonClick(onGoToLeaderboard)}
          className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white text-2xl font-bold transition-transform transform hover:scale-105"
        >
          قائمة المتصدرين
        </button>
      </div>
    </div>
  );
};

export default HomeScreen;