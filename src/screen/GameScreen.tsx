import {useEffect, useState} from "react";
import {startGameBgm, stopGameBgm} from "@/audio/bgm";
import {ILLNESS_HEALTH_THRESHOLD} from "@/game/constants";
import {formatMoney} from "@/game/format";
import {getCurrentEvent, getUsedWarehouse, totalAssets} from "@/game/engine";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "@/types/game";
import {ActionToast} from "@/components/ActionToast";
import {BankPanel} from "@/components/BankPanel";
import {BottomPanel, type GameTab} from "@/components/BottomPanel";
import {CompanyPanel} from "@/components/CompanyPanel";
import {ConfirmModal} from "@/components/ConfirmModal";
import {EventModal} from "@/components/EventModal";
import {EventPanel} from "@/components/EventPanel";
import {FamilyPanel} from "@/components/FamilyPanel";
import {GameHeader} from "@/components/GameHeader";
import {LogPanel} from "@/components/LogPanel";
import {MarketPanel} from "@/components/MarketPanel";
import {DonateButton} from "@/components/DonateButton";
import {SeeDoctorButton} from "@/components/SeeDoctorButton";
import {Stat} from "@/components/Stat";
import {TurnSummaryModal} from "@/components/TurnSummaryModal";

interface Props {
    state: GameState;
    onChooseEvent: (choiceId: string) => void;
    onDismissTurnSummary: () => void;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
    onUpgradeWarehouse: () => void;
    onFoundCompany: (companyId: CompanyTypeId) => void;
    onBuyCompanyShares: (companyId: CompanyTypeId, shares: number) => void;
    onSellCompanyShares: (companyId: CompanyTypeId, shares: number) => void;
    onMarry: (partnerId: PartnerId) => void;
    onSeeDoctor: () => void;
    onDonate: () => void;
    onTakeLoan: (amount: number) => void;
    onRepayLoan: (amount: number) => void;
    onEndTurn: () => void;
    onSuicide: () => void;
}

export const GameScreen = ({
    state,
    onChooseEvent,
    onDismissTurnSummary,
    onBuy,
    onSell,
    onUpgradeWarehouse,
    onFoundCompany,
    onBuyCompanyShares,
    onSellCompanyShares,
    onMarry,
    onSeeDoctor,
    onDonate,
    onTakeLoan,
    onRepayLoan,
    onEndTurn,
    onSuicide,
}: Props) => {
    const [confirmEndTurn, setConfirmEndTurn] = useState(false);
    const [eventPreviewOpen, setEventPreviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<GameTab>("market");
    const [highlightGoodId, setHighlightGoodId] = useState<GoodId | null>(null);
    const [closuresAcknowledged, setClosuresAcknowledged] = useState(false);

    const event = getCurrentEvent(state);
    const locked = state.phase !== "playing";
    const usedWarehouse = getUsedWarehouse(state);
    const warehouseRatio = state.warehouseCapacity > 0 ? usedWarehouse / state.warehouseCapacity : 0;
    const assets = totalAssets(state);
    const showingSummary = Boolean(state.lastTurnSummary);
    const yearClosures = state.lastTurnSummary?.closures ?? [];
    const showClosureNotice = showingSummary && yearClosures.length > 0 && !closuresAcknowledged;
    const showTurnSummary = showingSummary && (!yearClosures.length || closuresAcknowledged);
    const showEventModal = Boolean(event && !showingSummary && (state.phase === "event" || eventPreviewOpen));
    const gameModalOpen = confirmEndTurn || showClosureNotice || showTurnSummary || showEventModal;
    const endTurnRisky = state.cash < 0 || state.health < ILLNESS_HEALTH_THRESHOLD;

    useEffect(() => {
        startGameBgm();
        return () => stopGameBgm();
    }, []);

    useEffect(() => {
        // New year-end summary → re-show closure popup if any.
        setClosuresAcknowledged(false);
    }, [state.lastTurnSummary?.age, state.lastTurnSummary?.closures?.length]);

    const cashTone = state.cash < 0 ? "danger" : state.cash < 10_000 ? "warn" : "default";
    const healthTone = state.health <= 0 ? "danger" : state.health < ILLNESS_HEALTH_THRESHOLD ? "warn" : "default";
    const warehouseTone = warehouseRatio >= 1 ? "danger" : warehouseRatio >= 0.85 ? "warn" : "default";

    useEffect(() => {
        if (!highlightGoodId) return;
        const el = document.getElementById(`good-${highlightGoodId}`);
        el?.scrollIntoView({behavior: "smooth", block: "center"});
        const t = window.setTimeout(() => setHighlightGoodId(null), 2500);
        return () => window.clearTimeout(t);
    }, [highlightGoodId, activeTab]);

    const closeEventModal = () => {
        setEventPreviewOpen(false);
        // Pending events must be resolved via onChooseEvent — never auto-dismiss from UI.
    };

    const handleChooseEvent = (choiceId: string) => {
        onChooseEvent(choiceId);
        setEventPreviewOpen(false);
    };

    const handleJumpToMarket = (goodId: GoodId) => {
        setActiveTab("market");
        setHighlightGoodId(goodId);
    };

    return (
        <main className="app-shell mx-auto flex w-full flex-col overflow-x-hidden">
            <ActionToast latest={state.log[0]} suppressed={gameModalOpen} />

            <div className="flex flex-1 flex-col gap-3 px-3 pt-3 pb-44 sm:px-4 sm:pt-4 md:gap-4 md:px-5 md:pt-5 lg:px-6">
                <div className="screen-enter">
                    <GameHeader state={state} onSuicide={onSuicide} />
                </div>

                {state.easyMode ? (
                    <div className="screen-enter screen-enter-delay-1 rounded-xl border-2 border-(--border) bg-(--mint) px-3 py-1.5 text-center text-[11px] md:text-base font-black" role="status">
                        簡易模式 · 健康／扣款較溫和
                    </div>
                ) : null}

                <section className="screen-enter screen-enter-delay-1 grid grid-cols-2 gap-2 text-sm md:text-base sm:grid-cols-3 lg:grid-cols-6">
                    <Stat label="現金" value={formatMoney(state.cash)} tone={cashTone} />
                    <Stat
                        label="健康"
                        value={`${state.health}`}
                        tone={healthTone}
                        hint={state.health < ILLNESS_HEALTH_THRESHOLD ? "警戒：年結可能入院" : undefined}
                        action={<SeeDoctorButton state={state} locked={locked} onSeeDoctor={onSeeDoctor} />}
                    />
                    <Stat label="名聲" value={String(state.reputation)} action={<DonateButton state={state} locked={locked} onDonate={onDonate} />} />
                    <Stat label="倉庫" value={`${usedWarehouse}/${state.warehouseCapacity}`} tone={warehouseTone} />
                    <Stat label="總資產" value={formatMoney(assets)} tone="good" />
                    <Stat label="欠款" value={formatMoney(state.loanBalance)} tone={state.loanBalance > 0 ? "danger" : "default"} />
                </section>

                {state.cash < 0 || state.health < ILLNESS_HEALTH_THRESHOLD ? (
                    <div
                        className="screen-enter screen-enter-delay-2 rounded-2xl border-4 border-(--danger) bg-[#ffe4e6] px-3 py-2 text-sm md:text-base font-black text-(--danger) shadow-[3px_3px_0_var(--border)]"
                        role="status"
                    >
                        {state.cash < 0 ? "現金見紅！年結清盤後仍負債就破產。" : null}
                        {state.cash < 0 && state.health < ILLNESS_HEALTH_THRESHOLD ? " " : null}
                        {state.health < ILLNESS_HEALTH_THRESHOLD ? "健康危險，小心猝死。" : null}
                    </div>
                ) : null}

                <div className="screen-enter screen-enter-delay-2">
                    <EventPanel state={state} onOpen={() => setEventPreviewOpen(true)} />
                </div>

                <div className="screen-enter screen-enter-delay-3" role="tabpanel">
                    {activeTab === "market" ? (
                        <MarketPanel state={state} locked={locked} highlightGoodId={highlightGoodId} onBuy={onBuy} onSell={onSell} onUpgradeWarehouse={onUpgradeWarehouse} />
                    ) : null}
                    {activeTab === "company" ? <CompanyPanel state={state} locked={locked} onFound={onFoundCompany} onBuyShares={onBuyCompanyShares} onSellShares={onSellCompanyShares} /> : null}
                    {activeTab === "family" ? <FamilyPanel state={state} locked={locked} onMarry={onMarry} /> : null}
                    {activeTab === "bank" ? <BankPanel state={state} locked={locked} onTakeLoan={onTakeLoan} onRepayLoan={onRepayLoan} /> : null}
                    {activeTab === "log" ? <LogPanel entries={state.log} limit={20} /> : null}
                </div>
            </div>

            <div className="screen-enter-dock fixed inset-x-0 bottom-0 z-30">
                <div className="app-shell mx-auto w-full">
                    <BottomPanel activeTab={activeTab} onTabChange={setActiveTab} endTurnDisabled={locked} onEndTurn={() => setConfirmEndTurn(true)} />
                </div>
            </div>

            {confirmEndTurn ? (
                <ConfirmModal
                    title="結束今年？"
                    message={endTurnRisky ? "而家現金見紅或者健康危險，確定要結算？可能入院或者清盤。可以撳「再諗諗」繼續操作。" : "會結算公司、家庭同健康，之後進入下一年。未準備好可以撳「再諗諗」。"}
                    confirmLabel={endTurnRisky ? "仍然結束" : "結束今年"}
                    cancelLabel="再諗諗"
                    danger={endTurnRisky}
                    onCancel={() => setConfirmEndTurn(false)}
                    onConfirm={() => {
                        setConfirmEndTurn(false);
                        onEndTurn();
                    }}
                />
            ) : null}

            {showClosureNotice ? (
                <ConfirmModal
                    title={yearClosures.length > 1 ? `有 ${yearClosures.length} 間公司結業！` : "公司結業！"}
                    message={yearClosures
                        .map(c => (c.reason === "collapse" ? `「${c.name}」倒閉結業，持股 ${c.shares}% 同估值歸零。` : `「${c.name}」因清盤被沽清，持股 ${c.shares}% 已套現。`))
                        .join("\n")}
                    confirmLabel="知道喇"
                    cancelLabel={null}
                    danger
                    onCancel={() => setClosuresAcknowledged(true)}
                    onConfirm={() => setClosuresAcknowledged(true)}
                />
            ) : null}

            {showTurnSummary && state.lastTurnSummary ? <TurnSummaryModal summary={state.lastTurnSummary} onDismiss={onDismissTurnSummary} /> : null}

            {showEventModal && event ? (
                <EventModal
                    event={event}
                    pending={state.phase === "event"}
                    selectedChoiceId={state.currentEventChoiceId}
                    onChoose={handleChooseEvent}
                    onDismiss={closeEventModal}
                    onJumpToMarket={handleJumpToMarket}
                />
            ) : null}
        </main>
    );
};
