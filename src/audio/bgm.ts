/**
 * Looping background music (Web Audio, no asset files).
 * Shares mute + AudioContext unlock with sfx.
 *
 * Step sequencer with proper sustain envelopes, run-length held notes,
 * and a soft pad so loops don't sound like broken staccato blips.
 */

import {isSfxMuted, onAudioReady, resumeAudio, subscribeSfx} from "@/audio/sfx";

export type BgmTrack = "game" | "roulette" | "settlement_win" | "settlement_lose";

interface TrackDef {
    bpm: number;
    gain: number;
    steps: number;
    lead: readonly number[];
    bass: readonly number[];
    /** Soft triangle pad root per 8-step bar (length = steps/8). */
    pad: readonly number[];
    hatSteps: ReadonlySet<number>;
}

const LOOKAHEAD_S = 0.25;
const SCHEDULE_MS = 40;

const OFFBEAT_HATS = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]);
const SPARSE_HATS = new Set([3, 7, 11, 15, 19, 23, 27, 31]);

// --- Game: continuous C major hustle -----------------------------------------

const GAME_LEAD: readonly number[] = [
    523.25,
    523.25,
    659.25,
    783.99,
    659.25,
    659.25,
    587.33,
    523.25, // C5–E5–G5
    440,
    440,
    523.25,
    659.25,
    587.33,
    523.25,
    493.88,
    440, // A4 arc
    392,
    392,
    493.88,
    587.33,
    523.25,
    523.25,
    659.25,
    587.33, // G4 arc
    440,
    523.25,
    659.25,
    587.33,
    523.25,
    493.88,
    440,
    392, // walk down
];

/** Held bass (same value = one long note). */
const GAME_BASS: readonly number[] = [
    130.81,
    130.81,
    130.81,
    130.81,
    130.81,
    130.81,
    196.0,
    196.0, // C3 → G3
    174.61,
    174.61,
    174.61,
    174.61,
    174.61,
    174.61,
    220.0,
    220.0, // F3 → A3
    196.0,
    196.0,
    196.0,
    196.0,
    196.0,
    196.0,
    246.94,
    246.94, // G3 → B3
    220.0,
    220.0,
    220.0,
    196.0,
    196.0,
    174.61,
    174.61,
    130.81, // A3 → G3 → F3 → C3
];

const GAME_PAD: readonly number[] = [130.81, 174.61, 196.0, 220.0];

// --- Settlement win: bright major --------------------------------------------

const WIN_LEAD: readonly number[] = [
    523.25, 659.25, 783.99, 1046.5, 783.99, 659.25, 587.33, 523.25, 698.46, 880, 1046.5, 880, 698.46, 659.25, 587.33, 523.25, 783.99, 987.77, 1174.66, 987.77, 783.99, 659.25, 783.99, 880, 1046.5,
    783.99, 659.25, 523.25, 659.25, 783.99, 1046.5, 1318.5,
];

const WIN_BASS: readonly number[] = [
    130.81, 130.81, 196.0, 196.0, 261.63, 261.63, 196.0, 196.0, 174.61, 174.61, 220.0, 220.0, 261.63, 261.63, 220.0, 220.0, 196.0, 196.0, 246.94, 246.94, 293.66, 293.66, 246.94, 246.94, 130.81,
    130.81, 164.81, 164.81, 196.0, 196.0, 261.63, 261.63,
];

const WIN_PAD: readonly number[] = [130.81, 174.61, 196.0, 130.81];

// --- Roulette: casino A minor swagger ----------------------------------------

const ROULETTE_LEAD: readonly number[] = [
    440, 523.25, 587.33, 587.33, 698.46, 659.25, 587.33, 523.25, 466.16, 440, 392, 392, 440, 523.25, 587.33, 698.46, 783.99, 783.99, 698.46, 659.25, 587.33, 523.25, 493.88, 440, 523.25, 587.33,
    698.46, 698.46, 659.25, 587.33, 523.25, 440,
];

const ROULETTE_BASS: readonly number[] = [
    110, 110, 110, 110, 130.81, 130.81, 146.83, 146.83, 174.61, 174.61, 174.61, 174.61, 146.83, 146.83, 130.81, 130.81, 98, 98, 98, 98, 110, 110, 123.47, 123.47, 110, 110, 146.83, 146.83, 174.61,
    174.61, 220, 220,
];

const ROULETTE_PAD: readonly number[] = [110, 174.61, 98, 110];

// --- Settlement lose: slow minor dirge ---------------------------------------

const LOSE_LEAD: readonly number[] = [
    440, 440, 392, 392, 349.23, 349.23, 329.63, 329.63, 349.23, 349.23, 329.63, 329.63, 293.66, 293.66, 261.63, 261.63, 293.66, 293.66, 261.63, 261.63, 246.94, 246.94, 220, 220, 246.94, 220, 196, 196,
    220, 220, 174.61, 174.61,
];

const LOSE_BASS: readonly number[] = [
    110, 110, 110, 110, 110, 110, 164.81, 164.81, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 130.81, 130.81, 98, 98, 98, 98, 98, 98, 146.83, 146.83, 110, 110, 110, 98, 98, 87.31, 87.31, 110,
];

const LOSE_PAD: readonly number[] = [110, 87.31, 98, 110];

const TRACKS: Record<BgmTrack, TrackDef> = {
    game: {
        bpm: 112,
        gain: 0.042,
        steps: 32,
        lead: GAME_LEAD,
        bass: GAME_BASS,
        pad: GAME_PAD,
        hatSteps: OFFBEAT_HATS,
    },
    roulette: {
        bpm: 144,
        gain: 0.045,
        steps: 32,
        lead: ROULETTE_LEAD,
        bass: ROULETTE_BASS,
        pad: ROULETTE_PAD,
        hatSteps: OFFBEAT_HATS,
    },
    settlement_win: {
        bpm: 128,
        gain: 0.048,
        steps: 32,
        lead: WIN_LEAD,
        bass: WIN_BASS,
        pad: WIN_PAD,
        hatSteps: OFFBEAT_HATS,
    },
    settlement_lose: {
        bpm: 78,
        gain: 0.038,
        steps: 32,
        lead: LOSE_LEAD,
        bass: LOSE_BASS,
        pad: LOSE_PAD,
        hatSteps: SPARSE_HATS,
    },
};

let wantTrack: BgmTrack | null = null;
let activeTrack: BgmTrack | null = null;
let playing = false;
let starting = false;
let master: GainNode | null = null;
let timerId: number | null = null;
let nextStepTime = 0;
let step = 0;
let hooksInstalled = false;

function ensureHooks(): void {
    if (hooksInstalled) return;
    hooksInstalled = true;
    subscribeSfx(() => {
        if (isSfxMuted()) {
            haltPlayback(true);
        } else if (wantTrack) {
            void beginPlayback(wantTrack);
        }
    });
    onAudioReady(() => {
        if (wantTrack && !isSfxMuted() && !playing) void beginPlayback(wantTrack);
    });
}

/**
 * ADSR-ish envelope with a real sustain plateau.
 * Old code ramped straight to silence after attack → choppy blips.
 */
function note(audio: AudioContext, dest: AudioNode, freq: number, when: number, duration: number, peak: number, type: OscillatorType): void {
    if (freq <= 0 || peak <= 0 || duration <= 0.01) return;

    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    const attack = Math.min(0.02, duration * 0.08);
    const release = Math.min(0.1, duration * 0.22);
    const sustainEnd = Math.max(when + attack + 0.005, when + duration - release);

    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + attack);
    gain.gain.setValueAtTime(peak, sustainEnd);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + duration + 0.03);
}

function hat(audio: AudioContext, dest: AudioNode, when: number, peak = 0.01): void {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(8800, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.03);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + 0.04);
}

/** Count consecutive identical non-zero steps starting at `index` (no wrap). */
function holdLength(pattern: readonly number[], index: number, steps: number): number {
    const freq = pattern[index] ?? 0;
    if (freq <= 0) return 0;
    let n = 1;
    while (index + n < steps && (pattern[index + n] ?? 0) === freq) n += 1;
    return n;
}

function isRunStart(pattern: readonly number[], index: number): boolean {
    const freq = pattern[index] ?? 0;
    if (freq <= 0) return false;
    if (index === 0) return true;
    return (pattern[index - 1] ?? 0) !== freq;
}

function scheduleStep(audio: AudioContext, dest: AudioNode, track: TrackDef, index: number, when: number, stepDuration: number): void {
    const i = index % track.steps;

    // Lead: run-length holds + slight overlap so steps blend.
    const lead = track.lead[i] ?? 0;
    if (lead > 0 && isRunStart(track.lead, i)) {
        const leadHold = holdLength(track.lead, i, track.steps);
        note(audio, dest, lead, when, stepDuration * leadHold * 1.05, 0.42, "square");
        if (i % 8 === 0) {
            note(audio, dest, lead * 2, when, stepDuration * Math.min(4, leadHold) * 0.95, 0.12, "triangle");
        }
    }

    // Bass: long held notes (run-length).
    const bass = track.bass[i] ?? 0;
    if (bass > 0 && isRunStart(track.bass, i)) {
        const bassHold = holdLength(track.bass, i, track.steps);
        note(audio, dest, bass, when, stepDuration * bassHold * 1.02, 0.55, "triangle");
        note(audio, dest, bass * 2, when, stepDuration * bassHold * 0.98, 0.16, "square");
    }

    // Pad: one soft drone per bar (8 steps) — fills the bed under melody.
    if (i % 8 === 0) {
        const padRoot = track.pad[Math.floor(i / 8) % track.pad.length] ?? 0;
        if (padRoot > 0) {
            note(audio, dest, padRoot, when, stepDuration * 8.15, 0.22, "triangle");
            note(audio, dest, padRoot * 1.5, when, stepDuration * 8.1, 0.08, "sine"); // soft fifth-ish
        }
    }

    if (track.hatSteps.has(i)) {
        const hatPeak = activeTrack === "settlement_lose" ? 0.006 : activeTrack === "roulette" ? 0.008 : 0.009;
        hat(audio, dest, when, hatPeak);
    }
}

function tick(audio: AudioContext, dest: GainNode, trackId: BgmTrack): void {
    if (!playing || activeTrack !== trackId) return;
    const track = TRACKS[trackId];
    const stepDuration = 60 / track.bpm / 2;

    // If we fell behind (tab throttle), jump forward instead of stacking late clicks.
    if (nextStepTime < audio.currentTime - 0.08) {
        nextStepTime = audio.currentTime + 0.02;
    }

    const horizon = audio.currentTime + LOOKAHEAD_S;
    while (nextStepTime < horizon) {
        scheduleStep(audio, dest, track, step, nextStepTime, stepDuration);
        nextStepTime += stepDuration;
        step = (step + 1) % track.steps;
    }
    timerId = window.setTimeout(() => tick(audio, dest, trackId), SCHEDULE_MS);
}

async function beginPlayback(trackId: BgmTrack): Promise<void> {
    if (wantTrack !== trackId || isSfxMuted()) return;
    if (playing && activeTrack === trackId) return;
    if (starting) return;

    if (playing && activeTrack !== trackId) {
        haltPlayback(false);
    }

    starting = true;

    try {
        const audio = await resumeAudio();
        if (!audio || wantTrack !== trackId || isSfxMuted()) return;
        if (playing && activeTrack === trackId) return;
        if (audio.state !== "running") return;

        const track = TRACKS[trackId];
        const gain = audio.createGain();
        const now = audio.currentTime;
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(track.gain, now + 0.55);
        gain.connect(audio.destination);

        master = gain;
        playing = true;
        activeTrack = trackId;
        step = 0;
        nextStepTime = now + 0.04;
        tick(audio, gain, trackId);
    } finally {
        starting = false;
    }
}

function haltPlayback(soft = false): void {
    if (timerId !== null) {
        window.clearTimeout(timerId);
        timerId = null;
    }

    const gain = master;
    master = null;
    playing = false;
    activeTrack = null;

    if (!gain) return;

    try {
        const audio = gain.context;
        const now = audio.currentTime;
        gain.gain.cancelScheduledValues(now);
        if (soft) {
            gain.gain.setValueAtTime(Math.max(0.0001, gain.gain.value), now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
            window.setTimeout(() => {
                try {
                    gain.disconnect();
                } catch {
                    /* already disconnected */
                }
            }, 280);
        } else {
            gain.gain.setValueAtTime(0.0001, now);
            gain.disconnect();
        }
    } catch {
        /* context closed */
    }
}

function startTrack(trackId: BgmTrack): void {
    ensureHooks();
    wantTrack = trackId;
    if (!isSfxMuted()) void beginPlayback(trackId);
}

function stopTrack(): void {
    wantTrack = null;
    haltPlayback(true);
}

/** Start looping BGM while GameScreen is mounted. Idempotent. */
export function startGameBgm(): void {
    startTrack("game");
}

/** Stop game BGM (e.g. leave GameScreen). Idempotent. */
export function stopGameBgm(): void {
    if (wantTrack === "game") stopTrack();
}

/** Birth-roulette casino floor loop. Idempotent. */
export function startRouletteBgm(): void {
    startTrack("roulette");
}

/** Stop roulette BGM. Idempotent. */
export function stopRouletteBgm(): void {
    if (wantTrack === "roulette") stopTrack();
}

/** Settlement win/lose looping theme. Idempotent. */
export function startSettlementBgm(outcome: "win" | "lose"): void {
    startTrack(outcome === "win" ? "settlement_win" : "settlement_lose");
}

/** Stop settlement BGM. Idempotent. */
export function stopSettlementBgm(): void {
    if (wantTrack === "settlement_win" || wantTrack === "settlement_lose") stopTrack();
}
