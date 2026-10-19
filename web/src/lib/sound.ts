const SOUND_KEY = "caviar-sound:v1";

export type SoundKind = "open" | "close" | "hit";

const FILES: Record<SoundKind, string> = {
  open: "whoosh-open",
  close: "whoosh-close",
  hit: "hit",
};

const KINDS = Object.keys(FILES) as SoundKind[];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let unlocked = false;
let muted = readMuted();
let loadPromise: Promise<void> | null = null;
const buffers: Partial<Record<SoundKind, AudioBuffer>> = {};

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
    master.gain.value = 0.42;
    master.connect(ctx.destination);
  }
  return ctx;
}

function sampleExt() {
  if (typeof document === "undefined") return "mp3";
  const probe = document.createElement("audio");
  return probe.canPlayType('audio/webm; codecs="opus"') === "probably" ? "webm" : "mp3";
}

async function decodeUrl(audio: AudioContext, url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`sound ${res.status}`);
  const data = await res.arrayBuffer();
  return audio.decodeAudioData(data.slice(0));
}

async function loadPack() {
  const audio = ensureCtx();
  if (!audio) return;
  const ext = sampleExt();
  await Promise.all(
    KINDS.map(async (kind) => {
      const base = `/media/ui/${FILES[kind]}`;
      try {
        buffers[kind] = await decodeUrl(audio, `${base}.${ext}`);
      } catch {
        if (ext !== "mp3") buffers[kind] = await decodeUrl(audio, `${base}.mp3`);
      }
    }),
  );
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
  if (!unlocked) return;
  loadPromise ??= loadPack().catch(() => {
    loadPromise = null;
  });
  await loadPromise;
}

export function playUiSound(kind: SoundKind) {
  if (muted) return;
  const start = () => {
    if (muted || !unlocked) return;
    const audio = ensureCtx();
    const buffer = buffers[kind];
    if (!audio || !master || !buffer || audio.state !== "running") return;
    const src = audio.createBufferSource();
    src.buffer = buffer;
    src.connect(master);
    src.start();
  };
  if (!unlocked || !buffers[kind]) {
    void unlockSound().then(start);
    return;
  }
  start();
}
