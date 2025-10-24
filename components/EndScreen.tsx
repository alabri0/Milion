import React, { useState } from 'react';
import { ScoreEntry } from '../types';
import { AudioService } from '../services/audioService';

interface EndScreenProps {
  score: number;
  onRestart: () => void;
  onGoHome: () => void;
  // FIX: Updated onSaveScore to accept score as a parameter.
  onSaveScore: (name: string, score: number) => void;
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
      // FIX: Pass the score along with the player name.
      onSaveScore(playerName.trim(), score);
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
        <form onSubmit={handleSave} className="flex flex-col sm:flex-row items-center gap-3 animate-slide-in-up w-full max-w-sm mb-6" style={{ animationDelay: '400ms' }}>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="أدخل اسمك"
            className="flex-grow p-3 bg-slate-700 border border-slate-500 rounded-lg text-center text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            maxLength={15}
            required
          />
          <button
            type="submit"
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-full text-white font-bold"
          >
            حفظ النتيجة
          </button>
        </form>
      )}

      {scoreSaved && (
        <p className="text-emerald-400 text-lg mb-6 animate-fade-in">تم حفظ نتيجتك بنجاح!</p>
      )}

      <div className="flex gap-4 animate-slide-in-up" style={{ animationDelay: '600ms' }}>
        <button onClick={() => handleButtonClick(onRestart)} className="px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105">
          إعادة اللعب
        </button>
        <button onClick={() => handleButtonClick(onGoHome)} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105">
          العودة للرئيسية
        </button>
      </div>
    </div>
  );
};

// FIX: Added default export to fix module not found error.
export default EndScreen;
