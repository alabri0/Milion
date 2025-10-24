import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Lifelines, SettingsState } from '../types';
import { PRIZE_LEVELS, GUARANTEED_LEVELS } from '../constants';
import PrizeLadder from './PrizeLadder';
import LifelineButton from './LifelineButton';
import AudiencePollModal from './AudiencePollModal';
import PhoneFriendModal from './PhoneFriendModal';
import { AudioService } from '../services/audioService';

interface GameScreenProps {
  gameState: GameState;
  onGameEnd: (finalScore: number) => void;
  settings: SettingsState;
  audioService: AudioService;
}

const GameScreen: React.FC<GameScreenProps> = ({ gameState, onGameEnd, settings, audioService }) => {
  const [currentGameState, setCurrentGameState] = useState<GameState>(gameState);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [visibleOptions, setVisibleOptions] = useState<{ [key: string]: string } | null>(null);
  const [showAudiencePoll, setShowAudiencePoll] = useState(false);
  const [showPhoneFriend, setShowPhoneFriend] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timerDuration);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [arabicVoice, setArabicVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [announcement, setAnnouncement] = useState<string>('');
  const [optionsToRemove, setOptionsToRemove] = useState<string[]>([]);
  const [activatingLifeline, setActivatingLifeline] = useState<keyof Lifelines | null>(null);
  
  const currentQuestion = currentGameState.questions[currentGameState.currentQuestionIndex];

  // Effect to find and set an Arabic voice for text-to-speech
  useEffect(() => {
    const loadVoices = () => {
      try {
        if (!('speechSynthesis' in window) || !window.speechSynthesis.getVoices) return;
        const voices = window.speechSynthesis.getVoices();
        // Prefer a voice from Saudi Arabia, then any other Arabic voice.
        const foundVoice = 
            voices.find(voice => voice.lang === 'ar-SA') || 
            voices.find(voice => voice.lang.startsWith('ar-'));
        
        if (foundVoice) {
            setArabicVoice(foundVoice);
        }
      } catch (e) {
        console.error("Error getting synthesis voices. TTS might not work.", e);
      }
    };
    
    try {
        // The 'voiceschanged' event is fired when the list of voices is ready.
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = loadVoices;
            // Call it once to handle cases where voices are already loaded.
            loadVoices();
        }
    } catch (e) {
        console.error("SpeechSynthesis API is not supported or failed to initialize.", e);
    }


    // Cleanup
    return () => {
      try {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.onvoiceschanged = null;
        }
      } catch (e) {
         console.error("Error cleaning up SpeechSynthesis listener.", e);
      }
    };
  }, []);
  
  // Speech synthesis keep-alive for browsers that disconnect after inactivity (e.g., Chrome)
  useEffect(() => {
    let keepAliveInterval: ReturnType<typeof setInterval>;
    if ('speechSynthesis' in window) {
        keepAliveInterval = setInterval(() => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.pause();
                window.speechSynthesis.resume();
            }
        }, 10000); // every 10 seconds
    }
    
    return () => {
        if (keepAliveInterval) {
            clearInterval(keepAliveInterval);
        }
    };
  }, []);

  useEffect(() => {
    setVisibleOptions(currentQuestion.options);
    setTimeLeft(settings.timerDuration);
    setOptionsToRemove([]);
    audioService.play('newQuestion');
     // Stop any speaking from the previous question
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch (e) {
        console.error("Error stopping speech on new question.", e);
    }
  }, [currentQuestion, settings.timerDuration, audioService]);

  // General cleanup effect for unmounting
  useEffect(() => {
    return () => {
      try {
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      } catch (e) {
        console.error("Error stopping speech on component unmount.", e);
      }
    };
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (settings.timerDuration > 0 && !isAnswered && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prevTime => prevTime - 1);
      }, 1000);
      
      if(timeLeft <= 10 && timeLeft > 0) {
        audioService.play('timer');
      }

    } else if (timeLeft === 0 && settings.timerDuration > 0) {
      try {
        if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      } catch (e) { console.error(e); }
      setAnnouncement('انتهى الوقت!');
      audioService.stop('timer');
      audioService.play('wrong');
      setTimeout(() => onGameEnd(currentGameState.guaranteedScore), 1500);
    }
    return () => clearInterval(timer);
  }, [settings.timerDuration, isAnswered, timeLeft, onGameEnd, currentGameState.guaranteedScore, audioService]);


  const readQuestionAloud = useCallback(() => {
    try {
      if (!('speechSynthesis' in window) || settings.ttsMode === 'off') {
          if (settings.ttsMode !== 'off' && settings.ttsMode !== 'auto') alert('عذراً، متصفحك لا يدعم خاصية قراءة النص.');
          return;
      }

      if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
          return;
      }

      if (!arabicVoice) {
          console.warn('لم يتم العثور على صوت عربي مثبت. قد تكون جودة القراءة رديئة.');
      }

      const optionLetterToWord: { [key: string]: string } = {
          'A': 'ألف',
          'B': 'باء',
          'C': 'جيم',
          'D': 'دال',
      };

      const questionText = currentQuestion.question;
      const optionsToRead = visibleOptions || currentQuestion.options;
      const optionsText = Object.entries(optionsToRead)
          .map(([key, value]) => `الخيار ${optionLetterToWord[key] || key}. ${value}`)
          .join('. ');

      const fullText = `السؤال هو: ${questionText}. ${optionsText}`;

      const utterance = new SpeechSynthesisUtterance(fullText);
      
      if (arabicVoice) {
          utterance.voice = arabicVoice;
      }
      
      utterance.lang = 'ar-SA';
      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
          console.error('An error occurred during speech synthesis:', event.error);
          setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("SpeechSynthesis API failed to execute.", e);
      setIsSpeaking(false);
    }
  }, [currentQuestion, visibleOptions, arabicVoice, settings.ttsMode]);

  // Effect for automatic text-to-speech
  useEffect(() => {
    if (settings.ttsMode === 'auto') {
        // A small delay to allow the question animation to start
        const autoReadTimeout = setTimeout(() => {
            try {
               // Ensure no speech is running before starting a new one
              if (window.speechSynthesis && window.speechSynthesis.speaking) {
                  window.speechSynthesis.cancel();
              }
              readQuestionAloud();
            } catch(e) {
              console.error("Auto TTS failed.", e);
            }
        }, 800); // 800ms delay to sync with animations

        return () => clearTimeout(autoReadTimeout);
    }
  }, [currentQuestion, settings.ttsMode, readQuestionAloud]);


  const handleAnswer = (optionKey: string) => {
    if (isAnswered) return;
    
    audioService.stop('timer');

    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch(e) { console.error(e); }

    setSelectedAnswer(optionKey);
    setIsAnswered(true);

    setTimeout(() => {
      if (optionKey === currentQuestion.answer) {
        // Correct Answer
        setAnnouncement('إجابة صحيحة!');
        audioService.play('correct');
        const newIndex = currentGameState.currentQuestionIndex + 1;
        const newScore = PRIZE_LEVELS[currentGameState.currentQuestionIndex];
        
        let newGuaranteedScore = currentGameState.guaranteedScore;
        if(GUARANTEED_LEVELS.includes(currentGameState.currentQuestionIndex)) {
            newGuaranteedScore = newScore;
        }

        if (newIndex >= currentGameState.questions.length) {
          onGameEnd(PRIZE_LEVELS[PRIZE_LEVELS.length - 1]);
        } else {
          setCurrentGameState(prevState => ({
            ...prevState,
            currentQuestionIndex: newIndex,
            score: newScore,
            guaranteedScore: newGuaranteedScore,
          }));
          setSelectedAnswer(null);
          setIsAnswered(false);
          setAnnouncement('');
        }
      } else {
        // Wrong Answer
        const correctAnswerText = currentQuestion.options[currentQuestion.answer];
        setAnnouncement(`إجابة خاطئة. الإجابة الصحيحة هي: ${correctAnswerText}`);
        audioService.play('wrong');
        setTimeout(() => onGameEnd(currentGameState.guaranteedScore), 1500);
      }
    }, 2000); // Wait for animation
  };

  const useLifeline = useCallback((lifeline: keyof Lifelines) => {
    if (!currentGameState.lifelines[lifeline] || isAnswered || activatingLifeline) return;
    
    try {
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    } catch(e) { console.error(e); }

    setActivatingLifeline(lifeline);

    if (lifeline === 'fiftyFifty') {
        audioService.play('fiftyFifty');
        const incorrectOptions = Object.keys(visibleOptions || currentQuestion.options).filter(key => key !== currentQuestion.answer);
        const toRemove = incorrectOptions.sort(() => 0.5 - Math.random()).slice(0, 2);
        
        setOptionsToRemove(toRemove); // Trigger animation class

        setTimeout(() => {
            setVisibleOptions(prevOptions => {
                if (!prevOptions) return null;
                const newOptions = { ...prevOptions };
                toRemove.forEach(key => delete newOptions[key]);
                return newOptions;
            });
        }, 500); // Animation duration
    } else if (lifeline === 'askAudience') {
        audioService.play('askAudience');
        setShowAudiencePoll(true);
    } else if (lifeline === 'phoneFriend') {
        audioService.play('phoneFriend');
        setShowPhoneFriend(true);
    }

    setTimeout(() => {
        setCurrentGameState(prevState => ({
            ...prevState,
            lifelines: { ...prevState.lifelines, [lifeline]: false },
        }));
        setActivatingLifeline(null);
    }, 600);
  }, [currentGameState, isAnswered, activatingLifeline, currentQuestion, visibleOptions, audioService]);

  const getOptionClass = (optionKey: string) => {
    if (optionsToRemove.includes(optionKey)) {
        return 'animate-fade-out-shrink';
    }
    if (!isAnswered) {
      return 'bg-slate-700 hover:bg-slate-600';
    }
    if (optionKey === currentQuestion.answer) {
      return 'bg-emerald-600 animate-pulse';
    }
    if (optionKey === selectedAnswer && optionKey !== currentQuestion.answer) {
      return 'bg-red-600 animate-shake';
    }
    return 'bg-slate-700 opacity-50 cursor-not-allowed';
  };

  return (
    <div className="flex flex-col-reverse lg:flex-row gap-4 h-full min-h-[600px] text-white">
      {/* Accessibility Announcement */}
      <div className="sr-only" aria-live="assertive">{announcement}</div>

      {/* Main Game Area */}
      <div className="flex-grow flex flex-col justify-between p-4 sm:p-6 bg-slate-800/50 rounded-lg">
        {/* Top bar: Lifelines and Timer */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2 sm:gap-4">
            <LifelineButton type="fiftyFifty" used={!currentGameState.lifelines.fiftyFifty} onClick={() => useLifeline('fiftyFifty')} isActivating={activatingLifeline === 'fiftyFifty'} />
            <LifelineButton type="phoneFriend" used={!currentGameState.lifelines.phoneFriend} onClick={() => useLifeline('phoneFriend')} isActivating={activatingLifeline === 'phoneFriend'} />
            <LifelineButton type="askAudience" used={!currentGameState.lifelines.askAudience} onClick={() => useLifeline('askAudience')} isActivating={activatingLifeline === 'askAudience'} />
          </div>
          {settings.timerDuration > 0 && (
            <div className={`w-20 h-20 flex items-center justify-center rounded-full text-4xl font-bold border-4 ${timeLeft <= 10 ? 'border-red-500 text-red-500 animate-pulse' : 'border-amber-400 text-amber-400'}`}>
              {timeLeft}
            </div>
          )}
        </div>

        {/* Question */}
        <div key={`question-${currentGameState.currentQuestionIndex}`} className="relative bg-slate-900/70 text-center p-4 sm:p-6 rounded-lg mb-4 min-h-[120px] flex items-center justify-center animate-slide-in-down">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold px-10">
            {currentQuestion.question}
          </h2>
          {settings.ttsMode !== 'off' && (
            <button 
                onClick={readQuestionAloud}
                className={`absolute top-2 left-2 p-2 rounded-full text-slate-300 hover:bg-slate-700/50 transition-colors ${isSpeaking ? 'text-amber-400 animate-pulse' : ''}`}
                aria-label={isSpeaking ? "إيقاف القراءة" : "قراءة السؤال والخيارات"}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
            </button>
          )}
        </div>

        {/* Options */}
        <div key={`options-${currentGameState.currentQuestionIndex}`} className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {visibleOptions && Object.entries(visibleOptions).map(([key, value], index) => (
            <button
              key={key}
              onClick={() => handleAnswer(key)}
              disabled={isAnswered || optionsToRemove.includes(key)}
              className={`p-4 rounded-lg text-lg font-semibold transition-all duration-300 flex items-center animate-slide-in-up ${getOptionClass(key)}`}
              style={{ animationDelay: `${200 + index * 100}ms`, animationFillMode: 'backwards' }}
            >
              <span className="font-bold text-amber-400 ml-2">{key}:</span> 
              <span className="flex-grow text-right">{value}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prize Ladder */}
      <div className="w-full lg:w-64 xl:w-72 flex-shrink-0">
        <PrizeLadder currentQuestionIndex={currentGameState.currentQuestionIndex} />
      </div>
      
      {/* Modals */}
      {showAudiencePoll && <AudiencePollModal question={currentQuestion} onClose={() => setShowAudiencePoll(false)} />}
      {showPhoneFriend && <PhoneFriendModal question={currentQuestion} onClose={() => setShowPhoneFriend(false)} />}
    </div>
  );
};

export default GameScreen;