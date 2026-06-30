// Web Audio API Synthesizer for 2048 VS Game
let audioCtx: AudioContext | null = null;
let isMuted: boolean = false;

// Initialize AudioContext on first user interaction to satisfy browser policies
function getAudioContext(): AudioContext | null {
  if (isMuted) return null;
  if (!audioCtx) {
    // Standard and vendor-prefixed AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleAudioMute = (muted: boolean) => {
  isMuted = muted;
  if (muted && audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    });
  }
};

// Play a short tile sliding sound
export const playSlideSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'triangle';
  // Slide frequency down to sound like a swipe
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

  gainNode.gain.setValueAtTime(0.08, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.1);
};

// Play a pleasant, rewarding merge sound (higher tile = nicer chord)
export const playMergeSound = (value: number) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Map tile values to notes of a major/pentatonic scale
  let freq1 = 261.63; // C4 default
  let freq2 = 329.63; // E4

  if (value === 4) { freq1 = 293.66; freq2 = 349.23; } // D4, F4
  else if (value === 8) { freq1 = 329.63; freq2 = 392.00; } // E4, G4
  else if (value === 16) { freq1 = 349.23; freq2 = 440.00; } // F4, A4
  else if (value === 32) { freq1 = 392.00; freq2 = 493.88; } // G4, B4
  else if (value === 64) { freq1 = 440.00; freq2 = 523.25; } // A4, C5
  else if (value === 128) { freq1 = 523.25; freq2 = 659.25; } // C5, E5
  else if (value === 256) { freq1 = 587.33; freq2 = 698.46; } // D5, F5
  else if (value === 512) { freq1 = 659.25; freq2 = 783.99; } // E5, G5
  else if (value >= 1024) { freq1 = 783.99; freq2 = 987.77; } // G5, B5

  // Generate oscillator 1 (sine for sweetness)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.setValueAtTime(freq1, now);
  gain1.gain.setValueAtTime(0.07, now);
  gain1.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

  // Generate oscillator 2 (triangle for warmth)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.setValueAtTime(freq2, now);
  gain2.gain.setValueAtTime(0.05, now);
  gain2.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);

  osc1.start(now);
  osc1.stop(now + 0.25);
  osc2.start(now);
  osc2.stop(now + 0.25);
};

// Play a ticking hazard warning count sound (for Survivor Mode danger)
export const playWarningTickSound = (intensity: number = 1) => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  // Make pitch higher and shorter based on intensity
  const freq = intensity > 0.8 ? 880 : 520;
  const duration = intensity > 0.8 ? 0.08 : 0.12;

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, now);

  gainNode.gain.setValueAtTime(0.05, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

  // Simple high-pass filter to make it sound like a ticking clock
  const filter = ctx.createBiquadFilter();
  filter.type = 'highpass';
  filter.frequency.value = 1000;

  osc.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
};

// Defeat buzzer sound
export const playDefeatSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(180, now);
  osc.frequency.linearRampToValueAtTime(80, now + 0.6);

  gainNode.gain.setValueAtTime(0.12, now);
  gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.6);
};

// Victory digital fanfare
export const playVictorySound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
  const duration = 0.15;

  notes.forEach((freq, idx) => {
    const noteTime = now + idx * 0.1;
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, noteTime);

    gainNode.gain.setValueAtTime(0.07, noteTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, noteTime + duration * 1.5);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(noteTime);
    osc.stop(noteTime + duration * 1.5);
  });
};

// Game Start Chime
export const playStartSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [349.23, 440.00, 523.25, 698.46]; // F4 - A4 - C5 - F5 chord
  const duration = 0.35;

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + idx * 0.05);

    gainNode.gain.setValueAtTime(0.06, now + idx * 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + duration);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now + idx * 0.05);
    osc.stop(now + idx * 0.05 + duration);
  });
};
