import {TitleScreen} from "./screen/TitleScreen";
import {Stat} from "./components/Stat";
import {Button} from "./components/Button";
import {EventModal} from "./components/EventModal";
import {SettlementScreen} from "./screen/SettlementScreen";
import {LogPanel} from "./components/LogPanel";
import {useGame} from "./hooks/useGame";
import {formatMoney} from "./game/format";
import {BIRTH_FAMILY_MAP} from "./data/birthFamilies";
import {getCurrentEvent} from "./game/engine";

export const App = () => {
    const {state, start, dismissEvent, endTurn, restart} = useGame();

    if (state.phase === "title") {
        return <TitleScreen onStart={() => start()} />;
    }

    if (state.phase === "dead" || state.phase === "retired") {
        return <SettlementScreen state={state} onRestart={() => restart()} />;
    }

    const event = getCurrentEvent(state);
    const family = state.birthFamilyId ? BIRTH_FAMILY_MAP[state.birthFamilyId] : null;

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 px-4 py-6">
            <header className="rounded-2xl border-4 border-(--border) bg-(--panel) p-4 shadow-[4px_4px_0_var(--border)]">
                <h1 className="text-2xl font-black" style={{fontFamily: "var(--font-display)"}}>
                    一億小目標
                </h1>
                <p className="mt-1 text-sm text-(--muted)">
                    Phase 1 規則層已接上
                    {family ? ` · 出身：${family.name}` : ""}
                </p>
            </header>

            <section className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="年齡" value={`${state.age} 歲`} />
                <Stat label="現金" value={formatMoney(state.cash)} />
                <Stat label="健康" value={String(state.health)} />
                <Stat label="名聲" value={String(state.reputation)} />
            </section>

            {state.phase === "playing" ? <Button onClick={() => endTurn()}>下一年</Button> : null}

            <LogPanel entries={state.log} />

            {state.phase === "event" && event ? <EventModal event={event} onDismiss={() => dismissEvent()} /> : null}
        </main>
    );
};
