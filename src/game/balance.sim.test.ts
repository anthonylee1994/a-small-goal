import {describe, expect, it} from "vitest";
import {BALANCE_SEEDS, BALANCE_STRATEGIES, runSim, summarize} from "./balance.sim";

describe("Phase 3 balance simulation", () => {
    it("runs ≥10 fixed-seed games across strategies and prints asset distribution", () => {
        const results = BALANCE_SEEDS.flatMap(seed => BALANCE_STRATEGIES.map(strategy => runSim(seed, strategy)));

        expect(BALANCE_SEEDS.length).toBeGreaterThanOrEqual(20);
        expect(results.length).toBe(BALANCE_SEEDS.length * BALANCE_STRATEGIES.length);

        // Every sim should finish (retire or die), never stuck mid-loop.
        for (const r of results) {
            expect(r.reason === "retirement" || r.reason === "death").toBe(true);
            expect(r.snapshots.some(s => s.age === 20)).toBe(true);
        }

        // Soft balance gates (Phase 3 targets):
        // - At least two distinct strategies can reach "almost" tier (≥$10M) sometimes.
        // - No single strategy wins every seed (prevents one dominant path).
        // - Hybrid / company / trade should each have some viable outcomes.
        // - Low-class birth should sometimes clear $10M (not pure high-class lottery).
        const byStrategy = Object.fromEntries(
            BALANCE_STRATEGIES.map(s => {
                const list = results.filter(r => r.strategy === s);
                return [
                    s,
                    {
                        wins: list.filter(r => r.winner).length,
                        almost: list.filter(r => r.finalAssets >= 10_000_000).length,
                        median: [...list.map(r => r.finalAssets)].sort((a, b) => a - b)[Math.floor(list.length / 2)] ?? 0,
                    },
                ];
            })
        ) as Record<string, {wins: number; almost: number; median: number}>;

        const byFamily = Object.fromEntries(
            (["low_class", "middle_class", "high_class"] as const).map(f => {
                const list = results.filter(r => r.birthFamilyId === f);
                return [
                    f,
                    {
                        n: list.length,
                        wins: list.filter(r => r.winner).length,
                        almost: list.filter(r => r.finalAssets >= 10_000_000).length,
                    },
                ];
            })
        ) as Record<string, {n: number; wins: number; almost: number}>;

        // eslint-disable-next-line no-console
        console.log("\n=== Phase 3 balance report ===\n" + summarize(results) + "\n" + JSON.stringify({byStrategy, byFamily}, null, 2));

        const strategiesWithAlmost = BALANCE_STRATEGIES.filter(s => byStrategy[s]!.almost > 0);
        expect(strategiesWithAlmost.length).toBeGreaterThanOrEqual(2);

        const perfectWins = BALANCE_STRATEGIES.filter(s => byStrategy[s]!.wins === BALANCE_SEEDS.length);
        expect(perfectWins.length).toBe(0);

        // Winning should be possible but uncommon for simple bots (~3–25%, soft cap 35%).
        const totalWins = results.filter(r => r.winner).length;
        expect(totalWins).toBeGreaterThan(0);
        expect(totalWins / results.length).toBeLessThan(0.35);
        // Floor soft: not a pure lottery that never hits for bots either.
        expect(totalWins / results.length).toBeGreaterThanOrEqual(0.02);

        // Company-focused and trade-focused should both sometimes clear $10M.
        expect(byStrategy.trade_only!.almost).toBeGreaterThan(0);
        expect(byStrategy.company_rush!.almost).toBeGreaterThan(0);

        // High-tier yolo must not monopolize "almost" outcomes.
        expect(byStrategy.high_tier_yolo!.almost).toBeLessThan(results.filter(r => r.strategy === "high_tier_yolo").length);

        // Poverty start is hard but not a hard zero on "almost" across all strategies.
        if (byFamily.low_class!.n > 0) {
            expect(byFamily.low_class!.almost).toBeGreaterThan(0);
        }
    });
});
