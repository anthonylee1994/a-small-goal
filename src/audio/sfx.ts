/**
 * UI sound effects (Web Audio, no asset files).
 * Mute is controlled by SoundEffectToggle.
 */

export type ClickSfx = "ui" | "primary";

const STORAGE_KEY = "a-small-goal-sfx-muted";

let ctx: AudioContext | null = null;
let muted = readMuted();
const listeners = new Set<() => void>();
const readyListeners = new Set<() => void>();

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

function emitReady(): void {
    for (const listener of readyListeners) listener();
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
        // Context may now be running after user gesture unlock.
        emitReady();
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

/** Fires when AudioContext is running (after unlock / resume). Used by BGM. */
export function onAudioReady(listener: () => void): () => void {
    readyListeners.add(listener);
    return () => {
        readyListeners.delete(listener);
    };
}

/** Unlock AudioContext from a user gesture (optional; also unlocked on first play). */
export async function unlockSfx(): Promise<void> {
    await resume();
}

/** Shared resume for BGM / other audio modules. */
export async function resumeAudio(): Promise<AudioContext | null> {
    return resume();
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

/** Birth-family land stings (二世祖 / 死中產 / 死窮撚). */
export type RouletteLandKind = "high_class" | "middle_class" | "low_class";

/** Fanfare / sting when the wheel lands on a birth family. */
export function playRouletteLand(kind: RouletteLandKind = "middle_class"): void {
    if (muted) return;
    void playRouletteLandAsync(kind);
}

/** Comic stinger when the yearly event modal pops. */
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

/** Title screen enter: short bright logo sting. */
export function playTitleEnter(): void {
    if (muted) return;
    void playTitleEnterAsync();
}

async function playTitleEnterAsync(): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;
    // Logo pop + sparkle.
    tone(audio, 330, 440, now, 0.08, 0.14, "triangle");
    tone(audio, 660, 880, now + 0.05, 0.09, 0.16, "square");
    tone(audio, 990, 1320, now + 0.12, 0.12, 0.14, "square");
    tone(audio, 1760, 2200, now + 0.18, 0.1, 0.1, "square");
}

/** Settlement enter: triumph fanfare (win) or sad descending sting (lose). */
export function playSettlement(outcome: "win" | "lose"): void {
    if (muted) return;
    void playSettlementAsync(outcome);
}

async function playSettlementAsync(outcome: "win" | "lose"): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;

    if (outcome === "win") {
        // Bright major arpeggio + confetti blips.
        tone(audio, 392, 392, now, 0.1, 0.14, "triangle");
        tone(audio, 523.25, 523.25, now + 0.08, 0.1, 0.16, "square");
        tone(audio, 659.25, 659.25, now + 0.16, 0.1, 0.18, "square");
        tone(audio, 783.99, 1046.5, now + 0.26, 0.22, 0.2, "square");
        tone(audio, 1046.5, 1318.5, now + 0.38, 0.28, 0.16, "square");
        tone(audio, 196, 196, now, 0.45, 0.1, "triangle");
        return;
    }

    // Descending minor-ish fail sting.
    tone(audio, 392, 349.23, now, 0.14, 0.16, "square");
    tone(audio, 349.23, 293.66, now + 0.12, 0.16, 0.15, "square");
    tone(audio, 293.66, 220, now + 0.28, 0.28, 0.14, "square");
    tone(audio, 110, 82, now + 0.2, 0.4, 0.12, "triangle");
}

async function playRouletteLandAsync(kind: RouletteLandKind): Promise<void> {
    const audio = await resume();
    if (!audio || muted) return;
    const now = audio.currentTime;

    if (kind === "high_class") {
        // 二世祖：財大氣粗 triumph + cash sparkle.
        tone(audio, 523.25, 659.25, now, 0.1, 0.16, "square");
        tone(audio, 659.25, 783.99, now + 0.07, 0.1, 0.18, "square");
        tone(audio, 783.99, 1046.5, now + 0.15, 0.16, 0.2, "square");
        tone(audio, 1046.5, 1318.5, now + 0.28, 0.22, 0.16, "square");
        tone(audio, 261.63, 330, now, 0.4, 0.12, "triangle");
        return;
    }

    if (kind === "low_class") {
        // 死窮撚：衰氣下降 fail sting.
        tone(audio, 392, 330, now, 0.12, 0.16, "square");
        tone(audio, 330, 247, now + 0.1, 0.14, 0.14, "square");
        tone(audio, 247, 165, now + 0.24, 0.28, 0.13, "square");
        tone(audio, 110, 82, now + 0.18, 0.38, 0.11, "triangle");
        return;
    }

    // 死中產：平平無奇 bland ding.
    tone(audio, 440, 440, now, 0.1, 0.14, "square");
    tone(audio, 554.37, 523.25, now + 0.1, 0.16, 0.13, "square");
    tone(audio, 220, 220, now, 0.28, 0.09, "triangle");
}

/**
 * Schedule tick SFX for a ease-out spin (matches cubic-bezier wheel feel).
 * Returns a disposer to cancel pending timeouts.
 */
export function scheduleRouletteSpinSfx(durationMs: number, tickCount = 36, landKind: RouletteLandKind = "middle_class"): () => void {
    if (muted || durationMs <= 0 || tickCount < 2) {
        const land = window.setTimeout(() => playRouletteLand(landKind), Math.max(0, durationMs));
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
    timers.push(window.setTimeout(() => playRouletteLand(landKind), durationMs + 30));

    return () => {
        for (const id of timers) window.clearTimeout(id);
    };
}
