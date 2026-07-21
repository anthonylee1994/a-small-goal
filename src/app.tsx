import {TitleScreen} from "@/screen/TitleScreen";
import {Stat} from "@/components/Stat";
import {Button} from "@/components/Button";
import {EventModal} from "@/components/EventModal";
import {BirthRevealModal} from "@/components/BirthRevealModal";
import {SettlementScreen} from "@/screen/SettlementScreen";
import {LogPanel} from "@/components/LogPanel";
import {useGameStore} from "@/stores/gameStore";
import {formatMoney} from "@/game/format";
import {BIRTH_FAMILY_MAP} from "@/data/birthFamilies";
import {getCurrentEvent} from "@/game/engine";

export const App = () => {
    const game = useGameStore(s => s.game);
    const start = useGameStore(s => s.start);
    const restart = useGameStore(s => s.restart);
    const dismissBirthReveal = useGameStore(s => s.dismissBirthReveal);
    const dismissEvent = useGameStore(s => s.dismissEvent);
    const endTurn = useGameStore(s => s.endTurn);

    if (game.phase === "title") {
        return <TitleScreen onStart={() => start()} />;
    }

    if (game.phase === "dead" || game.phase === "retired") {
        return <SettlementScreen state={game} onRestart={() => restart()} />;
    }

    const event = getCurrentEvent(game);
    const family = game.birthFamilyId ? BIRTH_FAMILY_MAP[game.birthFamilyId] : null;
    const showBirthReveal = Boolean(family && !game.birthRevealed);

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
                <Stat label="年齡" value={`${game.age} 歲`} />
                <Stat label="現金" value={formatMoney(game.cash)} />
                <Stat label="健康" value={String(game.health)} />
                <Stat label="名聲" value={String(game.reputation)} />
            </section>

            {game.phase === "playing" ? <Button onClick={() => endTurn()}>下一年</Button> : null}

            <LogPanel entries={game.log} />

            {showBirthReveal && family ? (
                <BirthRevealModal family={family} onDismiss={() => dismissBirthReveal()} />
            ) : null}

            {!showBirthReveal && game.phase === "event" && event ? (
                <EventModal event={event} onDismiss={() => dismissEvent()} />
            ) : null}
        </main>
    );
};
