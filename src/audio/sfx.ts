/**
 * UI sound effects (Web Audio, no asset files).
 * Mute is controlled by SoundEffectToggle.
 */

export type ClickSfx = "ui" | "primary";

const STORAGE_KEY = "a-small-goal-sfx-muted";

let ctx: AudioContext | null = null;
let muted = readMuted();
const listeners = new Set<() => void>();

function readMuted(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function writeMuted(value: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch {
        /* ignore quota / private mode */
    }
}

function emit(): void {
    for (const listener of listeners) listener();
}

function ensureContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!ctx) {
        const AC = window.AudioContext || (window as unknown as {webkitAudioContext: typeof AudioContext}).webkitAudioContext;
        ctx = new AC();
    }
    return ctx;
}

async function resume(): Promise<AudioContext | null> {
    const audio = ensureContext();
    if (!audio) return null;
    if (audio.state === "suspended") {
        try {
            await audio.resume();
        } catch {
            return null;
        }
    }
    return audio;
}

function tone(audio: AudioContext, freqStart: number, freqEnd: number, when: number, duration: number, peak: number, type: OscillatorType = "square"): void {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, when);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), when + duration * 0.6);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(gain);
    gain.connect(audio.destination);
    osc.start(when);
    osc.stop(when + duration + 0.03);
}

export function isSfxMuted(): boolean {
    return muted;
}

export function setSfxMuted(next: boolean): void {
    muted = next;
    writeMuted(next);
    emit();
}

export function toggleSfxMuted(): boolean {
    setSfxMuted(!muted);
    return muted;
}

export function subscribeSfx(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Unlock AudioContext from a user gesture (optional; also unlocked on first play). */
export async function unlockSfx(): Promise<void> {
    await resume();
}

/** Short chiptune-style UI click. `primary` = louder two-hit confirm blip. */
export function playClick(kind: ClickSfx = "ui"): void {
    if (muted) return;
    void playClickAsync(kind);
}

async function playClickAsync(kind: ClickSfx): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;

    const now = audio.currentTime;

    if (kind === "primary") {
        // Punchier: bass thump + bright confirm chirp.
        tone(audio, 220, 180, now, 0.07, 0.16, "square");
        tone(audio, 660, 990, now, 0.055, 0.2, "square");
        tone(audio, 1320, 1760, now + 0.045, 0.09, 0.18, "square");
        return;
    }

    tone(audio, 880, 1320, now, 0.045, 0.12, "square");
}

/** Wheel tick as a segment passes the pointer (short woodblock-ish blip). */
export function playRouletteTick(pitch = 1): void {
    if (muted) return;
    void playRouletteTickAsync(pitch);
}

async function playRouletteTickAsync(pitch: number): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;
    const p = Math.max(0.7, Math.min(1.4, pitch));
    tone(audio, 1400 * p, 900 * p, now, 0.028, 0.11, "square");
    tone(audio, 420 * p, 280 * p, now, 0.035, 0.08, "triangle");
}

/** Fanfare when the wheel lands. */
export function playRouletteLand(): void {
    if (muted) return;
    void playRouletteLandAsync();
}

/** Comic “啪！” stinger when the yearly event modal pops. */
export function playEventModal(): void {
    if (muted) return;
    void playEventModalAsync();
}

async function playEventModalAsync(): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;
    // Impact + rising alert chirp.
    tone(audio, 180, 120, now, 0.09, 0.2, "square");
    tone(audio, 440, 660, now + 0.04, 0.08, 0.16, "square");
    tone(audio, 880, 1320, now + 0.1, 0.1, 0.18, "square");
    tone(audio, 1760, 2200, now + 0.16, 0.12, 0.14, "square");
}

async function playRouletteLandAsync(): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;
    tone(audio, 523.25, 659.25, now, 0.1, 0.16, "square");
    tone(audio, 659.25, 783.99, now + 0.08, 0.12, 0.18, "square");
    tone(audio, 783.99, 1046.5, now + 0.18, 0.2, 0.2, "square");
    tone(audio, 261.63, 261.63, now, 0.28, 0.1, "triangle");
}

/**
 * Schedule tick SFX for a ease-out spin (matches cubic-bezier wheel feel).
 * Returns a disposer to cancel pending timeouts.
 */
export function scheduleRouletteSpinSfx(durationMs: number, tickCount = 36): () => void {
    if (muted || durationMs <= 0 || tickCount < 2) {
        const land = window.setTimeout(() => playRouletteLand(), Math.max(0, durationMs));
        return () => window.clearTimeout(land);
    }

    const timers: number[] = [];
    // Inverse of ease-out cubic so early ticks are dense (fast spin), late ticks sparse.
    for (let i = 1; i <= tickCount; i += 1) {
        const y = i / tickCount;
        const t = durationMs * (1 - Math.pow(1 - y, 1 / 3));
        const pitch = 1.15 - (i / tickCount) * 0.35;
        timers.push(window.setTimeout(() => playRouletteTick(pitch), t));
    }
    timers.push(window.setTimeout(() => playRouletteLand(), durationMs + 30));

    return () => {
        for (const id of timers) window.clearTimeout(id);
    };
}
