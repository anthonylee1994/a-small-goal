import {create} from "zustand";
import {persist} from "zustand/middleware";
import {
    buyCompanyShares,
    buyGood,
    commitSuicide,
    createInitialState,
    chooseEvent,
    dismissBirthReveal,
    dismissEvent,
    dismissTurnSummary,
    donate,
    endTurn,
    foundCompany,
    marry,
    normalizeGameState,
    seeDoctor,
    sellCompanyShares,
    sellGood,
    startGame,
    upgradeWarehouse,
} from "@/game/engine";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "@/types/game";

interface GameActions {
    start: (seed?: number, options?: {easyMode?: boolean}) => void;
    restart: () => void;
    suicide: () => void;
    dismissBirthReveal: () => void;
    chooseEvent: (choiceId: string) => void;
    dismissEvent: () => void;
    dismissTurnSummary: () => void;
    buy: (goodId: GoodId, quantity: number) => void;
    sell: (goodId: GoodId, quantity: number) => void;
    upgradeWarehouse: () => void;
    foundCompany: (companyId: CompanyTypeId) => void;
    buyCompanyShares: (companyId: CompanyTypeId, shares: number) => void;
    sellCompanyShares: (companyId: CompanyTypeId, shares: number) => void;
    marry: (partnerId: PartnerId) => void;
    seeDoctor: () => void;
    donate: () => void;
    endTurn: () => void;
}

export type GameStore = {
    game: GameState;
} & GameActions;

const STORAGE_KEY = "a-small-goal-game";

export const useGameStore = create<GameStore>()(
    persist(
        set => ({
            game: createInitialState(),

            start: (seed, options) => set(s => ({game: startGame(s.game, seed, options)})),
            restart: () => set({game: createInitialState()}),
            suicide: () => set(s => ({game: commitSuicide(s.game)})),
            dismissBirthReveal: () => set(s => ({game: dismissBirthReveal(s.game)})),
            chooseEvent: choiceId => set(s => ({game: chooseEvent(s.game, choiceId)})),
            dismissEvent: () => set(s => ({game: dismissEvent(s.game)})),
            dismissTurnSummary: () => set(s => ({game: dismissTurnSummary(s.game)})),
            buy: (goodId, quantity) => set(s => ({game: buyGood(s.game, goodId, quantity)})),
            sell: (goodId, quantity) => set(s => ({game: sellGood(s.game, goodId, quantity)})),
            upgradeWarehouse: () => set(s => ({game: upgradeWarehouse(s.game)})),
            foundCompany: companyId => set(s => ({game: foundCompany(s.game, companyId)})),
            buyCompanyShares: (companyId, shares) => set(s => ({game: buyCompanyShares(s.game, companyId, shares)})),
            sellCompanyShares: (companyId, shares) => set(s => ({game: sellCompanyShares(s.game, companyId, shares)})),
            marry: partnerId => set(s => ({game: marry(s.game, partnerId)})),
            seeDoctor: () => set(s => ({game: seeDoctor(s.game)})),
            donate: () => set(s => ({game: donate(s.game)})),
            endTurn: () => set(s => ({game: endTurn(s.game)})),
        }),
        {
            name: STORAGE_KEY,
            partialize: state => ({game: state.game}),
            merge: (persisted, current) => {
                const p = persisted as Partial<GameStore> | undefined;
                if (!p?.game) return current;
                return {
                    ...current,
                    ...p,
                    game: normalizeGameState(p.game as GameState),
                };
            },
        }
    )
);
