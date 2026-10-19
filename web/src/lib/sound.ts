const SOUND_KEY = "caviar-sound:v1";

export type SoundKind = "open" | "close" | "hit";

const FILES: Record<SoundKind, string> = {
  open: "lens-open",
  close: "lens-close",
  hit: "hit",
};

const KINDS = Object.keys(FILES) as SoundKind[];

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let warmed = false;
let muted = readMuted();
const buffers: Partial<Record<SoundKind, AudioBuffer>> = {};
const raw: Partial<Record<SoundKind, ArrayBuffer>> = {};
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

async function fetchKind(kind: SoundKind) {
  if (raw[kind]) return raw[kind];
  const ext = sampleExt();
  const base = `/media/ui/${FILES[kind]}`;
  try {
    const res = await fetch(`${base}.${ext}`);
    if (!res.ok) throw new Error(`sound ${res.status}`);
    raw[kind] = await res.arrayBuffer();
  } catch {
    if (ext !== "mp3") {
      const res = await fetch(`${base}.mp3`);
      if (res.ok) raw[kind] = await res.arrayBuffer();
    }
  }
  return raw[kind];
}

function prefetchPack() {
  if (typeof window === "undefined") return;
  prefetchPromise ??= Promise.all(KINDS.map((kind) => fetchKind(kind))).then(() => {
    void decodePack();
  });
}

async function decodePack() {
  const audio = ensureCtx();
  if (!audio) return;
  decodePromise ??= (async () => {
    await Promise.all(
      KINDS.map(async (kind) => {
        if (buffers[kind]) return;
        const data = raw[kind] ?? (await fetchKind(kind));
        if (!data) return;
        try {
          buffers[kind] = await audio.decodeAudioData(data.slice(0));
        } catch {
          /* one-kind failure */
        }
      }),
    );
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
  const src = audio.createBufferSource();
  src.buffer = buffer;
  src.connect(master);
  src.start(audio.currentTime);
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
