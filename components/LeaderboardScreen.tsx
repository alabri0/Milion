import React from 'react';
import { ScoreEntry } from '../types';
import { AudioService } from '../services/audioService';

interface LeaderboardScreenProps {
    scores: ScoreEntry[];
    onGoHome: () => void;
    audioService: AudioService;
}

const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ scores, onGoHome, audioService }) => {
    
    const handleGoHome = () => {
        audioService.playClick();
        onGoHome();
    }

    return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-800/50 rounded-lg w-full max-w-2xl mx-auto animate-fade-in">
            <h2 className="text-4xl font-bold text-amber-400 mb-8">قائمة المتصدرين</h2>

            {scores.length > 0 ? (
                <ol className="w-full space-y-3">
                    {scores.map((entry, index) => (
                        <li 
                            key={index} 
                            className={`flex justify-between items-center p-3 rounded-lg text-xl transition-all duration-300 animate-slide-in-up ${
                                index === 0 ? 'bg-amber-500/80 text-white font-bold' :
                                index === 1 ? 'bg-slate-500/60' :
                                index === 2 ? 'bg-yellow-800/50' :
                                'bg-slate-700/50'
                            }`}
                             style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <span className="font-bold w-10">{index + 1}.</span>
                            <span className="flex-grow text-right pr-4">{entry.name}</span>
                            <span className="font-bold text-emerald-400">${entry.score.toLocaleString()}</span>
                        </li>
                    ))}
                </ol>
            ) : (
                <p className="text-xl text-slate-400 my-8">لا توجد نتائج مسجلة بعد. كن أول من يدخل القائمة!</p>
            )}

            <button
                onClick={handleGoHome}
                className="mt-10 px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold transition-transform transform hover:scale-105"
            >
                العودة للرئيسية
            </button>
        </div>
    );
};

export default LeaderboardScreen;