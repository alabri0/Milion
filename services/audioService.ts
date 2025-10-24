// services/audioService.ts
export type SoundEffect = 'background' | 'correct' | 'wrong' | 'click' | 'timer' | 'win' | 'newQuestion' | 'fiftyFifty' | 'phoneFriend' | 'askAudience' | 'lose';

const soundFiles: Record<SoundEffect, string> = {
    background: './audio/background.mp3',
    correct: './audio/correct.mp3',
    wrong: './audio/wrong.mp3',
    click: './audio/click.mp3',
    timer: './audio/timer.mp3',
    win: './audio/win.mp3',
    newQuestion: './audio/newQuestion.mp3',
    fiftyFifty: './audio/fiftyFifty.mp3',
    phoneFriend: './audio/phoneFriend.mp3',
    askAudience: './audio/askAudience.mp3',
    lose: './audio/lose.mp3',
};

// Sounds that are long-running or should not have multiple instances playing at once.
const singleInstanceSounds: SoundEffect[] = ['background', 'timer'];


export class AudioService {
    private sounds: Map<SoundEffect, HTMLAudioElement> = new Map();
    private isBackgroundMusicMuted: boolean = false;
    private isSoundEffectsMuted: boolean = false;
    private isInitialized: boolean = false;

    // This method must be called from a user gesture (e.g., a click event)
    // to unlock the AudioContext in modern browsers.
    public init() {
        if (this.isInitialized) return;
        this.loadAudio();
        this.isInitialized = true;
    }

    private loadAudio() {
        // Pre-load all audio files into Audio elements.
        for (const key in soundFiles) {
            const soundName = key as SoundEffect;
            const audio = new Audio(soundFiles[soundName]);
            audio.preload = 'auto';
            this.sounds.set(soundName, audio);
        }
    }

    public play(soundName: SoundEffect, loop: boolean = false) {
        if (!this.isInitialized) {
            console.warn(`AudioService not initialized. Cannot play ${soundName}.`);
            return;
        }

        const isBackground = soundName === 'background';
        if ((isBackground && this.isBackgroundMusicMuted) || (!isBackground && this.isSoundEffectsMuted)) {
            return;
        }

        const originalSound = this.sounds.get(soundName);
        if (!originalSound) return;

        // For long-running sounds or sounds that need to be controlled (start/stop),
        // we use a single instance.
        if (singleInstanceSounds.includes(soundName)) {
            originalSound.loop = loop;
            originalSound.currentTime = 0;
            originalSound.play().catch(e => console.warn(`Could not play sound ${soundName}:`, e));
        } else {
            // For short, one-shot sound effects, we create a new Audio object on the fly.
            // This allows multiple instances of the same sound to play simultaneously (e.g., rapid clicks)
            // and prevents one sound from cutting off another.
            const soundInstance = new Audio(originalSound.src);
            soundInstance.play().catch(e => console.warn(`Could not play sound effect instance ${soundName}:`, e));
        }
    }
    
    // playClick is the designated function to be called on first user interaction.
    public playClick() {
        this.init(); // Initialize on the first click.
        this.play('click');
    }

    public stop(soundName: SoundEffect) {
        if (!this.isInitialized) return;

        // We can only stop single-instance sounds.
        const sound = this.sounds.get(soundName);
        if (sound && singleInstanceSounds.includes(soundName)) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
    
    public stopAll() {
        this.sounds.forEach((sound, name) => {
             if (singleInstanceSounds.includes(name)) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
    }

    public setBackgroundMusicMuted(muted: boolean) {
        this.isBackgroundMusicMuted = muted;
        if (muted) {
            this.stop('background');
        }
        // The app's main logic should handle re-playing background music if unmuted.
    }

    public setSoundEffectsMuted(muted: boolean) {
        this.isSoundEffectsMuted = muted;
        if (muted) {
            this.stop('timer'); // Stop the timer if all SFX are muted.
        }
    }
}
