import {useState} from "react";
import {
    buyGood,
    createInitialState,
    dismissEvent,
    endTurn,
    foundCompany,
    marry,
    sellGood,
    startGame,
    upgradeWarehouse,
} from "../game/engine";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "../types/game";

export function useGame() {
    const [state, setState] = useState<GameState>(() => createInitialState());

    return {
        state,
        start: (seed?: number) => setState(s => startGame(s, seed)),
        restart: (seed?: number) => setState(s => startGame(s, seed)),
        dismissEvent: () => setState(s => dismissEvent(s)),
        buy: (goodId: GoodId, quantity: number) => setState(s => buyGood(s, goodId, quantity)),
        sell: (goodId: GoodId, quantity: number) => setState(s => sellGood(s, goodId, quantity)),
        upgradeWarehouse: () => setState(s => upgradeWarehouse(s)),
        foundCompany: (companyId: CompanyTypeId) => setState(s => foundCompany(s, companyId)),
        marry: (partnerId: PartnerId) => setState(s => marry(s, partnerId)),
        endTurn: () => setState(s => endTurn(s)),
    };
}
