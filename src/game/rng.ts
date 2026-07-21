/** Seedable RNG adapter — SPEC.md §1.3 */

export type Rng = () => number;

/** Mulberry32 — deterministic 0..1 floats from a 32-bit seed. */
export function createRng(seed: number): Rng {
    let t = seed >>> 0;
    return () => {
        t += 0x6d2b79f5;
        let r = Math.imul(t ^ (t >>> 15), 1 | t);
        r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
        return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
}

export function randomBetween(rng: Rng, min: number, max: number): number {
    return min + rng() * (max - min);
}

export function randomInt(rng: Rng, minInclusive: number, maxExclusive: number): number {
    return Math.floor(randomBetween(rng, minInclusive, maxExclusive));
}

export function pickWeighted<T extends {weight: number}>(rng: Rng, items: readonly T[]): T {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let roll = rng() * total;
    for (const item of items) {
        roll -= item.weight;
        if (roll <= 0) return item;
    }
    return items[items.length - 1]!;
}
