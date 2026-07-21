import {useEffect, useState} from "react";
import {TitleScreen} from "@/screen/TitleScreen";
import {BirthRouletteScreen} from "@/screen/BirthRouletteScreen";
import {GameScreen} from "@/screen/GameScreen";
import {SettlementScreen} from "@/screen/SettlementScreen";
import {useGameStore} from "@/stores/gameStore";

export const App = () => {
    const [hydrated, setHydrated] = useState(() => useGameStore.persist.hasHydrated());
    const game = useGameStore(s => s.game);
    const start = useGameStore(s => s.start);
    const restart = useGameStore(s => s.restart);
    const suicide = useGameStore(s => s.suicide);
    const dismissBirthReveal = useGameStore(s => s.dismissBirthReveal);
    const dismissEvent = useGameStore(s => s.dismissEvent);
    const buy = useGameStore(s => s.buy);
    const sell = useGameStore(s => s.sell);
    const upgradeWarehouse = useGameStore(s => s.upgradeWarehouse);
    const foundCompany = useGameStore(s => s.foundCompany);
    const marry = useGameStore(s => s.marry);
    const endTurn = useGameStore(s => s.endTurn);

    useEffect(() => {
        const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
        setHydrated(useGameStore.persist.hasHydrated());
        return unsub;
    }, []);

    if (!hydrated) return null;

    if (game.phase === "title") {
        return <TitleScreen onStart={() => start()} />;
    }

    if (game.phase === "dead" || game.phase === "retired") {
        return <SettlementScreen state={game} onRestart={() => restart()} />;
    }

    if (!game.birthRevealed && game.birthFamilyId) {
        return <BirthRouletteScreen state={game} onConfirm={() => dismissBirthReveal()} />;
    }

    return (
        <GameScreen
            state={game}
            onDismissEvent={() => dismissEvent()}
            onBuy={buy}
            onSell={sell}
            onUpgradeWarehouse={() => upgradeWarehouse()}
            onFoundCompany={foundCompany}
            onMarry={marry}
            onEndTurn={() => endTurn()}
            onSuicide={() => suicide()}
        />
    );
};
