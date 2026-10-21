declare module "@/vendor/meltgl.min.js" {
  export type MeltState = "idle" | "melting" | "melted" | "reforming";

  export interface MeltInstance {
    readonly progress: number;
    readonly state: MeltState;
    readonly backend: "webgl2" | "svg";
    play(): void;
    reverse(): void;
    pause(): void;
    suspend(): void;
    resume(): void;
    seek(progress: number): void;
    reset(): void;
    dispose(): void;
    on(event: "complete" | "statechange" | "progress" | "contextlost", listener: (value?: unknown) => void): () => void;
  }

  export function createMelt(options: {
    target: HTMLElement;
    source: string | HTMLImageElement | HTMLVideoElement;
    material?: string | Record<string, unknown>;
    simulation?: Record<string, unknown>;
    duration?: number;
    easing?: string;
    maxPixelRatio?: number;
    maxStepsPerFrame?: number;
    respectReducedMotion?: boolean;
    backend?: "auto" | "webgl2" | "svg";
    key?: "auto" | "none";
  }): Promise<MeltInstance>;
}
