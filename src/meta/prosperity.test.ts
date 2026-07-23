import {describe, expect, it} from "vitest";
import {END_AGE, START_WAREHOUSE} from "../game/constants";
import {createInitialState, startGame, dismissBirthReveal, dismissEvent} from "../game/engine";
import type {GameState} from "../types/game";
import {awardRun, buyUpgrade, canBuyUpgrade, computeRunPoints, createDefaultMeta, getStartBonuses, getUpgradeCost, normalizeMeta, runKey} from "./prosperity";

function finishedRetired(): GameState {
    let state = startGame(createInitialState(), 42, {easyMode: false});
    state = dismissBirthReveal(state);
    // Force a retired state for award tests.
    return {
        ...state,
        phase: "retired",
        gameOverReason: "retirement",
        age: 60,
        cash: 12_000_000,
        totalAssets: 12_000_000,
        easyMode: false,
    };
}

describe("prosperity upgrades", () => {
    it("createDefaultMeta starts empty", () => {
        const meta = createDefaultMeta();
        expect(meta.points).toBe(0);
        expect(meta.levels.start_cash).toBe(0);
        expect(getStartBonuses(meta).endAge).toBe(END_AGE);
        expect(getStartBonuses(meta).warehouseBonus).toBe(0);
    });

    it("normalizeMeta clamps levels and fills defaults", () => {
        const meta = normalizeMeta({
            points: -5,
            levels: {start_cash: 99, start_reputation: -1, start_warehouse: 2, retire_age: 3},
        } as never);
        expect(meta.points).toBe(0);
        expect(meta.levels.start_cash).toBe(10);
        expect(meta.levels.start_reputation).toBe(0);
        expect(meta.levels.start_warehouse).toBe(2);
        expect(meta.levels.retire_age).toBe(3);
    });

    it("upgrade cost grows and buy spends points", () => {
        let meta = createDefaultMeta();
        meta = {...meta, points: 500};
        expect(getUpgradeCost(meta, "start_cash")).toBe(20);
        meta = buyUpgrade(meta, "start_cash");
        expect(meta.levels.start_cash).toBe(1);
        expect(meta.points).toBe(480);
        expect(getUpgradeCost(meta, "start_cash")).toBe(35);
        expect(getStartBonuses(meta).cashBonus).toBe(15_000);
    });

    it("blocks buy when broke or maxed", () => {
        let meta = createDefaultMeta();
        expect(canBuyUpgrade(meta, "start_cash")).toContain("積分唔夠");
        meta = {...meta, points: 9999, levels: {...meta.levels, start_cash: 10}};
        expect(canBuyUpgrade(meta, "start_cash")).toBe("已滿級");
        expect(buyUpgrade(meta, "start_cash")).toEqual(meta);
    });

    it("retire_age and warehouse bonuses stack", () => {
        const meta = normalizeMeta({
            levels: {start_cash: 0, start_reputation: 2, start_warehouse: 3, retire_age: 5},
        });
        const b = getStartBonuses(meta);
        expect(b.reputationBonus).toBe(6);
        expect(b.warehouseBonus).toBe(60);
        expect(b.endAge).toBe(END_AGE + 5);
        expect(START_WAREHOUSE + b.warehouseBonus).toBe(160);
    });
});

describe("prosperity awards", () => {
    it("computes at least 1 point for a finished run", () => {
        const game = finishedRetired();
        expect(computeRunPoints(game)).toBeGreaterThanOrEqual(1);
    });

    it("easy mode reduces points", () => {
        const hard = finishedRetired();
        const easy = {...hard, easyMode: true};
        expect(computeRunPoints(easy)).toBeLessThan(computeRunPoints(hard));
    });

    it("awardRun adds points once per runKey", () => {
        const game = finishedRetired();
        let meta = createDefaultMeta();
        const first = awardRun(meta, game);
        expect(first.alreadyAwarded).toBe(false);
        expect(first.earned).toBeGreaterThan(0);
        expect(first.meta.points).toBe(first.earned);
        expect(first.meta.lastAwardedRunKey).toBe(runKey(game));

        const second = awardRun(first.meta, game);
        expect(second.alreadyAwarded).toBe(true);
        expect(second.earned).toBe(0);
        expect(second.meta.points).toBe(first.meta.points);
    });

    it("does not award mid-run", () => {
        let state = startGame(createInitialState(), 7);
        state = dismissBirthReveal(state);
        if (state.phase === "event") state = dismissEvent(state);
        const result = awardRun(createDefaultMeta(), state);
        expect(result.earned).toBe(0);
        expect(result.meta.points).toBe(0);
    });

    it("awards 0 points for suicide at starting age (reroll without playing)", () => {
        let state = startGame(createInitialState(), 99);
        state = dismissBirthReveal(state);
        if (state.phase === "event") state = dismissEvent(state);
        const suicide: GameState = {
            ...state,
            phase: "dead",
            gameOverReason: "suicide",
            age: 20,
            health: 0,
            totalAssets: state.cash,
        };
        expect(computeRunPoints(suicide)).toBe(0);
        const result = awardRun(createDefaultMeta(), suicide);
        expect(result.earned).toBe(0);
        expect(result.meta.points).toBe(0);
        expect(result.meta.lifetimePointsEarned).toBe(0);
    });

    it("still awards points for suicide after surviving past starting age", () => {
        const suicide: GameState = {
            ...finishedRetired(),
            phase: "dead",
            gameOverReason: "suicide",
            age: 35,
            health: 0,
            totalAssets: 500_000,
        };
        expect(computeRunPoints(suicide)).toBeGreaterThan(0);
    });
});
