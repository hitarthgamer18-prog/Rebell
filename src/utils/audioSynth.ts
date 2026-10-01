/**
 * REBELL Synthesizer & Audio Engine v3.0
 * Multi-flavor click acoustics, dynamic micro-variations, heavy cinematic 5s intro.
 * Masterpiece by VoidRebellion
 */

class RebellAudioEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.35;
  private isMusicPlaying: boolean = false;
  private musicInterval: any = null;
  private masterGain: GainNode | null = null;
  private currentStep: number = 0;
  private clickCounter: number = 0;

  // Underground cyber scale (D minor pentatonic / Aeolian)
  private readonly scale = [73.42, 87.31, 98.0, 110.0, 130.81, 146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 440.0];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public unlockAudio() {
    const ctx = this.getContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * 5-Second Insane Cinematic Trailer Intro
   * Bass cannon drop, screaming cyberpunk synthesizer riser, arpeggio vortex, and final thunderclap impact!
   */
  public playCinematicIntroMusic() {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = ctx.currentTime;

      // 1. Massive 808 Sub Boom (0.0s - 2.8s)
      const subOsc = ctx.createOscillator();
      const subGain = ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(110, now);
      subOsc.frequency.exponentialRampToValueAtTime(26, now + 2.2);
      subGain.gain.setValueAtTime(0.001, now);
      subGain.gain.linearRampToValueAtTime(0.45, now + 0.15);
      subGain.gain.exponentialRampToValueAtTime(0.0001, now + 2.6);
      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(now);
      subOsc.stop(now + 2.7);

      // 2. Screaming Cyberpunk Saw Riser (0.6s - 4.6s)
      const sawOsc = ctx.createOscillator();
      const sawFilter = ctx.createBiquadFilter();
      const sawGain = ctx.createGain();
      sawOsc.type = 'sawtooth';
      sawOsc.frequency.setValueAtTime(65, now + 0.5);
      sawOsc.frequency.exponentialRampToValueAtTime(587.33, now + 4.6);
      sawFilter.type = 'lowpass';
      sawFilter.frequency.setValueAtTime(180, now + 0.5);
      sawFilter.frequency.exponentialRampToValueAtTime(5500, now + 4.6);
      sawFilter.Q.setValueAtTime(6, now + 0.5);
      sawGain.gain.setValueAtTime(0.001, now + 0.5);
      sawGain.gain.linearRampToValueAtTime(0.22, now + 3.8);
      sawGain.gain.exponentialRampToValueAtTime(0.0001, now + 4.8);
      sawOsc.connect(sawFilter);
      sawFilter.connect(sawGain);
      sawGain.connect(this.masterGain);
      sawOsc.start(now + 0.5);
      sawOsc.stop(now + 4.9);

      // 3. Staggered Holographic Synth Flurries (1.5s - 4.4s)
      const flurryNotes = [146.83, 220.0, 293.66, 349.23, 440.0, 523.25, 587.33, 698.46, 880.0];
      flurryNotes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const noteTime = now + 1.2 + idx * 0.19;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        gain.gain.setValueAtTime(0.001, noteTime);
        gain.gain.linearRampToValueAtTime(0.14, noteTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(noteTime);
        osc.stop(noteTime + 0.28);
      });

      // 4. Thunderclap Climax Impact at 4.75s (Warp point)
      const impactTime = now + 4.7;
      const impactOsc = ctx.createOscillator();
      const impactGain = ctx.createGain();
      impactOsc.type = 'sine';
      impactOsc.frequency.setValueAtTime(160, impactTime);
      impactOsc.frequency.exponentialRampToValueAtTime(24, impactTime + 0.8);
      impactGain.gain.setValueAtTime(0.4, impactTime);
      impactGain.gain.exponentialRampToValueAtTime(0.0001, impactTime + 1.4);
      impactOsc.connect(impactGain);
      impactGain.connect(this.masterGain);
      impactOsc.start(impactTime);
      impactOsc.stop(impactTime + 1.5);
    } catch {}
  }

  /**
   * Dynamic Click Synthesizer: EVERY click feels distinctly different!
   */
  public playClick(flavor?: 'laser' | 'snap' | 'bass' | 'zap' | 'warp' | 'pop' | 'spark' | 'glitch') {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    this.clickCounter++;
    const flavors = ['laser', 'snap', 'bass', 'zap', 'warp', 'pop', 'spark', 'glitch'];
    const chosenFlavor = flavor || flavors[this.clickCounter % flavors.length];

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      switch (chosenFlavor) {
        case 'laser':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);
          gain.gain.setValueAtTime(0.11, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.065);
          break;

        case 'snap':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(950, now);
          osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
          gain.gain.setValueAtTime(0.13, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          break;

        case 'bass':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
          break;

        case 'zap':
          osc.type = 'sawtooth';
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(2400, now);
          osc.frequency.setValueAtTime(600, now);
          osc.frequency.exponentialRampToValueAtTime(1800, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 0.06);
          return;

        case 'warp':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.035);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.07);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
          break;

        case 'pop':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(750, now + 0.04);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
          break;

        case 'spark':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1600, now);
          osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
          break;

        case 'glitch':
        default:
          osc.type = 'square';
          osc.frequency.setValueAtTime(700, now);
          osc.frequency.setValueAtTime(1100, now + 0.02);
          osc.frequency.setValueAtTime(450, now + 0.04);
          gain.gain.setValueAtTime(0.07, now);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
          break;
      }

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.1);
    } catch {}
  }

  /**
   * Reactive touch spark sound based on screen position
   */
  public playTouchSpark(xRatio: number = 0.5) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const freq = 380 + xRatio * 650;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.7, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.07, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.07);
    } catch {}
  }

  public playSendChirp() {
    this.playClick('laser');
  }

  public playReceiveChirp() {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain || this.isMuted) return;

    try {
      const now = ctx.currentTime;
      [880, 1174, 1480, 1760].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.04);

        gain.gain.setValueAtTime(0.07, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.04 + 0.07);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.08);
      });
    } catch {}
  }

  public startMusic() {
    if (this.isMusicPlaying) return;
    const ctx = this.getContext();
    if (!ctx) return;

    this.isMusicPlaying = true;
    this.currentStep = 0;

    const bassline = [0, 0, 2, 0, 3, 0, 4, 3];
    const melody = [5, 7, 8, 10, 8, 7, 6, 8, 11, 8, 7, 5, 7, 8, 10, 12];
    const stepDuration = 170;

    this.musicInterval = setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted) return;

      const step = this.currentStep;

      // Bass pulse
      if (step % 4 === 0) {
        const bassFreq = this.scale[bassline[(step / 4) % bassline.length]] || 73.42;
        this.playSynthNote(bassFreq * 0.5, 0.45, 'sawtooth', 0.18, 480);
      }

      // Arpeggio melody
      if (step % 2 === 0) {
        const leadFreq = this.scale[melody[(step / 2) % melody.length]] || 220;
        this.playSynthNote(leadFreq, 0.13, 'triangle', 0.11, 1900);
      }

      // Punchy sub kick
      if (step % 8 === 0 || step % 8 === 4) {
        this.playSubKick();
      }

      this.currentStep = (this.currentStep + 1) % 64;
    }, stepDuration);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public toggleMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return this.isMusicPlaying;
  }

  private playSynthNote(freq: number, duration: number, type: OscillatorType, gainVol: number, cutoff: number) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(cutoff, ctx.currentTime);

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(gainVol, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  private playSubKick() {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.frequency.setValueAtTime(130, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(28, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.24, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);
    } catch {}
  }
}

export const audioSynth = new RebellAudioEngine();
