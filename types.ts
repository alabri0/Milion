

export type Category = 'general' | 'history' | 'science' | 'geography' | 'art-literature' | 'sports' | 'islamic';

export interface Question {
  id: number;
  question: string;
  options: { [key: string]: string };
  answer: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: Category;
}

export interface Lifelines {
  fiftyFifty: boolean;
  phoneFriend: boolean;
  askAudience: boolean;
}

export interface GameState {
  currentQuestionIndex: number;
  score: number;
  lifelines: Lifelines;
  guaranteedScore: number;
  questions: Question[];
}

export enum GameScreen {
    Home,
    Game,
    End,
    Settings,
    Leaderboard,
}

export interface SettingsState {
    timerDuration: number;
    difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
    backgroundMusicEnabled: boolean;
    soundEffectsEnabled: boolean;
    categories: Category[];
    ttsMode: 'off' | 'manual' | 'auto';
}

export interface ScoreEntry {
    name: string;
    score: number;
}