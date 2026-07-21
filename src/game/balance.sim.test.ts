import {describe, expect, it} from "vitest";
import {BALANCE_SEEDS, BALANCE_STRATEGIES, runSim, summarize} from "./balance.sim";

describe("Phase 3 balance simulation", () => {
    it("runs ≥10 fixed-seed games across strategies and prints asset distribution", () => {
        const results = BALANCE_SEEDS.flatMap(seed => BALANCE_STRATEGIES.map(strategy => runSim(seed, strategy)));

        expect(BALANCE_SEEDS.length).toBeGreaterThanOrEqual(10);
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

        // eslint-disable-next-line no-console
        console.log("\n=== Phase 3 balance report ===\n" + summarize(results) + "\n" + JSON.stringify(byStrategy, null, 2));

        const strategiesWithAlmost = BALANCE_STRATEGIES.filter(s => byStrategy[s]!.almost > 0);
        expect(strategiesWithAlmost.length).toBeGreaterThanOrEqual(2);

        const perfectWins = BALANCE_STRATEGIES.filter(s => byStrategy[s]!.wins === BALANCE_SEEDS.length);
        expect(perfectWins.length).toBe(0);

        // Winning should be possible but uncommon for simple bots (~5–25%).
        const totalWins = results.filter(r => r.winner).length;
        expect(totalWins).toBeGreaterThan(0);
        expect(totalWins / results.length).toBeLessThan(0.35);

        // Company-focused and trade-focused should both sometimes clear $10M.
        expect(byStrategy.trade_only!.almost).toBeGreaterThan(0);
        expect(byStrategy.company_rush!.almost).toBeGreaterThan(0);
    });
});
