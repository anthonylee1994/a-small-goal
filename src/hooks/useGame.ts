import {useState} from "react";
import {createInitialState, dismissEvent, startGame} from "../game/engine";
import type {GameState} from "../types/game";

export function useGame() {
    const [state, setState] = useState<GameState>(() => createInitialState());

    return {
        state,
        start: (seed?: number) => setState(s => startGame(s, seed)),
        restart: (seed?: number) => setState(s => startGame(s, seed)),
        dismissEvent: () => setState(s => dismissEvent(s)),
    };
}
