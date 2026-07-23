/**
 * Phase 3 balance harness — fixed-seed multi-strategy sims.
 * Run: pnpm exec vitest run src/game/balance.sim.test.ts
 */
import {COMPANIES} from "../data/companies";
import {GOODS} from "../data/goods";
import {PARTNERS} from "../data/partners";
import type {GameState, GoodId} from "../types/game";
import {ILLNESS_HEALTH_THRESHOLD} from "./constants";
import {
    buyGood,
    createInitialState,
    dismissBirthReveal,
    dismissEvent,
    endTurn,
    foundCompany,
    getCompanyFoundingCost,
    getDoctorFee,
    getUsedWarehouse,
    getWarehouseUpgradeCost,
    inflationFactor,
    marry,
    seeDoctor,
    sellGood,
    startGame,
    totalAssets,
    upgradeWarehouse,
} from "./engine";

export type StrategyId = "trade_only" | "company_rush" | "hybrid" | "high_tier_yolo" | "low_tier_scalp";

export interface Snapshot {
    age: number;
    assets: number;
    cash: number;
    companies: number;
}

export interface SimResult {
    seed: number;
    strategy: StrategyId;
    birthFamilyId: string | null;
    reason: "retirement" | "death" | "stuck";
    snapshots: Snapshot[];
    finalAssets: number;
    winner: boolean;
}

function snapshot(state: GameState): Snapshot {
    return {
        age: state.age,
        assets: totalAssets(state),
        cash: state.cash,
        companies: state.companies.length,
    };
}

function fairPrice(goodId: GoodId, age: number): number {
    const good = GOODS.find(g => g.id === goodId)!;
    return good.basePrice * inflationFactor(age);
}

function tryUpgradeWarehouse(state: GameState, reserve: number): GameState {
    let next = state;
    while (next.cash >= getWarehouseUpgradeCost(next.warehouseCapacity, next.birthFamilyId) + reserve && getUsedWarehouse(next) >= next.warehouseCapacity * 0.85) {
        const before = next.warehouseCapacity;
        next = upgradeWarehouse(next);
        if (next.warehouseCapacity === before) break;
    }
    return next;
}

function buyCheapGoods(state: GameState, goodIds: readonly GoodId[], buyBelow: number, reserve: number): GameState {
    let next = state;
    const ranked = [...goodIds]
        .map(id => {
            const fair = fairPrice(id, next.age);
            const price = next.prices[id] ?? Infinity;
            return {id, ratio: price / fair, price};
        })
        .filter(g => g.ratio <= buyBelow)
        .sort((a, b) => a.ratio - b.ratio);

    for (const g of ranked) {
        const free = next.warehouseCapacity - getUsedWarehouse(next);
        if (free <= 0) break;
        const budget = Math.max(0, next.cash - reserve);
        const maxByCash = Math.floor(budget / g.price);
        const qty = Math.min(free, maxByCash);
        if (qty <= 0) continue;
        next = buyGood(next, g.id, qty);
    }
    return next;
}

function sellExpensiveGoods(state: GameState, sellAbove: number): GameState {
    let next = state;
    for (const good of GOODS) {
        const qty = next.inventory[good.id] ?? 0;
        if (qty <= 0) continue;
        const fair = fairPrice(good.id, next.age);
        const price = next.prices[good.id] ?? 0;
        if (price / fair >= sellAbove) {
            next = sellGood(next, good.id, qty);
        }
    }
    return next;
}

function foundAffordableCompanies(state: GameState, reserve: number, maxPerYear = 2): GameState {
    let next = state;
    let founded = 0;
    const sorted = [...COMPANIES].sort((a, b) => a.cost - b.cost);
    for (const company of sorted) {
        if (founded >= maxPerYear) break;
        if (next.companies.some(c => c.typeId === company.id)) continue;
        if (next.reputation < company.minReputation) continue;
        const foundingCost = getCompanyFoundingCost(next, company.id);
        if (next.cash < foundingCost + reserve) continue;
        const before = next.companies.length;
        next = foundCompany(next, company.id);
        if (next.companies.length > before) founded += 1;
    }
    return next;
}

function tryMarry(state: GameState, reserve: number): GameState {
    if (state.partnerId) return state;
    const affordable = [...PARTNERS].filter(p => state.cash >= p.weddingCost + (p.requireCash ?? 0) + reserve).sort((a, b) => b.weddingCost - a.weddingCost);
    for (const partner of affordable) {
        const next = marry(state, partner.id);
        if (next.partnerId) return next;
    }
    return state;
}

const CHEAP_GOODS: GoodId[] = ["chips", "vitasoy"];
const MID_GOODS: GoodId[] = ["phone", "sneakers"];
const EXPENSIVE_GOODS: GoodId[] = ["bitcoin", "gold", "ev", "options"];
const ALL_GOODS: GoodId[] = GOODS.map(g => g.id);

/** Heal when near illness threshold if affordable; keep a cash reserve for trading. */
function trySeeDoctor(state: GameState, reserve: number): GameState {
    if (state.health >= ILLNESS_HEALTH_THRESHOLD + 10) return state;
    const fee = getDoctorFee(state);
    if (state.cash < fee + reserve) return state;
    return seeDoctor(state);
}

function playTurn(state: GameState, strategy: StrategyId): GameState {
    let next = state;
    // Pay for full heal before risking year-end illness / death (fee is a real cost now).
    next = trySeeDoctor(next, strategy === "low_tier_scalp" ? 2_000 : 15_000);

    switch (strategy) {
        case "trade_only":
            next = sellExpensiveGoods(next, 1.25);
            next = tryUpgradeWarehouse(next, 20_000);
            next = buyCheapGoods(next, ALL_GOODS, 0.85, 10_000);
            break;
        case "company_rush":
            next = sellExpensiveGoods(next, 1.15);
            // Keep a small trading float so early shops can bootstrap without pure cash luck.
            next = buyCheapGoods(next, [...MID_GOODS, ...EXPENSIVE_GOODS], 0.85, 40_000);
            next = foundAffordableCompanies(next, 20_000, 2);
            next = tryMarry(next, 40_000);
            next = sellExpensiveGoods(next, 1.25);
            next = foundAffordableCompanies(next, 20_000, 2);
            break;
        case "hybrid":
            next = trySeeDoctor(next, 25_000);
            next = sellExpensiveGoods(next, 1.2);
            next = tryUpgradeWarehouse(next, 40_000);
            next = buyCheapGoods(next, [...MID_GOODS, ...EXPENSIVE_GOODS, ...CHEAP_GOODS], 0.88, 40_000);
            next = foundAffordableCompanies(next, 60_000, 1);
            next = tryMarry(next, 100_000);
            next = sellExpensiveGoods(next, 1.25);
            break;
        case "high_tier_yolo":
            next = sellExpensiveGoods(next, 1.15);
            next = tryUpgradeWarehouse(next, 100_000);
            next = buyCheapGoods(next, EXPENSIVE_GOODS, 0.88, 30_000);
            next = foundAffordableCompanies(next, 200_000, 1);
            break;
        case "low_tier_scalp":
            next = sellExpensiveGoods(next, 1.2);
            next = tryUpgradeWarehouse(next, 5_000);
            next = buyCheapGoods(next, CHEAP_GOODS, 0.9, 2_000);
            next = foundAffordableCompanies(next, 20_000, 1);
            break;
    }

    return next;
}

export function runSim(seed: number, strategy: StrategyId): SimResult {
    let state = startGame(createInitialState(), seed);
    state = dismissBirthReveal(state);
    const birthFamilyId = state.birthFamilyId;
    const snapshots: Snapshot[] = [];

    const captureAges = new Set([20, 40, 60]);

    while (state.phase !== "dead" && state.phase !== "retired") {
        if (state.phase === "event") {
            state = dismissEvent(state);
        }
        if (state.phase !== "playing") break;

        if (captureAges.has(state.age)) {
            snapshots.push(snapshot(state));
        }

        state = playTurn(state, strategy);
        state = endTurn(state);
    }

    if (state.age === 60 || state.phase === "retired") {
        const final = snapshot({...state, age: 60});
        if (!snapshots.some(s => s.age === 60)) snapshots.push(final);
    }

    const finalAssets = state.totalAssets ?? totalAssets(state);
    return {
        seed,
        strategy,
        birthFamilyId,
        reason: state.phase === "dead" ? "death" : state.phase === "retired" ? "retirement" : "stuck",
        snapshots,
        finalAssets,
        winner: finalAssets >= 100_000_000,
    };
}

function pct(arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    return arr[Math.min(arr.length - 1, Math.floor((arr.length - 1) * p))] ?? 0;
}

function mean(arr: number[]): number {
    return arr.length ? arr.reduce((s, n) => s + n, 0) / arr.length : 0;
}

function fmtMoney(n: number): string {
    return `$${Math.round(n).toLocaleString("en-US")}`;
}

function summarizeList(label: string, list: SimResult[]): string {
    const finals = list.map(r => r.finalAssets).sort((a, b) => a - b);
    const at = (age: number) =>
        list
            .map(r => r.snapshots.find(s => s.age === age)?.assets ?? null)
            .filter((v): v is number => v != null)
            .sort((a, b) => a - b);

    const a20 = at(20);
    const a40 = at(40);
    const a60 = at(60);
    const wins = list.filter(r => r.winner).length;
    const almost = list.filter(r => r.finalAssets >= 10_000_000).length;
    const deaths = list.filter(r => r.reason === "death").length;

    return [
        label,
        `n=${list.length}`,
        `win=${wins}`,
        `almost10M=${almost}`,
        `death=${deaths}`,
        `final mean=${fmtMoney(mean(finals))} p50=${fmtMoney(pct(finals, 0.5))} p90=${fmtMoney(pct(finals, 0.9))}`,
        `age20 p50=${fmtMoney(pct(a20, 0.5))}`,
        `age40 p50=${fmtMoney(pct(a40, 0.5))}`,
        `age60 p50=${fmtMoney(pct(a60, 0.5))}`,
    ].join(" | ");
}

export function summarize(results: SimResult[]) {
    const lines: string[] = [];

    lines.push("--- by strategy ---");
    for (const strategy of BALANCE_STRATEGIES) {
        lines.push(
            summarizeList(
                strategy,
                results.filter(r => r.strategy === strategy)
            )
        );
    }

    lines.push("--- by birth family ---");
    for (const family of ["low_class", "middle_class", "high_class"] as const) {
        lines.push(
            summarizeList(
                family,
                results.filter(r => r.birthFamilyId === family)
            )
        );
    }

    const totalWins = results.filter(r => r.winner).length;
    const totalDeaths = results.filter(r => r.reason === "death").length;
    lines.push(`--- overall | n=${results.length} | win=${totalWins} (${((totalWins / Math.max(1, results.length)) * 100).toFixed(1)}%) | death=${totalDeaths} ---`);

    return lines.join("\n");
}

/**
 * Fixed seeds for Phase 3 acceptance (≥20).
 * Broader pool so birth-family stratified reports are less skewed.
 */
export const BALANCE_SEEDS = [101, 202, 303, 404, 505, 606, 707, 808, 909, 1010, 1111, 1212, 1313, 1414, 1515, 1616, 1717, 1818, 1919, 2020, 2121, 2222, 2323, 2424] as const;

export const BALANCE_STRATEGIES: StrategyId[] = ["trade_only", "company_rush", "hybrid", "high_tier_yolo", "low_tier_scalp"];
