import {create} from "zustand";
import {buyGood, createInitialState, dismissBirthReveal, dismissEvent, endTurn, foundCompany, marry, sellGood, startGame, upgradeWarehouse} from "@/game/engine";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "@/types/game";

interface GameActions {
    start: (seed?: number) => void;
    restart: (seed?: number) => void;
    dismissBirthReveal: () => void;
    dismissEvent: () => void;
    buy: (goodId: GoodId, quantity: number) => void;
    sell: (goodId: GoodId, quantity: number) => void;
    upgradeWarehouse: () => void;
    foundCompany: (companyId: CompanyTypeId) => void;
    marry: (partnerId: PartnerId) => void;
    endTurn: () => void;
}

export type GameStore = {
    game: GameState;
} & GameActions;

export const useGameStore = create<GameStore>(set => ({
    game: createInitialState(),

    start: seed => set(s => ({game: startGame(s.game, seed)})),
    restart: seed => set(s => ({game: startGame(s.game, seed)})),
    dismissBirthReveal: () => set(s => ({game: dismissBirthReveal(s.game)})),
    dismissEvent: () => set(s => ({game: dismissEvent(s.game)})),
    buy: (goodId, quantity) => set(s => ({game: buyGood(s.game, goodId, quantity)})),
    sell: (goodId, quantity) => set(s => ({game: sellGood(s.game, goodId, quantity)})),
    upgradeWarehouse: () => set(s => ({game: upgradeWarehouse(s.game)})),
    foundCompany: companyId => set(s => ({game: foundCompany(s.game, companyId)})),
    marry: partnerId => set(s => ({game: marry(s.game, partnerId)})),
    endTurn: () => set(s => ({game: endTurn(s.game)})),
}));
