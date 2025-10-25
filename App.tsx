import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import SettingsScreen from './components/SettingsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { GameState, Question, GameScreen as Screen, SettingsState, ScoreEntry } from './types';
import { AudioService } from './services/audioService';
import { generateQuestions } from './services/geminiService';
import { PRIZE_LEVELS } from './constants';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Home);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMessage, setLoadingMessage] = useState<string>('...جاري تحميل بنك الأسئلة');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    timerDuration: 30,
    difficulty: 'mixed',
    backgroundMusicEnabled: true,
    soundEffectsEnabled: true,
    categories: ['general'],
    ttsMode: 'manual',
  });
  const [lastAiTopic, setLastAiTopic] = useState<string>('');
  const [lastAiAge, setLastAiAge] = useState<number | null>(null);
  
  const audioService = useRef(new AudioService()).current;

  // Audio settings effect
  useEffect(() => {
    audioService.setBackgroundMusicMuted(!settings.backgroundMusicEnabled);
    audioService.setSoundEffectsMuted(!settings.soundEffectsEnabled);
  }, [settings.backgroundMusicEnabled, settings.soundEffectsEnabled, audioService]);
  
  // Music control effect based on screen
  useEffect(() => {
    if (screen === Screen.Home) {
      audioService.stopAll();
      audioService.play('background', true);
    } else if (screen === Screen.End && gameState) {
      audioService.stopAll();
      if (gameState.score === PRIZE_LEVELS[PRIZE_LEVELS.length - 1]) {
        audioService.play('win');
      } else if(gameState.score > 0) {
        audioService.play('win');
      }
      else {
        audioService.play('lose');
      }
    } else if (screen !== Screen.Game) {
      audioService.stop('timer'); // Stop timer if we leave game screen for any reason
    }
  }, [screen, audioService, gameState]);

  // Load initial data effect
  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setQuestions(data);
      } catch (e) {
        console.error("Failed to load questions:", e);
        setError('فشل تحميل بنك الأسئلة. الرجاء المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    const loadLeaderboard = () => {
        try {
            const savedScores = localStorage.getItem('leaderboard');
            if(savedScores) {
                setLeaderboard(JSON.parse(savedScores));
            }
        } catch (e) {
            console.error("Failed to load leaderboard:", e);
        }
    };
    
    loadGameData();
    loadLeaderboard();
  }, []);

  const filterAndSelectQuestions = useCallback((gameQuestions: Question[]): Question[] => {
    let filtered = gameQuestions;

    if (settings.categories.length > 0 && !settings.categories.includes('general')) {
        filtered = filtered.filter(q => settings.categories.includes(q.category));
    }
    
    if (settings.difficulty !== 'mixed') {
        filtered = filtered.filter(q => q.difficulty === settings.difficulty);
    }
    
    if (filtered.length < 15) {
        console.warn("Not enough questions for selected filters, using all questions.");
        filtered = gameQuestions;
    }

    return filtered.sort(() => 0.5 - Math.random()).slice(0, 15);
  }, [settings.categories, settings.difficulty]);


  const startGame = (gameMode: 'normal' | 'ai', aiQuestions: Question[] | null = null) => {
    setError(null);
    let gameQuestions: Question[];

    if (gameMode === 'ai' && aiQuestions) {
      gameQuestions = aiQuestions;
    } else {
      gameQuestions = filterAndSelectQuestions(questions);
    }
    
    if (gameQuestions.length < 15) {
      setError('لا يوجد عدد كاف من الأسئلة لبدء اللعبة. حاول تغيير إعدادات الفئة أو الصعوبة.');
      setScreen(Screen.Home);
      return;
    }

    setGameState({
      currentQuestionIndex: 0,
      score: 0,
      lifelines: {
        fiftyFifty: true,
        phoneFriend: true,
        askAudience: true,
      },
      guaranteedScore: 0,
      questions: gameQuestions,
      gameMode,
    });
    setScreen(Screen.Game);
  };

  const startAiGame = async (topic: string, age: number | null) => {
    setLoading(true);
    setLoadingMessage(`...جاري توليد أسئلة عن "${topic}"`);
    setError(null);
    setLastAiTopic(topic);
    setLastAiAge(age);
    try {
        const aiQuestions = await generateQuestions(topic, age);
        if (aiQuestions.length < 15) {
          throw new Error('AI failed to generate a full set of 15 questions.');
        }
        startGame('ai', aiQuestions);
    } catch (e) {
        console.error(e);
        const baseMessage = 'حدث خطأ أثناء توليد الأسئلة. الرجاء المحاولة مرة أخرى أو تجربة موضوع آخر.';
        let detailedMessage = '';
        if (e instanceof Error) {
            const msg = e.message.toLowerCase();
            if (msg.includes('api key')) {
                detailedMessage = '(خطأ في الإعداد: مفتاح الواجهة البرمجية (API Key) غير صالح أو مفقود. يرجى التحقق من المفتاح المضمن في الكود.)';
            } else if (msg.includes('quota')) {
                detailedMessage = '(تم تجاوز حصة الاستخدام المتاحة)';
            } else if (msg.includes('network') || msg.includes('fetch')) {
                detailedMessage = '(خطأ في الاتصال بالشبكة)';
            } else if (msg.includes('json')) {
                detailedMessage = '(تم استلام رد غير متوقع من الخادم)';
            }
        }
        setError(`${baseMessage} ${detailedMessage}`.trim());
        setScreen(Screen.Home);
    } finally {
        setLoading(false);
    }
  };

  const handleGameEnd = (finalScore: number) => {
    if(gameState){
       setGameState(prev => prev ? { ...prev, score: finalScore } : null);
    }
    setScreen(Screen.End);
  };
  
  const handleRestart = () => {
    if (gameState?.gameMode === 'ai') {
        startAiGame(lastAiTopic, lastAiAge);
    } else {
        startGame('normal');
    }
  };

  const handleGoHome = () => {
    setGameState(null);
    setError(null);
    setScreen(Screen.Home);
  };

  const handleSaveScore = (name: string, score: number) => {
    const newEntry: ScoreEntry = { name, score };
    const newLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(newLeaderboard);
    localStorage.setItem('leaderboard', JSON.stringify(newLeaderboard));
  };

  const handleSaveSettings = (newSettings: SettingsState) => {
    setSettings(newSettings);
    setScreen(Screen.Home);
  };


  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl">{loadingMessage}</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-red-900/50 rounded-lg">
          <p className="text-xl text-red-300 mb-4">{error}</p>
          <button onClick={handleGoHome} className="px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold">
            العودة للرئيسية
          </button>
        </div>
      );
    }

    switch (screen) {
      case Screen.Game:
        return gameState && <GameScreen gameState={gameState} onGameEnd={handleGameEnd} settings={settings} audioService={audioService} />;
      case Screen.End:
        return gameState && <EndScreen score={gameState.score} onRestart={handleRestart} onGoHome={handleGoHome} onSaveScore={handleSaveScore} leaderboard={leaderboard} audioService={audioService}/>;
      case Screen.Settings:
        return <SettingsScreen initialSettings={settings} onSave={handleSaveSettings} onCancel={handleGoHome} audioService={audioService} />;
      case Screen.Leaderboard:
        return <LeaderboardScreen scores={leaderboard} onGoHome={handleGoHome} audioService={audioService} />;
      case Screen.Home:
      default:
        return <HomeScreen onStartGame={() => startGame('normal')} onStartAiGame={startAiGame} onGoToSettings={() => setScreen(Screen.Settings)} onGoToLeaderboard={() => setScreen(Screen.Leaderboard)} audioService={audioService} />;
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen p-4">
      {renderContent()}
    </main>
  );
};

export default App;