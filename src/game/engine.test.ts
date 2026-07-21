import {describe, expect, it} from "vitest";
import {BIRTH_FAMILY_MAP} from "../data/birthFamilies";
import {EVENT_MAP} from "../data/events";
import {
    beginTurn,
    buyCompanyShares,
    buyGood,
    createInitialState,
    dismissBirthReveal,
    dismissEvent,
    endTurn,
    fairUnitPrice,
    foundCompany,
    getCompanySharePrice,
    getDoctorFee,
    getRank,
    holdingCostTotal,
    holdingUnitCost,
    inventoryValue,
    priceSignal,
    seeDoctor,
    sellCompanyShares,
    sellGood,
    softenCashLoss,
    startGame,
    totalAssets,
    upgradeWarehouse,
} from "./engine";
import {COMPANY_TOTAL_SHARES, DOCTOR_BASE_FEE, DOCTOR_FEE_CAP, DOCTOR_HEALTH_RESTORE, DOCTOR_WEALTH_RATE, START_AGE, START_HEALTH, START_WAREHOUSE, WAREHOUSE_UPGRADE_COST, END_AGE} from "./constants";
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
        const rawCash = event.effects.filter(e => e.type === "cash").reduce((sum, e) => sum + (e.type === "cash" ? e.amount : 0), 0);
        const cashDelta = softenCashLoss(rawCash, family.startingCash, false);
        expect(state.cash).toBe(family.startingCash + cashDelta);
        expect(state.easyMode).toBe(false);
        expect(state.milestonesUnlocked).toEqual([]);
    });

    it("startGame can enable easy mode", () => {
        const state = startGame(createInitialState(), 7, {easyMode: true});
        expect(state.easyMode).toBe(true);
        expect(state.log.some(l => l.text.includes("簡易模式"))).toBe(true);
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
        expect(holdingCostTotal(state, "chips")).toBe(60);
        expect(holdingUnitCost(state, "chips")).toBe(20);
        expect(state.log.some(l => l.text.includes("買入"))).toBe(true);
    });

    it("tracks weighted average holding cost across buys and sells", () => {
        let state = {...playingState(105), cash: 1_000_000, prices: {...playingState(105).prices, chips: 10}};
        state = buyGood(state, "chips", 2); // cost 20
        state = {...state, prices: {...state.prices, chips: 30}};
        state = buyGood(state, "chips", 2); // cost +60 → total 80 for 4
        expect(holdingCostTotal(state, "chips")).toBe(80);
        expect(holdingUnitCost(state, "chips")).toBe(20);
        state = {...state, prices: {...state.prices, chips: 40}};
        state = sellGood(state, "chips", 2); // half cost 40, revenue 80, pnl +40
        expect(state.inventory.chips).toBe(2);
        expect(holdingCostTotal(state, "chips")).toBe(40);
        expect(state.log.some(l => l.text.includes("帳面賺"))).toBe(true);
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
        expect(event.effects[0]).toMatchObject({type: "price_mult", goodId: "chips", mult: 2.5});
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
                expect(s.cash).toBe(familyCash + 50_000);
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

    it("goes bankrupt when cash stays negative after liquidation", () => {
        let state = playingState(205);
        state = {
            ...state,
            cash: -50_000,
            health: 100,
            inventory: Object.fromEntries(Object.keys(state.inventory).map(id => [id, 0])) as typeof state.inventory,
            companies: [],
            children: [],
            partnerId: null,
        };
        state = endTurn(state);
        expect(state.phase).toBe("dead");
        expect(state.gameOverReason).toBe("bankruptcy");
        expect(state.cash).toBeLessThan(0);
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

    it("computes totalAssets as cash + inventory + company stake market value", () => {
        let state = playingState(203);
        const sharePrice = 1_400; // 100 shares → market cap 140_000
        state = {
            ...state,
            cash: 1_000,
            inventory: {...state.inventory, chips: 2},
            prices: {...state.prices, chips: 100},
            companySharePrices: {...state.companySharePrices, bubble_tea: sharePrice},
            companies: [{typeId: "bubble_tea", foundedAge: 20, shares: COMPANY_TOTAL_SHARES, costBasis: 80_000}],
        };
        expect(inventoryValue(state)).toBe(200);
        expect(totalAssets(state)).toBe(1_000 + 200 + sharePrice * COMPANY_TOTAL_SHARES);
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

describe("softenCashLoss / priceSignal", () => {
    it("caps negative cash losses against balance and reserve", () => {
        expect(softenCashLoss(-40_000, 10_000, false)).toBe(-5_000);
        expect(softenCashLoss(-40_000, 10_000, true)).toBe(-5_000);
        expect(softenCashLoss(-10_000, 100_000, false)).toBe(-10_000);
        expect(softenCashLoss(-10_000, 100_000, true)).toBe(-5_000);
        expect(softenCashLoss(8_888, 1_000, false)).toBe(8_888);
    });

    it("labels prices cheap / fair / expensive vs fair unit", () => {
        const fair = fairUnitPrice("chips", START_AGE);
        expect(priceSignal(Math.round(fair * 0.8), fair)).toBe("cheap");
        expect(priceSignal(fair, fair)).toBe("fair");
        expect(priceSignal(Math.round(fair * 1.3), fair)).toBe("expensive");
    });
});

describe("foundCompany first success + refund", () => {
    it("guarantees the first founding attempt", () => {
        let state = {...playingState(501), cash: 1_000_000, companyFoundAttempts: 0, reputation: 0};
        state = foundCompany(state, "bubble_tea");
        expect(state.companies.some(c => c.typeId === "bubble_tea")).toBe(true);
        expect(state.companies[0]?.shares).toBe(COMPANY_TOTAL_SHARES);
        expect(state.companyFoundAttempts).toBe(1);
        expect(state.milestonesUnlocked).toContain("first_company");
    });

    it("re-rolls founding RNG on each attempt instead of replaying the same seed", () => {
        // Same seed/age, different companyFoundAttempts must not freeze on one outcome forever.
        const base = {...playingState(777), cash: 50_000_000, reputation: 50, companies: []};
        const results: boolean[] = [];
        for (let attempt = 1; attempt <= 40; attempt += 1) {
            const next = foundCompany({...base, companyFoundAttempts: attempt}, "crypto_exchange");
            results.push(next.companies.some(c => c.typeId === "crypto_exchange"));
        }
        expect(results.some(Boolean)).toBe(true);
        expect(results.some(r => !r)).toBe(true);
    });

    it("keeps newly founded companies through grace period endTurns", () => {
        let state = {...playingState(502), cash: 1_000_000, companyFoundAttempts: 0, reputation: 0, health: 100};
        state = foundCompany(state, "bubble_tea");
        expect(state.companies).toHaveLength(1);
        const foundedAge = state.age;
        // Two year-ends during grace (COMPANY_COLLAPSE_GRACE_YEARS = 2) must not wipe the shop.
        state = endTurn(state);
        if (state.phase === "event") state = dismissEvent(state);
        expect(state.companies.some(c => c.typeId === "bubble_tea")).toBe(true);
        state = endTurn(state);
        if (state.phase === "event") state = dismissEvent(state);
        expect(state.companies.some(c => c.typeId === "bubble_tea")).toBe(true);
        expect(state.age).toBe(foundedAge + 2);
    });
});

describe("company shares buy / sell", () => {
    it("sells part of stake and scales remaining ownership", () => {
        let state = {...playingState(601), cash: 1_000_000, companyFoundAttempts: 0, reputation: 0};
        state = foundCompany(state, "bubble_tea");
        const price = getCompanySharePrice(state, "bubble_tea");
        const cashBefore = state.cash;
        state = sellCompanyShares(state, "bubble_tea", 40);
        expect(state.companies[0]?.shares).toBe(60);
        expect(state.cash).toBe(cashBefore + price * 40);
    });

    it("buys back shares up to 100% and rejects when full", () => {
        let state = {...playingState(602), cash: 5_000_000, companyFoundAttempts: 0, reputation: 0};
        state = foundCompany(state, "bubble_tea");
        state = sellCompanyShares(state, "bubble_tea", 50);
        expect(state.companies[0]?.shares).toBe(50);
        state = buyCompanyShares(state, "bubble_tea", 50);
        expect(state.companies[0]?.shares).toBe(100);
        const blocked = buyCompanyShares(state, "bubble_tea", 1);
        expect(blocked.companies[0]?.shares).toBe(100);
        expect(blocked.log[0]?.text).toContain("100%");
    });

    it("selling all shares removes the company", () => {
        let state = {...playingState(603), cash: 1_000_000, companyFoundAttempts: 0, reputation: 0};
        state = foundCompany(state, "bubble_tea");
        state = sellCompanyShares(state, "bubble_tea", COMPANY_TOTAL_SHARES);
        expect(state.companies).toHaveLength(0);
    });
});

describe("seeDoctor", () => {
    it("charges more when assets are higher but respects fee cap", () => {
        const poor = {...playingState(400), cash: 50_000, inventory: {...playingState(400).inventory}};
        const rich = {...playingState(401), cash: 5_000_000};
        expect(getDoctorFee(rich)).toBeGreaterThan(getDoctorFee(poor));
        expect(getDoctorFee(poor)).toBeGreaterThanOrEqual(DOCTOR_BASE_FEE);
        const uncapped = Math.round(DOCTOR_BASE_FEE + totalAssets(rich) * DOCTOR_WEALTH_RATE);
        expect(getDoctorFee(rich)).toBe(Math.min(DOCTOR_FEE_CAP, Math.max(DOCTOR_BASE_FEE, uncapped)));
        expect(getDoctorFee(rich)).toBeLessThanOrEqual(DOCTOR_FEE_CAP);
    });

    it("restores health and deducts fee", () => {
        let state = {...playingState(402), health: 40, cash: 1_000_000};
        const fee = getDoctorFee(state);
        const before = state.health;
        state = seeDoctor(state);
        expect(state.cash).toBe(1_000_000 - fee);
        expect(state.health).toBe(Math.min(100, before + DOCTOR_HEALTH_RESTORE));
    });

    it("does nothing when already full health", () => {
        const state = {...playingState(403), health: 100, cash: 1_000_000};
        const next = seeDoctor(state);
        expect(next).toBe(state);
        expect(next.cash).toBe(state.cash);
        expect(next.health).toBe(100);
    });

    it("does not charge or log when cash is insufficient", () => {
        const state = {...playingState(404), health: 40, cash: 100};
        const next = seeDoctor(state);
        expect(next).toBe(state);
        expect(next.cash).toBe(100);
        expect(next.health).toBe(40);
    });
});
