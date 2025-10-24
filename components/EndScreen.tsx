import React, { useState } from 'react';
import { ScoreEntry } from '../types';
import { AudioService } from '../services/audioService';

interface EndScreenProps {
  score: number;
  onRestart: () => void;
  onGoHome: () => void;
  onSaveScore: (name: string) => void;
  leaderboard: ScoreEntry[];
  audioService: AudioService;
}

const EndScreen: React.FC<EndScreenProps> = ({ score, onRestart, onGoHome, onSaveScore, leaderboard, audioService }) => {
  const [playerName, setPlayerName] = useState('');
  const [scoreSaved, setScoreSaved] = useState(false);

  const isHighScore = score > 0 && (leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim()) {
      onSaveScore(playerName.trim());
      setScoreSaved(true);
    }
  };
  
  const handleButtonClick = (action: () => void) => {
    audioService.playClick();
    action();
  }

  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg animate-fade-in">
      <h2 className="text-4xl font-bold text-amber-400 mb-4 animate-slide-in-down">
        {score > 0 ? 'تهانينا!' : 'حظ أوفر المرة القادمة!'}
      </h2>
      <p className="text-2xl text-slate-200 mb-8 animate-pop-in" style={{ animationDelay: '200ms' }}>
        لقد فزت بـ <span className="font-bold text-emerald-400 text-3xl">${score.toLocaleString()}</span>
      </p>
      
      {isHighScore && !scoreSaved && (
        <form onSubmit={handleSave} className="flex flex-col items-center gap-4 w-full max-w-sm animate-slide-in-up" style={{ animationDelay: '400ms' }}>
            <p className="text-lg text-amber-300">لقد دخلت قائمة المتصدرين! أدخل اسمك:</p>
            <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="اكتب اسمك هنا"
                className="w-full p-3 bg-slate-700 border border-slate-500 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                maxLength={15}
                required
            />
            <button
                type="submit"
                onClick={() => audioService.playClick()}
                className="w-full px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
                حفظ النتيجة
            </button>
        </form>
      )}

      {(!isHighScore || scoreSaved) && (
        <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-slide-in-up" style={{ animationDelay: '400ms' }}>
            <button
            onClick={() => handleButtonClick(onRestart)}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
            إعادة اللعب
            </button>
            <button
            onClick={() => handleButtonClick(onGoHome)}
            className="px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
            العودة للرئيسية
            </button>
        </div>
      )}

    </div>
  );
};

export default EndScreen;