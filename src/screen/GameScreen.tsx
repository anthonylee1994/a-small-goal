import {useState} from "react";
import {DOCTOR_HEALTH_RESTORE, ILLNESS_HEALTH_THRESHOLD} from "@/game/constants";
import {formatMoney} from "@/game/format";
import {getCurrentEvent, getDoctorFee, getUsedWarehouse, totalAssets} from "@/game/engine";
import type {CompanyTypeId, GameState, GoodId, PartnerId} from "@/types/game";
import {ActionToast} from "@/components/ActionToast";
import {BottomPanel, type GameTab} from "@/components/BottomPanel";
import {CompanyPanel} from "@/components/CompanyPanel";
import {ConfirmModal} from "@/components/ConfirmModal";
import {EventModal} from "@/components/EventModal";
import {EventPanel} from "@/components/EventPanel";
import {FamilyPanel} from "@/components/FamilyPanel";
import {GameHeader} from "@/components/GameHeader";
import {LogPanel} from "@/components/LogPanel";
import {MarketPanel} from "@/components/MarketPanel";
import {Stat} from "@/components/Stat";
import {HeartIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    onDismissEvent: () => void;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
    onUpgradeWarehouse: () => void;
    onFoundCompany: (companyId: CompanyTypeId) => void;
    onMarry: (partnerId: PartnerId) => void;
    onSeeDoctor: () => void;
    onEndTurn: () => void;
    onSuicide: () => void;
}

export const GameScreen = ({state, onDismissEvent, onBuy, onSell, onUpgradeWarehouse, onFoundCompany, onMarry, onSeeDoctor, onEndTurn, onSuicide}: Props) => {
    const [confirmEndTurn, setConfirmEndTurn] = useState(false);
    const [confirmDoctor, setConfirmDoctor] = useState(false);
    const [doctorNotice, setDoctorNotice] = useState<string | null>(null);
    const [eventPreviewOpen, setEventPreviewOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<GameTab>("market");

    const event = getCurrentEvent(state);
    const locked = state.phase !== "playing";
    const usedWarehouse = getUsedWarehouse(state);
    const warehouseRatio = state.warehouseCapacity > 0 ? usedWarehouse / state.warehouseCapacity : 0;
    const assets = totalAssets(state);
    const showEventModal = Boolean(event && (state.phase === "event" || eventPreviewOpen));
    const doctorFee = getDoctorFee(state);

    const cashTone = state.cash < 0 ? "danger" : state.cash < 10_000 ? "warn" : "default";
    const healthTone = state.health <= 0 ? "danger" : state.health < ILLNESS_HEALTH_THRESHOLD ? "warn" : "default";
    const warehouseTone = warehouseRatio >= 1 ? "danger" : warehouseRatio >= 0.85 ? "warn" : "default";

    const closeEventModal = () => {
        setEventPreviewOpen(false);
        if (state.phase === "event") onDismissEvent();
    };

    const handleDoctorClick = () => {
        if (locked) return;
        if (state.health >= 100) {
            setDoctorNotice("你已經好健康，醫生話唔使睇。");
            return;
        }
        if (state.cash < doctorFee) {
            setDoctorNotice(`睇醫生要 ${formatMoney(doctorFee)}，你錢唔夠。`);
            return;
        }
        setConfirmDoctor(true);
    };

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col overflow-x-hidden">
            <ActionToast latest={state.log[0]} />

            <div className="flex flex-1 flex-col gap-3 px-3 pt-3 pb-44 sm:px-4 sm:pt-4">
                <GameHeader state={state} onSuicide={onSuicide} />

                <section className="grid grid-cols-2 gap-2 text-sm">
                    <Stat label="年齡" value={`${state.age} 歲`} />
                    <Stat label="現金" value={formatMoney(state.cash)} tone={cashTone} hint={state.debtTurns > 0 ? `負債 ${state.debtTurns} 年` : undefined} />
                    <Stat
                        label="健康"
                        value={`${state.health}`}
                        tone={healthTone}
                        hint={state.health < ILLNESS_HEALTH_THRESHOLD ? "警戒：年結可能入院" : undefined}
                        action={
                            <button
                                type="button"
                                disabled={locked}
                                onClick={handleDoctorClick}
                                aria-label={`睇醫生，收費 ${formatMoney(doctorFee)}`}
                                title={locked ? "而家唔可以睇醫生" : `睇醫生 · ${formatMoney(doctorFee)}`}
                                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-(--border) bg-white text-(--danger) shadow-[2px_2px_0_var(--border)] transition-[transform,box-shadow] enabled:active:translate-x-px enabled:active:translate-y-px enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
                            >
                                <HeartIcon className="size-3.5" strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
                            </button>
                        }
                    />
                    <Stat label="名聲" value={String(state.reputation)} />
                    <Stat label="倉庫" value={`${usedWarehouse}/${state.warehouseCapacity}`} tone={warehouseTone} />
                    <Stat label="總資產" value={formatMoney(assets)} tone="good" />
                </section>

                {state.cash < 0 || state.health < ILLNESS_HEALTH_THRESHOLD ? (
                    <div className="rounded-2xl border-4 border-(--danger) bg-[#ffe4e6] px-3 py-2 text-sm font-black text-(--danger) shadow-[3px_3px_0_var(--border)]" role="status">
                        {state.cash < 0 ? "現金見紅！年結會觸發清盤。" : null}
                        {state.cash < 0 && state.health < ILLNESS_HEALTH_THRESHOLD ? " " : null}
                        {state.health < ILLNESS_HEALTH_THRESHOLD ? "健康危險，小心猝死。" : null}
                    </div>
                ) : null}

                <EventPanel state={state} onOpen={() => setEventPreviewOpen(true)} />

                <div role="tabpanel">
                    {activeTab === "market" ? <MarketPanel state={state} locked={locked} onBuy={onBuy} onSell={onSell} onUpgradeWarehouse={onUpgradeWarehouse} /> : null}
                    {activeTab === "company" ? <CompanyPanel state={state} locked={locked} onFound={onFoundCompany} /> : null}
                    {activeTab === "family" ? <FamilyPanel state={state} locked={locked} onMarry={onMarry} /> : null}
                    {activeTab === "log" ? <LogPanel entries={state.log} limit={20} /> : null}
                </div>
            </div>

            <div className="fixed inset-x-0 bottom-0 z-30">
                <div className="mx-auto w-full max-w-md">
                    <BottomPanel activeTab={activeTab} onTabChange={setActiveTab} endTurnDisabled={locked} onEndTurn={() => setConfirmEndTurn(true)} />
                </div>
            </div>

            {confirmEndTurn ? (
                <ConfirmModal
                    title="結束今年？"
                    message="會結算公司、家庭同健康，之後進入下一年。"
                    confirmLabel="結束今年"
                    cancelLabel="再諗諗"
                    danger
                    onCancel={() => setConfirmEndTurn(false)}
                    onConfirm={() => {
                        setConfirmEndTurn(false);
                        onEndTurn();
                    }}
                />
            ) : null}

            {confirmDoctor ? (
                <ConfirmModal
                    title="睇醫生？"
                    message={`診所睇中你荷包，今次收 ${formatMoney(doctorFee)}，恢復 ${DOCTOR_HEALTH_RESTORE} 點健康（上限 100）。`}
                    confirmLabel="求診"
                    cancelLabel="下次先"
                    onCancel={() => setConfirmDoctor(false)}
                    onConfirm={() => {
                        setConfirmDoctor(false);
                        onSeeDoctor();
                    }}
                />
            ) : null}

            {doctorNotice ? (
                <ConfirmModal title="睇唔成醫生" message={doctorNotice} confirmLabel="知道喇" cancelLabel={null} onCancel={() => setDoctorNotice(null)} onConfirm={() => setDoctorNotice(null)} />
            ) : null}

            {showEventModal && event ? <EventModal event={event} onDismiss={closeEventModal} /> : null}
        </main>
    );
};
