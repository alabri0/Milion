// services/audioService.ts
export type SoundEffect = 'background' | 'correct' | 'wrong' | 'click' | 'timer' | 'win' | 'newQuestion' | 'fiftyFifty' | 'phoneFriend' | 'askAudience' | 'lose';

const soundFiles: Record<SoundEffect, string> = {
    background: '/audio/background.mp3',
    correct: '/audio/correct.mp3',
    wrong: '/audio/wrong.mp3',
    click: '/audio/click.mp3',
    timer: '/audio/timer.mp3',
    win: '/audio/win.mp3',
    newQuestion: '/audio/newQuestion.mp3',
    fiftyFifty: '/audio/fiftyFifty.mp3',
    phoneFriend: '/audio/phoneFriend.mp3',
    askAudience: '/audio/askAudience.mp3',
    lose: '/audio/lose.mp3',
};

// Sounds that are long-running or should not have multiple instances playing at once
const singletonSounds: Set<SoundEffect> = new Set(['background', 'timer']);

export class AudioService {
  private audioContext: AudioContext | null = null;
  private soundBuffers: Map<SoundEffect, AudioBuffer> = new Map();
  private playingSources: Map<SoundEffect, AudioBufferSourceNode[]> = new Map();
  private isBackgroundMusicMuted: boolean = false;
  private areSoundEffectsMuted: boolean = false;
  private isLoaded: boolean = false;
  private isLoading: boolean = false;
  private pendingBackgroundMusic: boolean = false;

  private async initAndResumeAudioContext() {
    if (this.audioContext && this.audioContext.state === 'running') {
        return;
    }
    
    if (!this.audioContext) {
        try {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser", e);
            return;
        }
    }

    if (this.audioContext.state === 'suspended') {
        try {
            await this.audioContext.resume();
        } catch (e) {
            console.error("Could not resume audio context", e);
            return;
        }
    }
    
    if (this.audioContext.state === 'running' && !this.isLoaded && !this.isLoading) {
        await this.loadAllSounds();
    }
    
    if (this.audioContext.state === 'running' && this.pendingBackgroundMusic && !this.isBackgroundMusicMuted) {
        if (!this.isPlaying('background')) {
            this.playSound('background', true);
        }
        this.pendingBackgroundMusic = false;
    }
  }

  private async loadSound(name: SoundEffect, url: string): Promise<void> {
    if (!this.audioContext) return;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${url} (status: ${response.status})`);
      }
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundBuffers.set(name, audioBuffer);
    } catch (e) {
      console.error(`Error loading sound ${name}:`, e);
    }
  }

  public async loadAllSounds(): Promise<void> {
    if (this.isLoaded || this.isLoading || !this.audioContext) return;
    this.isLoading = true;
    const promises: Promise<void>[] = [];
    for (const [name, url] of Object.entries(soundFiles)) {
      promises.push(this.loadSound(name as SoundEffect, url));
    }
    await Promise.all(promises);
    this.isLoaded = true;
    this.isLoading = false;
    console.log("All sounds loaded.");
  }

  private isPlaying(name: SoundEffect): boolean {
    return this.playingSources.has(name) && this.playingSources.get(name)!.length > 0;
  }
  
  private playSound(name: SoundEffect, loop: boolean = false): void {
    if (!this.audioContext || !this.isLoaded || this.audioContext.state !== 'running') {
      return;
    }

    if (name === 'background' && this.isBackgroundMusicMuted) return;
    if (name !== 'background' && this.areSoundEffectsMuted) return;

    const buffer = this.soundBuffers.get(name);
    if (!buffer) {
      console.warn(`Sound ${name} not loaded.`);
      return;
    }

    if (singletonSounds.has(name)) {
      this.stop(name);
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.loop = loop;
    source.connect(this.audioContext.destination);
    source.start(0);
    
    source.onended = () => {
        if (this.playingSources.has(name)) {
            const sources = this.playingSources.get(name)!.filter(s => s !== source);
            if (sources.length > 0) {
                this.playingSources.set(name, sources);
            } else {
                this.playingSources.delete(name);
            }
        }
    };

    if (!this.playingSources.has(name)) {
        this.playingSources.set(name, []);
    }
    this.playingSources.get(name)!.push(source);
  }

  public play(name: SoundEffect, loop: boolean = false): void {
    if (name === 'background') {
      this.pendingBackgroundMusic = true;
    }

    this.initAndResumeAudioContext().then(() => {
        if (this.audioContext?.state === 'running' && name !== 'background') {
            this.playSound(name, loop);
        }
    });
  }
  
  public playClick(): void {
    this.play('click');
  }

  public stop(name: SoundEffect): void {
    const sources = this.playingSources.get(name);
    if (sources) {
      sources.forEach(source => {
        try { source.stop(); } catch (e) { /* Can error if already stopped, ignore */ }
      });
      this.playingSources.delete(name);
    }
  }

  public stopAll(): void {
    this.pendingBackgroundMusic = false;
    this.playingSources.forEach((sources, name) => {
      this.stop(name as SoundEffect);
    });
    this.playingSources.clear();
  }
  
  public setBackgroundMusicMuted(muted: boolean): void {
    this.isBackgroundMusicMuted = muted;
    if (muted) {
      this.stop('background');
    } else if (this.pendingBackgroundMusic) {
        this.initAndResumeAudioContext();
    }
  }

  public setSoundEffectsMuted(muted: boolean): void {
    this.areSoundEffectsMuted = muted;
    if (muted) {
        this.playingSources.forEach((sources, name) => {
          if(name !== 'background') {
            this.stop(name as SoundEffect);
          }
        });
    }
  }
}
