import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import SettingsScreen from './components/SettingsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { GameState, Question, GameScreen as Screen, SettingsState, ScoreEntry } from './types';
import { AudioService } from './services/audioService';
import { generateQuestions } from './services/geminiService';

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
  
  const audioService = useRef(new AudioService()).current;

  useEffect(() => {
    audioService.setBackgroundMusicMuted(!settings.backgroundMusicEnabled);
    audioService.setSoundEffectsMuted(!settings.soundEffectsEnabled);
  }, [settings.backgroundMusicEnabled, settings.soundEffectsEnabled, audioService]);
  
  useEffect(() => {
    if (screen === Screen.Game) {
        audioService.play('background', true);
    } else {
        audioService.stop('background');
    }
    
    return () => {
        audioService.stopAll();
    }
  }, [screen, audioService]);


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await fetch('/questions.json');
        if (!response.ok) {
          throw new Error('Failed to load questions.');
        }
        const data: Question[] = await response.json();
        setQuestions(data);
      } catch (err) {
        setError('لا يمكن تحميل بنك الأسئلة. الرجاء المحاولة مرة أخرى.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    const loadLeaderboard = () => {
        try {
            const savedScores = localStorage.getItem('leaderboard');
            if (savedScores) {
              setLeaderboard(JSON.parse(savedScores));
            }
        } catch (e) {
            console.error("Failed to load leaderboard from localStorage", e);
        }
    };

    fetchQuestions();
    loadLeaderboard();
  }, []);

  const startGame = useCallback(() => {
    audioService.playClick();
    setError(null);

    if (!questions || questions.length === 0) {
        setError('بنك الأسئلة غير متوفر أو فارغ. لا يمكن بدء اللعبة.');
        return;
    }

    let gameQuestions: Question[] = [];
    const shuffleArray = (array: Question[]) => [...array].sort(() => 0.5 - Math.random());

    const categoryFilteredQuestions = settings.categories.includes('general') || settings.categories.length === 0
      ? questions
      : questions.filter(q => settings.categories.includes(q.category));

    if (settings.difficulty === 'mixed') {
        const easyQuestions = categoryFilteredQuestions.filter(q => q.difficulty === 'easy');
        const mediumQuestions = categoryFilteredQuestions.filter(q => q.difficulty === 'medium');
        const hardQuestions = categoryFilteredQuestions.filter(q => q.difficulty === 'hard');

        if (easyQuestions.length < 5 || mediumQuestions.length < 5 || hardQuestions.length < 5) {
            setError('لا توجد أسئلة كافية من كل مستوى صعوبة في التخصصات المحددة لبدء اللعبة بالوضع المتدرج.');
            return;
        }
        const selectedEasy = shuffleArray(easyQuestions).slice(0, 5);
        const selectedMedium = shuffleArray(mediumQuestions).slice(0, 5);
        const selectedHard = shuffleArray(hardQuestions).slice(0, 5);
        gameQuestions = [...selectedEasy, ...selectedMedium, ...selectedHard].sort(() => Math.random() - 0.5);
    } else {
        const filteredQuestions = categoryFilteredQuestions.filter(q => q.difficulty === settings.difficulty);
        if (filteredQuestions.length < 15) {
            setError(`لا توجد أسئلة كافية (15) من مستوى الصعوبة والتخصصات المحددة.`);
            return;
        }
        gameQuestions = shuffleArray(filteredQuestions).slice(0, 15);
    }
    
    if (gameQuestions.length > 0) {
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
        });
        setScreen(Screen.Game);
    }
  }, [questions, settings, audioService]);

  const startAiGame = async (topic: string, age: number | null) => {
    audioService.playClick();
    setError(null);
    setLoading(true);
    setLoadingMessage('...جاري توليد الأسئلة بالذكاء الاصطناعي');

    try {
        const gameQuestions = await generateQuestions(topic, age);
        
        if (gameQuestions.length < 15) {
            throw new Error('لم يتمكن الذكاء الاصطناعي من توليد أسئلة كافية.');
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
        });
        setScreen(Screen.Game);

    } catch (err) {
        console.error(err);
        setError('حدث خطأ أثناء توليد الأسئلة. الرجاء التأكد من اتصالك بالإنترنت والمحاولة مرة أخرى.');
    } finally {
        setLoading(false);
        setLoadingMessage('...جاري تحميل بنك الأسئلة'); // Reset message
    }
  };

  const endGame = useCallback((finalScore: number) => {
    if (gameState) {
      if (finalScore > 0) {
        audioService.play('win');
      } else {
        audioService.play('lose');
      }
      setGameState({ ...gameState, score: finalScore });
      setScreen(Screen.End);
    }
  }, [gameState, audioService]);
  
  const handleSaveScore = useCallback((name: string, score: number) => {
    audioService.playClick();
    const newEntry: ScoreEntry = { name, score };
    const updatedLeaderboard = [...leaderboard, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    setLeaderboard(updatedLeaderboard);
    try {
        localStorage.setItem('leaderboard', JSON.stringify(updatedLeaderboard));
    } catch (e) {
        console.error("Failed to save leaderboard to localStorage", e);
    }
  }, [leaderboard, audioService]);

  const goToHome = useCallback(() => {
    audioService.playClick();
    setScreen(Screen.Home);
    setError(null); // Clear errors when going home
  }, [audioService]);

  const goToSettings = useCallback(() => {
    audioService.playClick();
    setScreen(Screen.Settings);
  }, [audioService]);

  const goToLeaderboard = useCallback(() => {
    audioService.playClick();
    setScreen(Screen.Leaderboard);
  }, [audioService]);

  const handleSaveSettings = useCallback((newSettings: SettingsState) => {
    audioService.playClick();
    setSettings(newSettings);
    setScreen(Screen.Home);
  }, [audioService]);

  const renderScreen = () => {
    if (loading) {
      return <div className="flex flex-col items-center justify-center h-screen text-2xl font-bold animate-pulse">{loadingMessage}</div>;
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
          <p className="text-2xl text-red-400 mb-4">{error}</p>
          <button onClick={goToHome} className="px-8 py-3 bg-slate-600 hover:bg-slate-700 rounded-full text-white text-xl font-bold">
            العودة للرئيسية
          </button>
        </div>
      );
    }
    switch (screen) {
      case Screen.Game:
        return gameState && <GameScreen gameState={gameState} onGameEnd={endGame} settings={settings} audioService={audioService} />;
      case Screen.End:
        return gameState && <EndScreen score={gameState.score} onRestart={startGame} onGoHome={goToHome} onSaveScore={handleSaveScore} leaderboard={leaderboard} audioService={audioService} />;
      case Screen.Settings:
        return <SettingsScreen initialSettings={settings} onSave={handleSaveSettings} onCancel={goToHome} audioService={audioService} />;
      case Screen.Leaderboard:
        return <LeaderboardScreen scores={leaderboard} onGoHome={goToHome} audioService={audioService}/>;
      case Screen.Home:
      default:
        return <HomeScreen onStartGame={startGame} onStartAiGame={startAiGame} onGoToSettings={goToSettings} onGoToLeaderboard={goToLeaderboard} audioService={audioService} />;
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-transparent p-4">
      {renderScreen()}
    </main>
  );
};

export default App;