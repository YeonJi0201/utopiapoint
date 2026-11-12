// Web Audio API synthesizer for magical sound effects without external audio files

class MagicAudioPlayer {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Sparkling celestial arpeggio for point awards
  playAwardSound(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const startTime = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.06);

      gain.gain.setValueAtTime(0, startTime + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.12, startTime + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + idx * 0.06 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.06);
      osc.stop(startTime + idx * 0.06 + 0.45);
    });
  }

  // Somber low tone for point deductions
  playDeductSound(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(146.83, startTime); // D3
    osc.frequency.exponentialRampToValueAtTime(98.0, startTime + 0.5); // G2

    gain.gain.setValueAtTime(0.15, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

    // Filter to soften the sawtooth
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(450, startTime);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.6);
  }

  // --- click: a wand flicked through the air ---------------------------------

  private noiseBuffer: AudioBuffer | null = null;

  private getNoise(ctx: AudioContext): AudioBuffer {
    if (!this.noiseBuffer) {
      const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.5), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      this.noiseBuffer = buf;
    }
    return this.noiseBuffer;
  }

  // Click: a quick wand swish (air rushing past, rising in pitch) that ends
  // in a small spark of magic.
  playGemClink(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;
    const t = ctx.currentTime;

    // the swish: noise through a band-pass that sweeps upward as the wand moves
    const air = ctx.createBufferSource();
    air.buffer = this.getNoise(ctx);
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.Q.value = 3.2;
    band.frequency.setValueAtTime(700, t);
    band.frequency.exponentialRampToValueAtTime(4200, t + 0.16);
    const swish = ctx.createGain();
    swish.gain.setValueAtTime(0.0001, t);
    swish.gain.exponentialRampToValueAtTime(0.45, t + 0.07);
    swish.gain.exponentialRampToValueAtTime(0.0008, t + 0.2);
    air.connect(band).connect(swish).connect(ctx.destination);
    air.start(t);
    air.stop(t + 0.22);

    // the spark: two tiny, bright chimes as the tip flashes (pitch varies a little)
    const base = 1568 * Math.pow(2, (Math.floor(Math.random() * 3) * 2) / 12); // G6, A6 or B6
    [
      { f: base, at: 0.13, vol: 0.06 },
      { f: base * 1.5, at: 0.17, vol: 0.04 },
    ].forEach(({ f, at, vol }) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t + at);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t + at);
      g.gain.linearRampToValueAtTime(vol, t + at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0008, t + at + 0.22);
      osc.connect(g).connect(ctx.destination);
      osc.start(t + at);
      osc.stop(t + at + 0.24);
    });
  }

  // Triumphant Fanfare for House Cup winner announcement
  playFanfare(): void {
    if (!this.enabled) return;
    const ctx = this.getContext();
    if (!ctx) return;

    const chords = [
      [523.25, 659.25, 783.99], // C
      [587.33, 739.99, 880.00], // D
      [659.25, 830.61, 987.77], // E
      [783.99, 1046.50, 1318.51], // High G chord
    ];
    const startTime = ctx.currentTime;

    chords.forEach((chord, chordIdx) => {
      const time = startTime + chordIdx * 0.18;
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = chordIdx === 3 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + (chordIdx === 3 ? 0.9 : 0.22));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + (chordIdx === 3 ? 0.9 : 0.22));
      });
    });
  }
}

export const magicAudio = new MagicAudioPlayer();
