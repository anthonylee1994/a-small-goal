/**
 * Looping background music (Web Audio, no asset files).
 * Shares mute + AudioContext unlock with sfx.
 */

import {isSfxMuted, onAudioReady, resumeAudio, subscribeSfx} from "@/audio/sfx";

export type BgmTrack = "game" | "roulette" | "settlement_win" | "settlement_lose";

interface TrackDef {
    bpm: number;
    gain: number;
    steps: number;
    lead: readonly number[];
    bass: readonly number[];
    hatSteps: ReadonlySet<number>;
}

const LOOKAHEAD_S = 0.12;
const SCHEDULE_MS = 25;

const OFFBEAT_HATS = new Set([1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31]);
const SPARSE_HATS = new Set([3, 7, 11, 15, 19, 23, 27, 31]);

/** C major / A minor hustle loop — light chiptune grind. */
const GAME_LEAD: readonly number[] = [
    523.25,
    0,
    659.25,
    783.99,
    659.25,
    0,
    587.33,
    523.25, // C5 · E5 G5 E5 · D5 C5
    440,
    0,
    523.25,
    659.25,
    587.33,
    523.25,
    493.88,
    440, // A4 · C5 E5 D5 C5 B4 A4
    392,
    0,
    493.88,
    587.33,
    523.25,
    0,
    659.25,
    587.33, // G4 · B4 D5 C5 · E5 D5
    440,
    523.25,
    659.25,
    587.33,
    523.25,
    493.88,
    440,
    392, // A4 C5 E5 D5 C5 B4 A4 G4
];

const GAME_BASS: readonly number[] = [
    130.81,
    0,
    130.81,
    0,
    130.81,
    0,
    196.0,
    0, // C3 · C3 · C3 · G3
    174.61,
    0,
    174.61,
    0,
    174.61,
    0,
    220.0,
    0, // F3 · F3 · F3 · A3
    196.0,
    0,
    196.0,
    0,
    196.0,
    0,
    246.94,
    0, // G3 · G3 · G3 · B3
    220.0,
    0,
    220.0,
    0,
    196.0,
    0,
    174.61,
    130.81, // A3 · A3 · G3 · F3 C3
];

/** Win: bright major victory loop (C → F → G → C). */
const WIN_LEAD: readonly number[] = [
    523.25,
    659.25,
    783.99,
    1046.5,
    783.99,
    659.25,
    587.33,
    523.25, // C5 E5 G5 C6 G5 E5 D5 C5
    698.46,
    880,
    1046.5,
    880,
    698.46,
    659.25,
    587.33,
    523.25, // F5 A5 C6 A5 F5 E5 D5 C5
    783.99,
    987.77,
    1174.66,
    987.77,
    783.99,
    659.25,
    783.99,
    880, // G5 B5 D6 B5 G5 E5 G5 A5
    1046.5,
    783.99,
    659.25,
    523.25,
    659.25,
    783.99,
    1046.5,
    1318.5, // C6 G5 E5 C5 E5 G5 C6 E6
];

const WIN_BASS: readonly number[] = [
    130.81,
    0,
    196.0,
    0,
    261.63,
    0,
    196.0,
    0, // C3 G3 C4 G3
    174.61,
    0,
    220.0,
    0,
    261.63,
    0,
    220.0,
    0, // F3 A3 C4 A3
    196.0,
    0,
    246.94,
    0,
    293.66,
    0,
    246.94,
    0, // G3 B3 D4 B3
    130.81,
    0,
    164.81,
    0,
    196.0,
    0,
    261.63,
    0, // C3 E3 G3 C4
];

/** Casino floor swagger — A minor bluesy, slot-machine bounce. */
const ROULETTE_LEAD: readonly number[] = [
    440,
    523.25,
    587.33,
    0,
    698.46,
    659.25,
    587.33,
    523.25, // A C D · F E D C
    466.16,
    440,
    392,
    0,
    440,
    523.25,
    587.33,
    698.46, // Bb A G · A C D F
    783.99,
    0,
    698.46,
    659.25,
    587.33,
    523.25,
    493.88,
    440, // G · F E D C B A
    523.25,
    587.33,
    698.46,
    0,
    659.25,
    587.33,
    523.25,
    440, // C D F · E D C A
];

const ROULETTE_BASS: readonly number[] = [
    110,
    0,
    110,
    0,
    130.81,
    0,
    146.83,
    0, // A2 · A2 · C3 · D3
    174.61,
    0,
    174.61,
    0,
    146.83,
    0,
    130.81,
    0, // F3 · F3 · D3 · C3
    98,
    0,
    98,
    0,
    110,
    0,
    123.47,
    0, // G2 · G2 · A2 · B2
    110,
    0,
    146.83,
    0,
    174.61,
    0,
    220,
    0, // A2 · D3 · F3 · A3
];

/** Lose: slow minor dirge (A minor → F → G → Am). */
const LOSE_LEAD: readonly number[] = [
    440,
    0,
    392,
    0,
    349.23,
    0,
    329.63,
    0, // A4 · G4 · F4 · E4
    349.23,
    0,
    329.63,
    0,
    293.66,
    0,
    261.63,
    0, // F4 · E4 · D4 · C4
    293.66,
    0,
    261.63,
    0,
    246.94,
    0,
    220,
    0, // D4 · C4 · B3 · A3
    246.94,
    220,
    196,
    0,
    220,
    0,
    174.61,
    0, // B3 A3 G3 · A3 · F3
];

const LOSE_BASS: readonly number[] = [
    110,
    0,
    0,
    0,
    110,
    0,
    164.81,
    0, // A2 · · · A2 · E3
    87.31,
    0,
    0,
    0,
    87.31,
    0,
    130.81,
    0, // F2 · · · F2 · C3
    98,
    0,
    0,
    0,
    98,
    0,
    146.83,
    0, // G2 · · · G2 · D3
    110,
    0,
    0,
    0,
    98,
    0,
    87.31,
    110, // A2 · · · G2 · F2 A2
];

const TRACKS: Record<BgmTrack, TrackDef> = {
    game: {
        bpm: 112,
        gain: 0.045,
        steps: 32,
        lead: GAME_LEAD,
        bass: GAME_BASS,
        hatSteps: OFFBEAT_HATS,
    },
    roulette: {
        bpm: 144,
        gain: 0.048,
        steps: 32,
        lead: ROULETTE_LEAD,
        bass: ROULETTE_BASS,
        // Off-beat hats only — leave headroom for spin tick SFX.
        hatSteps: OFFBEAT_HATS,
    },
    settlement_win: {
        bpm: 128,
        gain: 0.05,
        steps: 32,
        lead: WIN_LEAD,
        bass: WIN_BASS,
        hatSteps: OFFBEAT_HATS,
    },
    settlement_lose: {
        bpm: 78,
        gain: 0.04,
        steps: 32,
        lead: LOSE_LEAD,
        bass: LOSE_BASS,
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
    // Mid-session refresh: AudioContext may still be suspended until first gesture.
    onAudioReady(() => {
        if (wantTrack && !isSfxMuted() && !playing) void beginPlayback(wantTrack);
    });
}

function note(audio: AudioContext, dest: AudioNode, freq: number, when: number, duration: number, peak: number, type: OscillatorType): void {
    if (freq <= 0 || peak <= 0) return;
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);

    const attack = Math.min(0.012, duration * 0.15);
    const release = Math.min(0.06, duration * 0.35);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration - release * 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + duration);

    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + duration + 0.02);
}

function hat(audio: AudioContext, dest: AudioNode, when: number, peak = 0.012): void {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(8800, when);
    gain.gain.setValueAtTime(0.0001, when);
    gain.gain.exponentialRampToValueAtTime(peak, when + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.0001, when + 0.035);
    osc.connect(gain);
    gain.connect(dest);
    osc.start(when);
    osc.stop(when + 0.045);
}

function scheduleStep(audio: AudioContext, dest: AudioNode, track: TrackDef, index: number, when: number, stepDuration: number): void {
    const i = index % track.steps;
    const lead = track.lead[i] ?? 0;
    const bass = track.bass[i] ?? 0;

    if (lead > 0) {
        note(audio, dest, lead, when, stepDuration * 0.85, 0.55, "square");
        if (i % 8 === 0) {
            note(audio, dest, lead * 2, when, stepDuration * 0.4, 0.18, "triangle");
        }
    }
    if (bass > 0) {
        note(audio, dest, bass, when, stepDuration * 1.05, 0.7, "triangle");
        note(audio, dest, bass * 2, when, stepDuration * 0.9, 0.22, "square");
    }
    if (track.hatSteps.has(i)) {
        const hatPeak = activeTrack === "settlement_lose" ? 0.008 : activeTrack === "roulette" ? 0.01 : 0.012;
        hat(audio, dest, when, hatPeak);
    }
}

function tick(audio: AudioContext, dest: GainNode, trackId: BgmTrack): void {
    if (!playing || activeTrack !== trackId) return;
    const track = TRACKS[trackId];
    const stepDuration = 60 / track.bpm / 2;
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

    // Switching track: stop current first.
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
        gain.gain.exponentialRampToValueAtTime(track.gain, now + 0.7);
        gain.connect(audio.destination);

        master = gain;
        playing = true;
        activeTrack = trackId;
        step = 0;
        nextStepTime = now + 0.05;
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
