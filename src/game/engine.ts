import type {EventId, GameState, GoodId, Rank, RankTier} from "../types/game";
import {END_AGE, START_AGE, START_CASH, START_HEALTH, START_REPUTATION, START_WAREHOUSE} from "./constants";

const GOOD_IDS: GoodId[] = ["chips", "vitasoy", "phone", "sneakers", "bitcoin", "gold", "ev", "options"];

function emptyInventory(): Record<GoodId, number> {
    return Object.fromEntries(GOOD_IDS.map(id => [id, 0])) as Record<GoodId, number>;
}

function emptyPrices(): Record<GoodId, number> {
    return Object.fromEntries(GOOD_IDS.map(id => [id, 0])) as Record<GoodId, number>;
}

/** Scaffold-only initial state. Full turn loop lands in Phase 1. */
export function createInitialState(seed?: number): GameState {
    return {
        phase: "title",
        age: START_AGE,
        cash: START_CASH,
        health: START_HEALTH,
        reputation: START_REPUTATION,
        warehouseCapacity: START_WAREHOUSE,
        inventory: emptyInventory(),
        prices: emptyPrices(),
        companies: [],
        partnerId: null,
        children: [],
        currentEventId: null,
        eventDismissed: false,
        debtTurns: 0,
        totalAssets: null,
        gameOverReason: null,
        log: [
            {
                id: "boot",
                age: START_AGE,
                text: "你 20 歲出社會，口袋得 HK$10,000。目標：60 歲前賺夠 1 億。",
                tone: "info",
            },
        ],
        seed,
    };
}

export function startGame(state: GameState, seed?: number): GameState {
    const nextSeed = seed ?? state.seed ?? Date.now();
    return {
        ...createInitialState(nextSeed),
        phase: "playing",
        seed: nextSeed,
    };
}

export function beginTurn(state: GameState): GameState {
    return state;
}

export function dismissEvent(state: GameState): GameState {
    if (state.phase !== "event") return state;
    return {...state, phase: "playing", eventDismissed: true};
}

export function buyGood(state: GameState, _goodId: GoodId, _quantity: number): GameState {
    return state;
}

export function sellGood(state: GameState, _goodId: GoodId, _quantity: number): GameState {
    return state;
}

export function upgradeWarehouse(state: GameState): GameState {
    return state;
}

export function foundCompany(state: GameState, _companyId: string): GameState {
    return state;
}

export function marry(state: GameState, _partnerId: string): GameState {
    return state;
}

export function endTurn(state: GameState): GameState {
    return state;
}

export function totalAssets(state: GameState): number {
    return state.cash;
}

export function getRank(assets: number): Rank {
    let tier: RankTier;
    let title: string;
    let message: string;

    if (assets >= 100_000_000) {
        tier = "winner";
        title = "小目標達成！";
        message = "人生贏家，可以隨便開香檳。";
    } else if (assets >= 10_000_000) {
        tier = "almost";
        title = "半隻腳上岸";
        message = "財富自由近在眼前，但仲未完成目標。";
    } else if (assets >= 100_000) {
        tier = "middle";
        title = "平凡中產";
        message = "叫做好過人，勉強買到個兩房單位。";
    } else {
        tier = "bottom";
        title = "底層黎生";
        message = "你呢一生人都係幫老細供樓。";
    }

    return {tier, title, message};
}

export function isRetiredAge(age: number): boolean {
    return age >= END_AGE;
}

export type {EventId};
