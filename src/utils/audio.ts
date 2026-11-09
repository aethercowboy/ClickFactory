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

  // Festive holiday sleigh bell chime
  public playFicsmasBell() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [1760, 2093, 2637, 3135]; // A6, C7, E7, G7 high chime
    freqs.forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, now + i * 0.04);

      gain.gain.setValueAtTime(0.08, now + i * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.04);
      osc.stop(now + i * 0.04 + 0.36);
    });
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

  // Lizard Doggo affectionate purr & rising happy chirp
  public playDoggoPet() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Warm rising sweet chirp
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(420, now);
    osc1.frequency.exponentialRampToValueAtTime(740, now + 0.18);
    osc1.frequency.exponentialRampToValueAtTime(620, now + 0.28);

    gain1.gain.setValueAtTime(0.01, now);
    gain1.gain.linearRampToValueAtTime(0.12, now + 0.05);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.34);

    // Subtle harmonic trill
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(840, now + 0.04);
    osc2.frequency.exponentialRampToValueAtTime(1260, now + 0.22);

    gain2.gain.setValueAtTime(0.04, now + 0.04);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.04);
    osc2.stop(now + 0.27);
  }

  // Lizard Doggo friendly alien bark/yip
  public playDoggoBark() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Bark 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(540, now);
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.06);
    osc1.frequency.exponentialRampToValueAtTime(420, now + 0.12);

    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.15);

    // Bark 2 (quick bounce)
    setTimeout(() => {
      if (this.isMuted || !this.ctx) return;
      const t = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(620, t);
      osc2.frequency.exponentialRampToValueAtTime(960, t + 0.07);
      osc2.frequency.exponentialRampToValueAtTime(460, t + 0.15);

      gain2.gain.setValueAtTime(0.16, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.18);
    }, 110);
  }

  // Doggo found a treasure chime
  public playDoggoItemFound() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [587.33, 739.99, 880.0, 1174.66]; // D5, F#5, A5, D6
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.07;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.1, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
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

  // Achievement unlock sparkling fanfare
  public playAchievementFanfare() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Triumphant corporate jingle: C5 -> E5 -> G5 -> B5 -> C6 -> E6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5, 1318.51];
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const startT = now + idx * 0.08;

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0.18, startT);
      gain.gain.exponentialRampToValueAtTime(0.001, startT + (idx === freqs.length - 1 ? 0.9 : 0.45));

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startT);
      osc.stop(startT + (idx === freqs.length - 1 ? 0.95 : 0.5));
    });
  }

  // Biome deployment pneumatic sound
  public playBiomeSwitch() {
    if (this.isMuted) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Sub bass deployment thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.3);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.38);

    // High sweep frequency
    const sweep = ctx.createOscillator();
    const sGain = ctx.createGain();
    sweep.type = 'triangle';
    sweep.frequency.setValueAtTime(350, now + 0.05);
    sweep.frequency.exponentialRampToValueAtTime(700, now + 0.28);
    sGain.gain.setValueAtTime(0.001, now);
    sGain.gain.setValueAtTime(0.1, now + 0.05);
    sGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    sweep.connect(sGain);
    sGain.connect(ctx.destination);
    sweep.start(now + 0.05);
    sweep.stop(now + 0.38);
  }

  // Toggle ambient industrial synth drone with biome-specific chords
  public toggleAmbientMusic(enable: boolean, customChords?: number[]) {
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

    if (this.isAmbientPlaying) {
      if (customChords) {
        this.updateAmbientChords(customChords);
      }
      return;
    }
    this.isAmbientPlaying = true;

    try {
      const chords = customChords || [130.81, 196.0, 261.63]; // Default Grass Fields
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

  // Live-transition ambient drone frequencies when switching biomes
  public updateAmbientChords(chords: number[]) {
    if (!this.isAmbientPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;
    chords.forEach((freq, idx) => {
      if (this.ambientOscillators[idx]) {
        try {
          this.ambientOscillators[idx].frequency.exponentialRampToValueAtTime(freq, now + 1.2);
        } catch (_) {
          this.ambientOscillators[idx].frequency.setValueAtTime(freq, now);
        }
      }
    });
  }

  // =========================================================================
  // FICSIT BOOMBOX CASSETTE PLAYER (Web Audio Procedural Music Synthesizer)
  // =========================================================================
  private boomboxTimer: any = null;
  private isBoomboxRunning: boolean = false;
  private currentTrackId: string = 'synthwave';
  private boomboxGain: GainNode | null = null;
  private boomboxStep: number = 0;
  private boomboxVolume: number = 0.22;
  private boomboxListeners: Set<() => void> = new Set();

  public getBoomboxTracks() {
    return [
      {
        id: 'synthwave',
        title: 'MASSAGE-2(A-B)b Synthwave',
        genre: '80s Electro Synth',
        bpm: 120,
        description: 'Bouncy bassline with shimmering arpeggiated leads for factory cruising.',
      },
      {
        id: 'conveyor_boogie',
        title: 'Conveyor Belt Boogie',
        genre: 'Industrial Funk',
        bpm: 126,
        description: 'Upbeat rhythm with punchy staccato bass and energetic high ticks.',
      },
      {
        id: 'deep_space',
        title: 'Deep Space Elevator',
        genre: 'Ambient Sci-Fi',
        bpm: 90,
        description: 'Ethereal sub-bass and celestial bells echoing up the space elevator tether.',
      },
      {
        id: 'pioneer_lofi',
        title: 'Pioneer Lo-Fi Chill',
        genre: 'Lo-Fi Chillout',
        bpm: 96,
        description: 'Relaxing mellow chords with warm analog filters to wind down the shift.',
      },
      {
        id: 'ficsmas_jingle',
        title: 'FICSIT Holiday Jingle Bells',
        genre: 'Festive Industrial Synth',
        bpm: 130,
        description: 'Chiming bells and punchy holiday synth melody bringing corporate festive cheer.',
      },
    ];
  }

  public subscribeBoombox(listener: () => void): () => void {
    this.boomboxListeners.add(listener);
    return () => {
      this.boomboxListeners.delete(listener);
    };
  }

  private notifyBoombox() {
    this.boomboxListeners.forEach(cb => cb());
  }

  public isBoomboxPlaying(): boolean {
    return this.isBoomboxRunning;
  }

  public getCurrentBoomboxTrack(): string {
    return this.currentTrackId;
  }

  public getBoomboxVolume(): number {
    return this.boomboxVolume;
  }

  public setBoomboxVolume(val: number) {
    this.boomboxVolume = Math.max(0, Math.min(1, val));
    if (this.boomboxGain && this.ctx) {
      this.boomboxGain.gain.setValueAtTime(this.isMuted ? 0 : this.boomboxVolume, this.ctx.currentTime);
    }
    this.notifyBoombox();
  }

  public playBoombox(trackId?: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    if (trackId && trackId !== this.currentTrackId) {
      this.currentTrackId = trackId;
      this.boomboxStep = 0;
    }

    if (!this.boomboxGain) {
      this.boomboxGain = ctx.createGain();
      this.boomboxGain.gain.setValueAtTime(this.isMuted ? 0 : this.boomboxVolume, ctx.currentTime);
      this.boomboxGain.connect(ctx.destination);
    }

    if (this.isBoomboxRunning) {
      this.notifyBoombox();
      return;
    }

    this.isBoomboxRunning = true;
    this.notifyBoombox();

    const bpm = this.getBoomboxTracks().find(t => t.id === this.currentTrackId)?.bpm || 120;
    const stepIntervalMs = (60 / bpm / 4) * 1000; // 16th notes

    const tick = () => {
      if (!this.isBoomboxRunning) return;
      this.renderBoomboxStep(this.boomboxStep, this.currentTrackId);
      this.boomboxStep = (this.boomboxStep + 1) % 64; // 4-bar loop of 16 steps
      this.boomboxTimer = setTimeout(tick, stepIntervalMs);
    };

    tick();
  }

  public stopBoombox() {
    this.isBoomboxRunning = false;
    if (this.boomboxTimer) {
      clearTimeout(this.boomboxTimer);
      this.boomboxTimer = null;
    }
    this.notifyBoombox();
  }

  public toggleBoombox(trackId?: string) {
    if (this.isBoomboxRunning && (!trackId || trackId === this.currentTrackId)) {
      this.stopBoombox();
    } else {
      this.playBoombox(trackId || this.currentTrackId);
    }
  }

  // Procedural step sequencer per track
  private renderBoomboxStep(step: number, trackId: string) {
    const ctx = this.getContext();
    if (!ctx || this.isMuted || !this.boomboxGain) return;
    const now = ctx.currentTime;

    // Helper: synth note
    const playNote = (freq: number, dur: number, type: OscillatorType, gainAmt: number) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      g.gain.setValueAtTime(gainAmt, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc.connect(g);
      g.connect(this.boomboxGain!);

      osc.start(now);
      osc.stop(now + dur + 0.05);
    };

    // Helper: drum pulse / hi-hat
    const playTick = (isSnare: boolean) => {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = isSnare ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(isSnare ? 220 : 600, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + (isSnare ? 0.08 : 0.03));

      g.gain.setValueAtTime(isSnare ? 0.08 : 0.025, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (isSnare ? 0.08 : 0.03));

      osc.connect(g);
      g.connect(this.boomboxGain!);

      osc.start(now);
      osc.stop(now + 0.1);
    };

    if (trackId === 'synthwave') {
      // 120 BPM Synthwave: D minor (D, F, G, A, C)
      const bassNotes = [146.83, 146.83, 174.61, 146.83, 196.0, 146.83, 220.0, 196.0]; // D3, F3, G3, A3
      const arpNotes = [293.66, 349.23, 440.0, 523.25, 587.33, 523.25, 440.0, 349.23];

      // Bassline on 8th notes
      if (step % 2 === 0) {
        const bFreq = bassNotes[(Math.floor(step / 2)) % bassNotes.length];
        playNote(bFreq, 0.14, 'sawtooth', 0.12);
      }

      // Melody arp on 16th notes
      if (step % 2 === 1) {
        const mFreq = arpNotes[step % arpNotes.length];
        playNote(mFreq, 0.12, 'square', 0.04);
      }

      // Beat: Kick on 0, 8; Snare on 4, 12; Hi-hat on every 2
      const stepInBar = step % 16;
      if (stepInBar === 0 || stepInBar === 8) {
        playTick(false);
      } else if (stepInBar === 4 || stepInBar === 12) {
        playTick(true);
      } else if (stepInBar % 2 === 0) {
        playTick(false);
      }
    } else if (trackId === 'conveyor_boogie') {
      // 126 BPM Conveyor Belt Boogie: Funk in F (F2, G#2, Bb2, C3)
      const fBass = [87.31, 87.31, 103.83, 116.54, 130.81, 116.54, 103.83, 87.31];
      if (step % 2 === 0) {
        const freq = fBass[(Math.floor(step / 2)) % fBass.length];
        playNote(freq, 0.1, 'triangle', 0.2);
      }
      if (step % 4 === 2) {
        playNote(349.23, 0.08, 'sawtooth', 0.05); // High F4 stab
      }
      if (step % 4 === 0) {
        playTick(false);
      } else if (step % 8 === 4) {
        playTick(true);
      }
    } else if (trackId === 'deep_space') {
      // 90 BPM Space Elevator: Atmospheric A minor ambient chords
      const padChords = [
        [220.0, 261.63, 329.63], // Am
        [174.61, 220.0, 261.63], // Fmaj
        [196.0, 246.94, 293.66], // Gmaj
        [164.81, 196.0, 246.94], // Em
      ];
      if (step % 16 === 0) {
        const chordIdx = Math.floor(step / 16) % padChords.length;
        padChords[chordIdx].forEach(f => {
          playNote(f, 1.8, 'sine', 0.06);
        });
      }
      // Sparkling bell chimes
      if (step % 8 === 4) {
        const bells = [880.0, 1046.5, 1318.51, 1567.98];
        const bellFreq = bells[(step / 8) % bells.length];
        playNote(bellFreq, 0.7, 'triangle', 0.04);
      }
    } else if (trackId === 'pioneer_lofi') {
      // 96 BPM Pioneer Lo-Fi: Mellow Eb major / C minor pentatonic
      const lofiNotes = [311.13, 392.0, 466.16, 523.25, 622.25];
      if (step % 4 === 0) {
        const note = lofiNotes[(step / 4) % lofiNotes.length];
        playNote(note, 0.4, 'sine', 0.09);
        playNote(note / 2, 0.45, 'triangle', 0.1);
      }
      if (step % 8 === 4) {
        playTick(true); // Soft snare
      }
    } else if (trackId === 'ficsmas_jingle') {
      // 130 BPM FICSIT Holiday Jingle: Jingle bells melody in G/C
      const jingleMelody = [
        329.63, 0, 329.63, 0, 329.63, 0, 0, 0, // Jin-gle bells
        329.63, 0, 329.63, 0, 329.63, 0, 0, 0, // Jin-gle bells
        329.63, 0, 392.0, 0, 261.63, 0, 293.66, 0, // Jin-gle all the
        329.63, 0, 0, 0, 0, 0, 0, 0, // way!
      ];
      const mIdx = step % jingleMelody.length;
      const mFreq = jingleMelody[mIdx];
      if (mFreq > 0) {
        playNote(mFreq, 0.18, 'triangle', 0.12);
        playNote(mFreq * 4, 0.08, 'sine', 0.03); // Sleigh shimmer
      }
      if (step % 2 === 0) {
        playNote(2637, 0.05, 'triangle', 0.03); // E7 silver bells
      }
      if (step % 8 === 0) {
        playTick(false);
      } else if (step % 8 === 4) {
        playTick(true);
      }
    }
  }
}

export const audio = new AudioManager();

