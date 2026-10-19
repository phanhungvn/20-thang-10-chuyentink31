// Web Audio API Synthesizer - 100% self-contained, 0 external audio files needed
class SoundService {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private bgmOscillators: { stop: () => void } | null = null;
  public bgmPlaying: boolean = false;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public toggleSound(val?: boolean): boolean {
    this.enabled = val !== undefined ? val : !this.enabled;
    if (!this.enabled && this.bgmPlaying) {
      this.stopBGM();
    }
    return this.enabled;
  }

  // Sound 1: Crystal chime for swiping / changing photo
  public playChime(freqMultiplier: number = 1.0) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const freq = baseFreqs[Math.floor(Math.random() * baseFreqs.length)] * freqMultiplier;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio context may be restricted before user gesture
    }
  }

  // Sound 2: Wind / sword whoosh for swift hand movements
  public playWhoosh() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.25;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(2400, now + 0.12);
      filter.frequency.exponentialRampToValueAtTime(400, now + 0.25);
      filter.Q.value = 3;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 0.25);
    } catch {
      // safe fallback
    }
  }

  // Sound 3: Resonance energy hum when Fist forms Shield Orb
  public playOrbHum() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(90, now);
      osc1.frequency.exponentialRampToValueAtTime(160, now + 0.8);
      osc2.frequency.setValueAtTime(135, now);
      osc2.frequency.exponentialRampToValueAtTime(240, now + 0.8);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.9);
      osc2.stop(now + 0.9);
    } catch {
      // safe fallback
    }
  }

  // Sound 4: Grand celebration fanfare when 20/10 Greeting Card opens
  public playCelebrationFanfare() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      // Arpeggio notes: C4, E4, G4, C5, E5, G5, C6
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteTime = now + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.07, noteTime);
        const duration = idx === notes.length - 1 ? 1.6 : 0.6;
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(noteTime);
        osc.stop(noteTime + duration);
      });
    } catch {
      // safe fallback
    }
  }

  // Toggle ambient gentle celestial soundtrack
  public toggleBGM(): boolean {
    if (this.bgmPlaying) {
      this.stopBGM();
      return false;
    } else {
      this.startBGM();
      return true;
    }
  }

  public startBGM() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      this.stopBGM();

      this.bgmPlaying = true;
      const chords = [
        [261.63, 329.63, 392.0, 493.88], // Cmaj7
        [220.0, 261.63, 329.63, 392.0],  // Am7
        [174.61, 220.0, 261.63, 329.63], // Fmaj7
        [196.0, 246.94, 293.66, 392.0],  // G
      ];

      let chordIdx = 0;
      const interval = setInterval(() => {
        if (!this.bgmPlaying || !this.ctx || !this.enabled) {
          clearInterval(interval);
          return;
        }

        const chord = chords[chordIdx % chords.length];
        chordIdx++;
        const now = this.ctx.currentTime;

        chord.forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq * 0.5, now); // Warm low octave

          const noteDelay = now + i * 0.15;
          gain.gain.setValueAtTime(0.001, noteDelay);
          gain.gain.linearRampToValueAtTime(0.02, noteDelay + 0.8);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteDelay + 4.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(noteDelay);
          osc.stop(noteDelay + 4.6);
        });
      }, 5000);

      this.bgmOscillators = {
        stop: () => {
          clearInterval(interval);
          this.bgmPlaying = false;
        },
      };
    } catch {
      this.bgmPlaying = false;
    }
  }

  public stopBGM() {
    if (this.bgmOscillators) {
      this.bgmOscillators.stop();
      this.bgmOscillators = null;
    }
    this.bgmPlaying = false;
  }
}

export const sounds = new SoundService();
