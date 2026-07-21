import {describe, expect, it} from "vitest";
import {createInitialState, getRank, startGame} from "./engine";
import {START_AGE, START_CASH, START_HEALTH} from "./constants";

describe("scaffold engine", () => {
    it("createInitialState matches SPEC starting values", () => {
        const state = createInitialState(42);
        expect(state.phase).toBe("title");
        expect(state.age).toBe(START_AGE);
        expect(state.cash).toBe(START_CASH);
        expect(state.health).toBe(START_HEALTH);
        expect(state.reputation).toBe(0);
        expect(state.warehouseCapacity).toBe(100);
        expect(state.seed).toBe(42);
    });

    it("startGame leaves title phase", () => {
        const state = startGame(createInitialState(), 7);
        expect(state.phase).toBe("playing");
        expect(state.seed).toBe(7);
    });

    it("getRank uses SPEC thresholds", () => {
        expect(getRank(0).tier).toBe("bottom");
        expect(getRank(100_000).tier).toBe("middle");
        expect(getRank(10_000_000).tier).toBe("almost");
        expect(getRank(100_000_000).tier).toBe("winner");
    });
});
