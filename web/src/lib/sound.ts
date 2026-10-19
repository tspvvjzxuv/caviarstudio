const SOUND_KEY = "caviar-sound:v1";

export type SoundKind = "open" | "close" | "hit";

const FILES: Record<SoundKind, string> = {
  open: "piano-open",
  close: "piano-close",
  hit: "glass-tap",
};

const ENVELOPE: Record<SoundKind, { attack: number; hold: number; release: number; lowpass: number; voice: number }> = {
  open: { attack: 0.032, hold: 0.3, release: 0.28, lowpass: 2700, voice: 1 },
  close: { attack: 0.032, hold: 0.3, release: 0.28, lowpass: 2700, voice: 0.72 },
  hit: { attack: 0.008, hold: 0.028, release: 0.055, lowpass: 4500, voice: 0.62 },
};

const KINDS = Object.keys(FILES) as SoundKind[];
const UNIQUE_FILES = [...new Set(Object.values(FILES))];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let warmed = false;
let muted = readMuted();
const buffers: Partial<Record<SoundKind, AudioBuffer>> = {};
const raw: Partial<Record<string, ArrayBuffer>> = {};
let prefetchPromise: Promise<void> | null = null;
let decodePromise: Promise<void> | null = null;

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
    master.gain.value = 0.9;
    master.connect(ctx.destination);
  }
  return ctx;
}

function sampleExt() {
  if (typeof document === "undefined") return "mp3";
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/webm; codecs="opus"') === "probably" ? "webm" : "mp3";
}

async function fetchFile(file: string) {
  if (raw[file]) return raw[file];
  const ext = sampleExt();
  const base = `/media/ui/${file}`;
  try {
    const res = await fetch(`${base}.${ext}`);
    if (!res.ok) throw new Error(`sound ${res.status}`);
    raw[file] = await res.arrayBuffer();
  } catch {
    if (ext !== "mp3") {
      const res = await fetch(`${base}.mp3`);
      if (res.ok) raw[file] = await res.arrayBuffer();
    }
  }
  return raw[file];
}

function prefetchPack() {
  if (typeof window === "undefined") return;
  prefetchPromise ??= Promise.all(UNIQUE_FILES.map((file) => fetchFile(file))).then(() => {
    void decodePack();
  });
}

async function decodePack() {
  const audio = ensureCtx();
  if (!audio) return;
  decodePromise ??= (async () => {
    const decoded: Partial<Record<string, AudioBuffer>> = {};
    await Promise.all(
      UNIQUE_FILES.map(async (file) => {
        const data = raw[file] ?? (await fetchFile(file));
        if (!data) return;
        try {
          decoded[file] = await audio.decodeAudioData(data.slice(0));
        } catch {
          /* one-file failure */
        }
      }),
    );
    for (const kind of KINDS) {
      const buf = decoded[FILES[kind]];
      if (buf) buffers[kind] = buf;
    }
  })();
  await decodePromise;
}

function warmSilent(audio: AudioContext) {
  if (warmed) return;
  warmed = true;
  const buf = audio.createBuffer(1, 1, audio.sampleRate);
  const src = audio.createBufferSource();
  src.buffer = buf;
  src.connect(audio.destination);
  try {
    src.start(0);
  } catch {
    warmed = false;
  }
}

function resume(audio: AudioContext) {
  if (audio.state === "suspended") void audio.resume();
}

function startBuffer(kind: SoundKind) {
  if (muted) return false;
  const audio = ensureCtx();
  const buffer = buffers[kind];
  if (!audio || !master || !buffer) return false;
  resume(audio);
  const env = ENVELOPE[kind];
  const t0 = audio.currentTime;
  const src = audio.createBufferSource();
  src.buffer = buffer;
  const filter = audio.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = env.lowpass;
  filter.Q.value = 0.7;
  const voice = audio.createGain();
  voice.gain.setValueAtTime(0, t0);
  voice.gain.linearRampToValueAtTime(env.voice, t0 + env.attack);
  voice.gain.setValueAtTime(env.voice, t0 + env.hold);
  voice.gain.linearRampToValueAtTime(0, t0 + env.hold + env.release);
  src.connect(filter);
  filter.connect(voice);
  voice.connect(master);
  src.start(t0);
  try {
    src.stop(t0 + env.hold + env.release + 0.02);
  } catch {
    /* stop not required */
  }
  return true;
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
  resume(audio);
  warmSilent(audio);
  await decodePack();
}

export function playUiSound(kind: SoundKind) {
  if (muted) return;
  if (startBuffer(kind)) return;
  void unlockSound().then(() => {
    startBuffer(kind);
  });
}

prefetchPack();
