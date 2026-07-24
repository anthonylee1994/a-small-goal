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
    repayLoan,
    seeDoctor,
    sellCompanyShares,
    sellGood,
    startGame,
    takeLoan,
    upgradeWarehouse,
} from "@/game/engine";
import {awardRun, buyUpgrade, createDefaultMeta, getStartBonuses, normalizeMeta} from "@/meta/prosperity";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "@/types/game";
import type {MetaProgress, ProsperityUpgradeId} from "@/types/meta";

export type UiScreen = "title" | "prosperity";

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
    takeLoan: (amount: number) => void;
    repayLoan: (amount: number) => void;
    endTurn: () => void;
    openProsperity: () => void;
    closeProsperity: () => void;
    buyProsperityUpgrade: (id: ProsperityUpgradeId) => void;
}

export type GameStore = {
    game: GameState;
    meta: MetaProgress;
    /** Title sub-navigation; not persisted. */
    uiScreen: UiScreen;
    /** Points earned when the last run finished (for Settlement UI); not persisted. */
    lastRunPointsEarned: number | null;
} & GameActions;

const STORAGE_KEY = "a-small-goal-game";

function maybeAward(game: GameState, meta: MetaProgress): {meta: MetaProgress; lastRunPointsEarned: number | null} {
    if (game.phase !== "dead" && game.phase !== "retired") {
        return {meta, lastRunPointsEarned: null};
    }
    const result = awardRun(meta, game);
    if (result.alreadyAwarded) {
        return {meta: result.meta, lastRunPointsEarned: null};
    }
    return {meta: result.meta, lastRunPointsEarned: result.earned};
}

export const useGameStore = create<GameStore>()(
    persist(
        set => ({
            game: createInitialState(),
            meta: createDefaultMeta(),
            uiScreen: "title",
            lastRunPointsEarned: null,

            start: (seed, options) =>
                set(s => {
                    const bonuses = getStartBonuses(s.meta);
                    return {
                        game: startGame(s.game, seed, {
                            easyMode: options?.easyMode,
                            meta: bonuses,
                        }),
                        uiScreen: "title",
                        lastRunPointsEarned: null,
                    };
                }),

            restart: () =>
                set({
                    game: createInitialState(),
                    uiScreen: "title",
                    lastRunPointsEarned: null,
                }),

            suicide: () =>
                set(s => {
                    const game = commitSuicide(s.game);
                    const awarded = maybeAward(game, s.meta);
                    return {
                        game,
                        meta: awarded.meta,
                        lastRunPointsEarned: awarded.lastRunPointsEarned ?? s.lastRunPointsEarned,
                    };
                }),

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
            takeLoan: amount => set(s => ({game: takeLoan(s.game, amount)})),
            repayLoan: amount => set(s => ({game: repayLoan(s.game, amount)})),

            endTurn: () =>
                set(s => {
                    const game = endTurn(s.game);
                    const awarded = maybeAward(game, s.meta);
                    return {
                        game,
                        meta: awarded.meta,
                        lastRunPointsEarned: awarded.lastRunPointsEarned ?? s.lastRunPointsEarned,
                    };
                }),

            openProsperity: () => set({uiScreen: "prosperity"}),
            closeProsperity: () => set({uiScreen: "title"}),

            buyProsperityUpgrade: id =>
                set(s => ({
                    meta: buyUpgrade(s.meta, id),
                })),
        }),
        {
            name: STORAGE_KEY,
            partialize: state => ({game: state.game, meta: state.meta}),
            merge: (persisted, current) => {
                const p = persisted as Partial<GameStore> | undefined;
                if (!p) return current;
                const game = p.game ? normalizeGameState(p.game as GameState) : current.game;
                let meta = normalizeMeta(p.meta);
                let lastRunPointsEarned: number | null = null;
                // Catch finished runs that never received meta points (older clients / crash).
                if (game.phase === "dead" || game.phase === "retired") {
                    const awarded = maybeAward(game, meta);
                    meta = awarded.meta;
                    lastRunPointsEarned = awarded.lastRunPointsEarned;
                }
                return {
                    ...current,
                    ...p,
                    game,
                    meta,
                    uiScreen: "title" as const,
                    lastRunPointsEarned,
                };
            },
        }
    )
);
