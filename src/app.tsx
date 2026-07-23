import React from "react";
import {playClick, unlockSfx, type ClickSfx} from "@/audio/sfx";
import {TitleScreen} from "@/screen/TitleScreen";
import {BirthRouletteScreen} from "@/screen/BirthRouletteScreen";
import {GameScreen} from "@/screen/GameScreen";
import {ProsperityPathScreen} from "@/screen/ProsperityPathScreen";
import {SettlementScreen} from "@/screen/SettlementScreen";
import {useGameStore} from "@/stores/gameStore";

export const App = () => {
    const [hydrated, setHydrated] = React.useState(() => useGameStore.persist.hasHydrated());
    const game = useGameStore(s => s.game);
    const meta = useGameStore(s => s.meta);
    const uiScreen = useGameStore(s => s.uiScreen);
    const start = useGameStore(s => s.start);
    const restart = useGameStore(s => s.restart);
    const suicide = useGameStore(s => s.suicide);
    const dismissBirthReveal = useGameStore(s => s.dismissBirthReveal);
    const chooseEvent = useGameStore(s => s.chooseEvent);
    const dismissTurnSummary = useGameStore(s => s.dismissTurnSummary);
    const buy = useGameStore(s => s.buy);
    const sell = useGameStore(s => s.sell);
    const upgradeWarehouse = useGameStore(s => s.upgradeWarehouse);
    const foundCompany = useGameStore(s => s.foundCompany);
    const buyCompanyShares = useGameStore(s => s.buyCompanyShares);
    const sellCompanyShares = useGameStore(s => s.sellCompanyShares);
    const marry = useGameStore(s => s.marry);
    const seeDoctor = useGameStore(s => s.seeDoctor);
    const donate = useGameStore(s => s.donate);
    const endTurn = useGameStore(s => s.endTurn);
    const openProsperity = useGameStore(s => s.openProsperity);
    const closeProsperity = useGameStore(s => s.closeProsperity);
    const buyProsperityUpgrade = useGameStore(s => s.buyProsperityUpgrade);

    React.useEffect(() => {
        const unsub = useGameStore.persist.onFinishHydration(() => setHydrated(true));
        setHydrated(useGameStore.persist.hasHydrated());
        return unsub;
    }, []);

    // Unlock audio on first gesture so SFX can play immediately after.
    React.useEffect(() => {
        const unlock = () => {
            void unlockSfx();
        };
        window.addEventListener("pointerdown", unlock, {passive: true});
        window.addEventListener("keydown", unlock);
        return () => {
            window.removeEventListener("pointerdown", unlock);
            window.removeEventListener("keydown", unlock);
        };
    }, []);

    // Chiptune click for every enabled <button> (tabs, chips, modals, header actions…).
    React.useEffect(() => {
        const onClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            const button = target.closest("button");
            if (!button || button.disabled || button.getAttribute("aria-disabled") === "true") return;
            // Modal backdrop / SFX toggle handle their own audio.
            if (button.classList.contains("modal-dimmer")) return;
            if (button.getAttribute("data-sfx-skip") === "true") return;
            const kind = (button.getAttribute("data-sfx") === "primary" ? "primary" : "ui") as ClickSfx;
            playClick(kind);
        };
        document.addEventListener("click", onClick, true);
        return () => document.removeEventListener("click", onClick, true);
    }, []);

    if (!hydrated) return null;

    if (game.phase === "title") {
        if (uiScreen === "prosperity") {
            return <ProsperityPathScreen meta={meta} onBuy={buyProsperityUpgrade} onBack={() => closeProsperity()} />;
        }
        return (
            <TitleScreen
                onOpenProsperity={() => openProsperity()}
                onStart={({easyMode}) => {
                    void unlockSfx();
                    start(undefined, {easyMode});
                }}
            />
        );
    }

    if (game.phase === "dead" || game.phase === "retired") {
        return <SettlementScreen state={game} onBackToTitle={() => restart()} />;
    }

    if (!game.birthRevealed && game.birthFamilyId) {
        return <BirthRouletteScreen state={game} onConfirm={() => dismissBirthReveal()} />;
    }

    return (
        <GameScreen
            state={game}
            onChooseEvent={choiceId => chooseEvent(choiceId)}
            onDismissTurnSummary={() => dismissTurnSummary()}
            onBuy={buy}
            onSell={sell}
            onUpgradeWarehouse={() => upgradeWarehouse()}
            onFoundCompany={foundCompany}
            onBuyCompanyShares={buyCompanyShares}
            onSellCompanyShares={sellCompanyShares}
            onMarry={marry}
            onSeeDoctor={() => seeDoctor()}
            onDonate={() => donate()}
            onEndTurn={() => endTurn()}
            onSuicide={() => suicide()}
        />
    );
};
