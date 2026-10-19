const SOUND_KEY = "caviar-sound:v1";

type SoundKind = "click" | "whoosh";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let muted = readMuted();

function readMuted(): boolean {
  try {
    return localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
}

function persistMuted(next: boolean) {
  try {
    localStorage.setItem(SOUND_KEY, next ? "off" : "on");
  } catch {
    /* private mode */
  }
}

function ensureCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.14;
    master.connect(ctx.destination);
  }
  return ctx;
}

export function isSoundMuted() {
  return muted;
}

export function setSoundMuted(next: boolean) {
  muted = next;
  persistMuted(next);
}

export async function unlockSound() {
  const audio = ensureCtx();
  if (!audio) return;
  if (audio.state === "suspended") {
    try {
      await audio.resume();
    } catch {
      return;
    }
  }
  unlocked = audio.state === "running";
}

function noiseBuffer(audio: AudioContext, seconds: number) {
  const length = Math.max(1, Math.floor(audio.sampleRate * seconds));
  const buffer = audio.createBuffer(1, length, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

function tone(
  audio: AudioContext,
  dest: AudioNode,
  {
    freq,
    endFreq,
    type = "sine",
    start,
    attack = 0.008,
    decay,
    peak = 0.04,
  }: {
    freq: number;
    endFreq?: number;
    type?: OscillatorType;
    start: number;
    attack?: number;
    decay: number;
    peak?: number;
  },
) {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + decay);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + decay);
  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(start + decay + 0.02);
}

function playClick(audio: AudioContext, dest: AudioNode) {
  const t = audio.currentTime;
  tone(audio, dest, { freq: 2650, endFreq: 980, start: t, decay: 0.09, peak: 0.036 });
  tone(audio, dest, { freq: 4100, endFreq: 1800, start: t, decay: 0.05, peak: 0.018, type: "triangle" });
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, 0.04);
  const filter = audio.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 2200;
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.028, t + 0.004);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(t);
  src.stop(t + 0.06);
}

function playWhoosh(audio: AudioContext, dest: AudioNode) {
  const t = audio.currentTime;
  const src = audio.createBufferSource();
  src.buffer = noiseBuffer(audio, 0.42);
  const filter = audio.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 0.85;
  filter.frequency.setValueAtTime(420, t);
  filter.frequency.exponentialRampToValueAtTime(2100, t + 0.22);
  filter.frequency.exponentialRampToValueAtTime(700, t + 0.4);
  const gain = audio.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(0.032, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  src.connect(filter);
  filter.connect(gain);
  gain.connect(dest);
  src.start(t);
  src.stop(t + 0.42);
  tone(audio, dest, { freq: 180, endFreq: 90, start: t, attack: 0.03, decay: 0.32, peak: 0.012, type: "sine" });
}

export function playUiSound(kind: SoundKind) {
  if (muted || !unlocked) return;
  const audio = ensureCtx();
  if (!audio || !master || audio.state !== "running") return;
  if (kind === "whoosh") playWhoosh(audio, master);
  else playClick(audio, master);
}
