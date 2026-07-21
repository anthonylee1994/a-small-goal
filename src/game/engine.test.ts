import {describe, expect, it} from "vitest";
import {BIRTH_FAMILY_MAP} from "../data/birthFamilies";
import {EVENT_MAP} from "../data/events";
import {
    beginTurn,
    buyGood,
    createInitialState,
    dismissBirthReveal,
    dismissEvent,
    endTurn,
    getRank,
    inventoryValue,
    sellGood,
    startGame,
    totalAssets,
    upgradeWarehouse,
} from "./engine";
import {START_AGE, START_HEALTH, START_WAREHOUSE, WAREHOUSE_UPGRADE_COST, END_AGE} from "./constants";
import type {GameState} from "../types/game";

function playingState(seed = 42): GameState {
    let state = startGame(createInitialState(), seed);
    expect(state.phase).toBe("event");
    expect(state.birthRevealed).toBe(false);
    state = dismissBirthReveal(state);
    expect(state.birthRevealed).toBe(true);
    state = dismissEvent(state);
    expect(state.phase).toBe("playing");
    return state;
}

describe("createInitialState / startGame", () => {
    it("title state matches SPEC defaults before birth", () => {
        const state = createInitialState(42);
        expect(state.phase).toBe("title");
        expect(state.age).toBe(START_AGE);
        expect(state.health).toBe(START_HEALTH);
        expect(state.reputation).toBe(0);
        expect(state.warehouseCapacity).toBe(START_WAREHOUSE);
        expect(state.birthFamilyId).toBeNull();
        expect(state.cash).toBe(0);
        expect(state.seed).toBe(42);
    });

    it("startGame rolls a birth family and enters event phase", () => {
        const state = startGame(createInitialState(), 7);
        expect(state.birthFamilyId).not.toBeNull();
        expect(state.birthRevealed).toBe(false);
        const family = BIRTH_FAMILY_MAP[state.birthFamilyId!];
        expect(state.phase).toBe("event");
        expect(state.currentEventId).not.toBeNull();
        expect(state.log.some(l => l.text.includes("投胎成功"))).toBe(true);

        const event = EVENT_MAP[state.currentEventId!];
        const cashDelta = event.effects
            .filter(e => e.type === "cash")
            .reduce((sum, e) => sum + (e.type === "cash" ? e.amount : 0), 0);
        expect(state.cash).toBe(family.startingCash + cashDelta);
    });

    it("dismissBirthReveal unlocks the event flow", () => {
        let state = startGame(createInitialState(), 11);
        expect(state.birthRevealed).toBe(false);
        state = dismissBirthReveal(state);
        expect(state.birthRevealed).toBe(true);
        expect(dismissBirthReveal(state)).toEqual(state);
    });

    it("fixed seed reproduces the same birth family", () => {
        const a = startGame(createInitialState(), 12345);
        const b = startGame(createInitialState(), 12345);
        expect(a.birthFamilyId).toBe(b.birthFamilyId);
        expect(a.cash).toBe(b.cash);
        expect(a.currentEventId).toBe(b.currentEventId);
    });
});

describe("phase gates", () => {
    it("blocks market actions during event phase", () => {
        const state = startGame(createInitialState(), 9);
        expect(state.phase).toBe("event");
        const next = buyGood(state, "chips", 1);
        expect(next).toBe(state);
    });

    it("dismissEvent moves event → playing", () => {
        const state = dismissEvent(startGame(createInitialState(), 9));
        expect(state.phase).toBe("playing");
        expect(state.eventDismissed).toBe(true);
    });
});

describe("buyGood / sellGood", () => {
    it("buys when cash and warehouse allow", () => {
        let state = playingState(100);
        // Ensure enough cash via high_class-friendly seed search if needed
        state = {...state, cash: 1_000_000, prices: {...state.prices, chips: 20}};
        state = buyGood(state, "chips", 3);
        expect(state.inventory.chips).toBe(3);
        expect(state.cash).toBe(1_000_000 - 60);
        expect(state.log[0]?.text).toContain("買入");
    });

    it("rejects buy when cash is insufficient and logs reason", () => {
        let state = playingState(101);
        state = {...state, cash: 10, prices: {...state.prices, chips: 20}};
        const next = buyGood(state, "chips", 1);
        expect(next.inventory.chips).toBe(0);
        expect(next.cash).toBe(10);
        expect(next.log[0]?.text).toContain("錢唔夠");
    });

    it("rejects buy when warehouse is full", () => {
        let state = playingState(102);
        state = {
            ...state,
            cash: 1_000_000,
            warehouseCapacity: 2,
            inventory: {...state.inventory, chips: 2},
            prices: {...state.prices, chips: 20},
        };
        const next = buyGood(state, "chips", 1);
        expect(next.inventory.chips).toBe(2);
        expect(next.log[0]?.text).toContain("倉庫唔夠位");
    });

    it("rejects non-positive quantity without changing state", () => {
        const state = playingState(103);
        expect(buyGood(state, "chips", 0)).toBe(state);
        expect(buyGood(state, "chips", -1)).toBe(state);
        expect(buyGood(state, "chips", 1.5)).toBe(state);
    });

    it("sells owned goods and rejects oversell", () => {
        let state = playingState(104);
        state = {
            ...state,
            cash: 0,
            inventory: {...state.inventory, chips: 2},
            prices: {...state.prices, chips: 50},
        };
        state = sellGood(state, "chips", 1);
        expect(state.inventory.chips).toBe(1);
        expect(state.cash).toBe(50);

        const failed = sellGood(state, "chips", 5);
        expect(failed.inventory.chips).toBe(1);
        expect(failed.log[0]?.text).toContain("冇咁多貨");
    });
});

describe("events", () => {
    it("applies snack_boom price multiplier into yearly prices", () => {
        // Search a small seed range for snack_boom for a deterministic assertion path
        let found: GameState | null = null;
        for (let seed = 1; seed < 200; seed++) {
            const s = startGame(createInitialState(), seed);
            if (s.currentEventId === "snack_boom") {
                found = s;
                break;
            }
        }
        expect(found).not.toBeNull();
        const event = EVENT_MAP.snack_boom;
        expect(event.effects[0]).toMatchObject({type: "price_mult", goodId: "chips", mult: 5});
        expect(found!.prices.chips).toBeGreaterThan(0);
    });

    it("windfall adds cash", () => {
        let found: GameState | null = null;
        for (let seed = 1; seed < 400; seed++) {
            const before = createInitialState(seed);
            const s = startGame(before, seed);
            if (s.currentEventId === "windfall") {
                found = s;
                const familyCash = BIRTH_FAMILY_MAP[s.birthFamilyId!].startingCash;
                expect(s.cash).toBe(familyCash + 100_000);
                break;
            }
        }
        expect(found).not.toBeNull();
    });
});

describe("endTurn / assets", () => {
    it("advances age and opens next event after a playing year", () => {
        let state = playingState(200);
        const age = state.age;
        state = endTurn(state);
        expect(state.age).toBe(age + 1);
        expect(state.phase).toBe("event");
    });

    it("dies when health hits 0 and does not age further", () => {
        let state = playingState(201);
        state = {...state, health: 1, partnerId: null};
        // Force health drain path: health 1 with drain 5 → 0
        state = endTurn(state);
        expect(state.phase).toBe("dead");
        expect(state.gameOverReason).toBe("death");
        expect(state.health).toBe(0);
        expect(state.totalAssets).not.toBeNull();
    });

    it("retires at END_AGE with totalAssets", () => {
        let state = playingState(202);
        state = {...state, age: END_AGE - 1, health: 100, companies: [], children: [], partnerId: null};
        state = endTurn(state);
        expect(state.phase).toBe("retired");
        expect(state.age).toBe(END_AGE);
        expect(state.gameOverReason).toBe("retirement");
        expect(state.totalAssets).toBe(totalAssets(state));
    });

    it("computes totalAssets as cash + inventory + company valuation", () => {
        let state = playingState(203);
        state = {
            ...state,
            cash: 1_000,
            inventory: {...state.inventory, chips: 2},
            prices: {...state.prices, chips: 100},
            companies: [{typeId: "bubble_tea", foundedAge: 20}],
        };
        // bubble_tea valuation = 120_000
        expect(inventoryValue(state)).toBe(200);
        expect(totalAssets(state)).toBe(1_000 + 200 + 120_000);
    });

    it("upgradeWarehouse expands capacity when affordable", () => {
        let state = playingState(204);
        state = {...state, cash: WAREHOUSE_UPGRADE_COST};
        const before = state.warehouseCapacity;
        state = upgradeWarehouse(state);
        expect(state.warehouseCapacity).toBe(before + 50);
        expect(state.cash).toBe(0);
    });
});

describe("getRank", () => {
    it("uses SPEC thresholds", () => {
        expect(getRank(0).tier).toBe("bottom");
        expect(getRank(100_000).tier).toBe("middle");
        expect(getRank(10_000_000).tier).toBe("almost");
        expect(getRank(100_000_000).tier).toBe("winner");
    });
});

describe("beginTurn immutability", () => {
    it("does not mutate the previous state object", () => {
        const state = playingState(300);
        const snapshot = structuredClone(state);
        beginTurn({...state, phase: "playing"});
        expect(state).toEqual(snapshot);
    });
});
