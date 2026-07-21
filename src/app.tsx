import {TitleScreen} from "./components/TitleScreen";
import {useGame} from "./hooks/useGame";
import {formatMoney} from "./game/format";

export const App = () => {
    const {state, start} = useGame();

    if (state.phase === "title") {
        return <TitleScreen onStart={() => start()} />;
    }

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-4 px-4 py-6">
            <header className="rounded-2xl border-4 border-(--border) bg-(--panel) p-4 shadow-[4px_4px_0_var(--border)]">
                <h1 className="text-2xl font-black" style={{fontFamily: "var(--font-display)"}}>
                    一億小目標
                </h1>
                <p className="mt-1 text-sm text-(--muted)">專案已初始化。規則層（Phase 1）尚未接上。</p>
            </header>

            <section className="grid grid-cols-2 gap-3 text-sm">
                <Stat label="年齡" value={`${state.age} 歲`} />
                <Stat label="現金" value={formatMoney(state.cash)} />
                <Stat label="健康" value={String(state.health)} />
                <Stat label="名聲" value={String(state.reputation)} />
            </section>
        </main>
    );
};

function Stat({label, value}: {label: string; value: string}) {
    return (
        <div className="rounded-xl border-2 border-(--border) bg-white px-3 py-2">
            <div className="text-xs text-(--muted)">{label}</div>
            <div className="font-bold">{value}</div>
        </div>
    );
}
