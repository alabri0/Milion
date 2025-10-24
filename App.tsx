import React, { useState, useEffect, useCallback, useRef } from 'react';
import HomeScreen from './components/HomeScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';
import SettingsScreen from './components/SettingsScreen';
import LeaderboardScreen from './components/LeaderboardScreen';
import { GameState, Question, GameScreen as Screen, SettingsState, ScoreEntry } from './types';
import { AudioService } from './services/audioService';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.Home);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [leaderboard, setLeaderboard] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    timerDuration: 30,
    difficulty: 'mixed',
    backgroundMusicEnabled: true,
    soundEffectsEnabled: true,
    categories: ['general'],
    ttsMode: 'manual',
  });
  
  // Use useRef to ensure a single instance of AudioService throughout the app's lifecycle.
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
        // Cleanup all sounds on component unmount to prevent memory leaks
        audioService.stopAll();
    }
  }, [screen, audioService]);


  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Use a relative path for questions.json to work in APK/WebView environments
        const response = await fetch('./questions.json');
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

    // Defensive check to ensure questions have loaded before starting.
    if (!questions || questions.length === 0) {
        setError('بنك الأسئلة غير متوفر أو فارغ. لا يمكن بدء اللعبة.');
        return;
    }

    let gameQuestions: Question[] = [];
    const shuffleArray = (array: Question[]) => [...array].sort(() => 0.5 - Math.random());

    // 1. Filter questions by selected categories. If 'general' is selected, use all questions.
    const categoryFilteredQuestions = settings.categories.includes('general') || settings.categories.length === 0
      ? questions
      : questions.filter(q => settings.categories.includes(q.category));

    // 2. Select questions based on difficulty setting.
    if (settings.difficulty === 'mixed') {
        // For 'mixed' mode, select 5 from each difficulty level.
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
        gameQuestions = shuffleArray([...selectedEasy, ...selectedMedium, ...selectedHard]);
    } else {
        // For a specific difficulty, select 15 questions from that level.
        const filteredQuestions = categoryFilteredQuestions.filter(q => q.difficulty === settings.difficulty);
        if (filteredQuestions.length < 15) {
            setError(`لا توجد أسئلة كافية (15) من مستوى الصعوبة والتخصصات المحددة.`);
            return;
        }
        gameQuestions = shuffleArray(filteredQuestions).slice(0, 15);
    }
    
    // 3. If enough questions were found, initialize and start the game.
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


  const goHome = useCallback(() => {
    audioService.playClick();
    setGameState(null);
    setError(null);
    setScreen(Screen.Home);
  }, [audioService]);

  const goToSettings = () => {
    audioService.playClick();
    setScreen(Screen.Settings);
  };
  
  const goToLeaderboard = () => {
    audioService.playClick();
    setScreen(Screen.Leaderboard);
  };

  const handleSaveSettings = (newSettings: SettingsState) => {
    audioService.playClick();
    setSettings(newSettings);
    goHome();
  };

  if (loading && screen === Screen.Home) {
    return <div className="flex items-center justify-center h-screen text-2xl">...جاري التحميل</div>;
  }
  
  if (error) {
     return (
        <div className="flex flex-col items-center justify-center h-screen text-2xl text-red-500 p-8 text-center">
            <p>{error}</p>
            <button
                onClick={goHome}
                className="mt-8 px-8 py-3 bg-amber-500 hover:bg-amber-600 rounded-full text-white text-xl font-bold transition-colors"
            >
                العودة للشاشة الرئيسية
            </button>
        </div>
    );
  }

  const renderScreen = () => {
    switch (screen) {
      case Screen.Game:
        return gameState && <GameScreen gameState={gameState} onGameEnd={endGame} settings={settings} audioService={audioService} />;
      case Screen.End:
        return gameState && <EndScreen score={gameState.score} onRestart={startGame} onGoHome={goHome} onSaveScore={(name) => handleSaveScore(name, gameState.score)} leaderboard={leaderboard} audioService={audioService} />;
       case Screen.Settings:
        return <SettingsScreen initialSettings={settings} onSave={handleSaveSettings} onCancel={goHome} audioService={audioService} />;
      case Screen.Leaderboard:
        return <LeaderboardScreen scores={leaderboard} onGoHome={goHome} audioService={audioService} />;
      case Screen.Home:
      default:
        return <HomeScreen onStartGame={startGame} onGoToSettings={goToSettings} onGoToLeaderboard={goToLeaderboard} audioService={audioService} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        {renderScreen()}
      </div>
    </div>
  );
};

export default App;