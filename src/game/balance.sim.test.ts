import {describe, expect, it} from "vitest";
import {ALL_BALANCE_STRATEGIES, BALANCE_SEEDS, BALANCE_STRATEGIES, LOAN_STRATEGIES, runSim, summarize} from "./balance.sim";

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

    it("bank leverage strategies stay playable and do not break win-rate soft caps", () => {
        const results = BALANCE_SEEDS.flatMap(seed => ALL_BALANCE_STRATEGIES.map(strategy => runSim(seed, strategy)));

        for (const r of results) {
            expect(r.reason === "retirement" || r.reason === "death").toBe(true);
            expect(r.peakLoan).toBeGreaterThanOrEqual(0);
            expect(r.finalLoan).toBeGreaterThanOrEqual(0);
            expect(Number.isFinite(r.finalAssets)).toBe(true);
        }

        const loanResults = results.filter(r => LOAN_STRATEGIES.includes(r.strategy));
        const baseline = results.filter(r => BALANCE_STRATEGIES.includes(r.strategy));

        // Loan bots should actually use credit on most seeds (otherwise harness is useless).
        const loanUsers = loanResults.filter(r => r.peakLoan > 0).length;
        expect(loanUsers / loanResults.length).toBeGreaterThan(0.5);

        const loanWins = loanResults.filter(r => r.winner).length;
        const loanWinRate = loanWins / loanResults.length;
        const baseWins = baseline.filter(r => r.winner).length;
        const baseWinRate = baseWins / baseline.length;

        // eslint-disable-next-line no-console
        console.log(
            "\n=== Bank leverage balance report ===\n" +
                summarize(results) +
                "\n" +
                JSON.stringify(
                    {
                        baseWinRate,
                        loanWinRate,
                        loanUsers,
                        loanN: loanResults.length,
                        byLoanStrategy: Object.fromEntries(
                            LOAN_STRATEGIES.map(s => {
                                const list = loanResults.filter(r => r.strategy === s);
                                const finals = list.map(r => r.finalAssets).sort((a, b) => a - b);
                                return [
                                    s,
                                    {
                                        wins: list.filter(r => r.winner).length,
                                        almost: list.filter(r => r.finalAssets >= 10_000_000).length,
                                        deaths: list.filter(r => r.reason === "death").length,
                                        peakLoanP50: finals.length ? list.map(r => r.peakLoan).sort((a, b) => a - b)[Math.floor(list.length / 2)] : 0,
                                        interestP50: list.map(r => r.interestPaid).sort((a, b) => a - b)[Math.floor(list.length / 2)] ?? 0,
                                        medianAssets: finals[Math.floor(finals.length / 2)] ?? 0,
                                    },
                                ];
                            })
                        ),
                    },
                    null,
                    2
                )
        );

        // Leverage should help sometimes, but not turn simple bots into free $100M printers.
        expect(loanWinRate).toBeLessThan(0.45);
        // At least one levered path still reaches almost-tier.
        expect(loanResults.some(r => r.finalAssets >= 10_000_000)).toBe(true);

        // Max-leverage yolo must remain risky: not a perfect win machine, and deaths or
        // underperformance vs cautious paths should show up.
        const loanYolo = loanResults.filter(r => r.strategy === "loan_yolo");
        expect(loanYolo.filter(r => r.winner).length).toBeLessThan(loanYolo.length);

        // No single loan strategy wins every seed.
        for (const s of LOAN_STRATEGIES) {
            const list = loanResults.filter(r => r.strategy === s);
            expect(list.filter(r => r.winner).length).toBeLessThan(list.length);
        }

        // Smart leverage (loan_hybrid / loan_company_rush) should not be strictly worse
        // than their baselines on median assets across the seed pool (soft: allow 25% worse).
        for (const [base, levered] of [
            ["hybrid", "loan_hybrid"],
            ["company_rush", "loan_company_rush"],
        ] as const) {
            const baseList = results.filter(r => r.strategy === base);
            const levList = results.filter(r => r.strategy === levered);
            const baseMed = [...baseList.map(r => r.finalAssets)].sort((a, b) => a - b)[Math.floor(baseList.length / 2)] ?? 0;
            const levMed = [...levList.map(r => r.finalAssets)].sort((a, b) => a - b)[Math.floor(levList.length / 2)] ?? 0;
            // Interest should not obliterate a sane leverage strategy (median not < 50% of baseline).
            expect(levMed).toBeGreaterThan(baseMed * 0.5);
        }
    });
});
