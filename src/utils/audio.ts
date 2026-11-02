// Procedural Web Audio API sound generator for FICSIT Pioneer

class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private ambientOscillators: OscillatorNode[] = [];

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.ambientGain) {
      this.ambientGain.gain.setValueAtTime(muted ? 0 : 0.05, this.ctx?.currentTime || 0);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Metallic pick / hammer extraction sound
  public playMineClick() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Metallic ping
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600 + Math.random() * 80, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.11);
  }

  // Pneumatic craft press thump
  public playCraftPress() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Low punch
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.15);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);

    // Mechanical hiss
    const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.08, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseBuffer.length; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1800;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.04, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);

    whiteNoise.start(now);
  }

  // Power breaker trip buzzing & alarm tone
  public playPowerTrip() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Electrical arc buzz
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(60, now);
    osc.frequency.linearRampToValueAtTime(90, now + 0.1);
    osc.frequency.linearRampToValueAtTime(50, now + 0.3);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.45);

    // High alarm double beep
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const beep = this.ctx.createOscillator();
      const bGain = this.ctx.createGain();
      beep.type = 'sine';
      beep.frequency.setValueAtTime(880, t);
      beep.frequency.setValueAtTime(660, t + 0.12);
      bGain.gain.setValueAtTime(0.15, t);
      bGain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      beep.connect(bGain);
      bGain.connect(this.ctx.destination);
      beep.start(t);
      beep.stop(t + 0.26);
    }, 200);
  }

  // Heavy breaker switch clunk reset
  public playBreakerReset() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Heavy switch clank
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.2);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.25);

    // Power spool-up tone
    const hum = ctx.createOscillator();
    const humGain = ctx.createGain();
    hum.type = 'sine';
    hum.frequency.setValueAtTime(100, now + 0.15);
    hum.frequency.exponentialRampToValueAtTime(300, now + 0.45);
    humGain.gain.setValueAtTime(0.001, now);
    humGain.gain.setValueAtTime(0.12, now + 0.15);
    humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    hum.connect(humGain);
    humGain.connect(ctx.destination);

    hum.start(now + 0.15);
    hum.stop(now + 0.52);
  }

  // AWESOME Sink ticket print chime
  public playTicketChime() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = now + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.38);
    });
  }

  // Space Elevator launch thruster roar
  public playLaunchRoar() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(50, now);
    osc.frequency.linearRampToValueAtTime(180, now + 1.2);
    osc.frequency.linearRampToValueAtTime(70, now + 2.5);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.3, now + 0.8);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.6);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 2.7);
  }

  // Milestone unlock fanfare
  public playMilestoneFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = now + idx * 0.1;
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + 0.55);
    });
  }

  // Toggle ambient industrial synth drone
  public toggleAmbientMusic(enable: boolean) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (!enable) {
      this.isAmbientPlaying = false;
      this.ambientOscillators.forEach(osc => {
        try {
          osc.stop();
          osc.disconnect();
        } catch (_) {}
      });
      this.ambientOscillators = [];
      return;
    }

    if (this.isAmbientPlaying) return;
    this.isAmbientPlaying = true;

    try {
      const chords = [130.81, 196.0, 261.63]; // C3, G3, C4
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.03, ctx.currentTime);
      masterGain.connect(ctx.destination);
      this.ambientGain = masterGain;

      this.ambientOscillators = chords.map((freq, i) => {
        const osc = ctx.createOscillator();
        osc.type = i === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.connect(masterGain);
        osc.start();
        return osc;
      });
    } catch (_) {}
  }
}

export const audio = new AudioManager();
