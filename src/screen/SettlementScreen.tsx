import React from "react";
import type {GameState} from "../types/game";
import {startSettlementBgm, stopSettlementBgm} from "@/audio/bgm";
import {playSettlement} from "@/audio/sfx";
import {BIRTH_FAMILY_MAP} from "../data/birthFamilies";
import {companyValue, getRank, inventoryValue} from "../game/engine";
import {formatMoney} from "../game/format";
import {computeRunPoints} from "@/meta/prosperity";
import {Button} from "../components/Button";
import {SoundEffectToggle} from "@/components/SoundEffectToggle";
import {Stat} from "../components/Stat";
import {DeathIcon, RANK_ICONS, RetireIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    onBackToTitle: () => void;
}

export const SettlementScreen = ({state, onBackToTitle}: Props) => {
    const isSuicide = state.gameOverReason === "suicide";
    const isBankruptcy = state.gameOverReason === "bankruptcy";
    const isDead = state.phase === "dead";
    const family = state.birthFamilyId ? BIRTH_FAMILY_MAP[state.birthFamilyId] : null;
    const cash = state.cash;
    const goods = inventoryValue(state);
    const companies = companyValue(state);
    const assets = state.totalAssets ?? cash + goods + companies;
    const rank = getRank(assets);
    const StatusIcon = isDead ? DeathIcon : RetireIcon;
    const RankIcon = RANK_ICONS[rank.tier];
    /** 達標一億小目標 = 贏；猝死／破產／重新投胎／未達標退休 = 輸。 */
    const isWin = !isDead && rank.tier === "winner";
    /**
     * 由局況即時計分，唔靠 session 暫存 — refresh 結算頁都睇到。
     * （實際入帳仍然只 award 一次，見 store / awardRun。）
     */
    const prosperityPointsEarned = computeRunPoints(state);

    const title = isSuicide ? "投胎結算" : isBankruptcy ? "破產結算" : isDead ? "猝死結算" : "退休結算";
    const ageHint = isSuicide ? " · 重新投胎" : isBankruptcy ? " · 負債出局" : isDead ? " · 未活到退休" : null;
    const badge = isSuicide ? "再嚟" : isBankruptcy ? "破產" : isDead ? "GG" : isWin ? "WIN!" : "差啲";

    React.useEffect(() => {
        const outcome = isWin ? "win" : "lose";
        playSettlement(outcome);
        startSettlementBgm(outcome);
        return () => stopSettlementBgm();
    }, [isWin]);

    return (
        <main className="relative mx-auto flex w-full flex-col justify-center overflow-x-hidden px-4 py-8 text-center sm:max-w-2xl sm:px-5 md:py-12">
            <SoundEffectToggle floating />

            <div className="screen-enter-hero relative mx-auto mb-2 max-w-32">
                <div
                    className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-(--border) shadow-[4px_4px_0_var(--border)] sm:h-24 sm:w-24 ${
                        isDead ? "bg-[#ffe4e6]" : "bg-(--accent)"
                    }`}
                    aria-hidden="true"
                >
                    <StatusIcon className="size-10 sm:size-12" strokeWidth={2.25} />
                </div>
                <span
                    className="screen-enter-badge screen-enter-delay-1 absolute -top-2 right-0 rounded-lg border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0_var(--border)]"
                    style={{"--badge-tilt": "12deg"} as React.CSSProperties}
                    aria-hidden="true"
                >
                    {badge}
                </span>
            </div>

            <div className="screen-enter screen-enter-delay-2 my-3 space-y-1.5">
                <h1 className="text-2xl font-black tracking-tight sm:text-3xl" style={{fontFamily: "var(--font-display)"}}>
                    {title}
                </h1>
                <p className="text-sm font-bold text-(--muted)">
                    {family ? `出生：${family.name}` : null}
                    {family ? " · " : null}
                    {state.age} 歲{ageHint}
                </p>
            </div>

            <section className="screen-enter screen-enter-delay-3 mb-5 w-full rounded-2xl border-4 border-(--border) bg-white p-3.5 text-left shadow-[4px_4px_0_var(--border)] sm:p-4">
                {/* Rank — full width, compact */}
                <div className="flex items-start gap-2.5 border-b-2 border-(--border) pb-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border-2 border-(--border) bg-(--bg)" aria-hidden="true">
                        <RankIcon className="size-5" strokeWidth={2.5} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-base font-black leading-tight sm:text-lg" style={{fontFamily: "var(--font-display)"}}>
                            {rank.title}
                        </h2>
                        <p className="mt-1 text-xs leading-snug text-(--muted) sm:text-sm">{rank.message}</p>
                    </div>
                </div>

                {/* Breakdown — mobile 1 col, sm+ 3 col */}
                <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-1.5">
                    <Stat label="現金" value={formatMoney(cash)} tone={cash < 0 ? "danger" : "default"} />
                    <Stat label="貨物" value={formatMoney(goods)} />
                    <Stat label="公司" value={formatMoney(companies)} />
                </div>

                {/* Totals */}
                <div className="mt-3 grid grid-cols-1 gap-2">
                    <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2.5 text-center">
                        <p className="text-[13px] font-black tracking-wide text-(--muted)">總資產</p>
                        <p className="mt-0.5 text-xl font-black tabular-nums sm:text-2xl" style={{fontFamily: "var(--font-display)"}}>
                            {formatMoney(assets)}
                        </p>
                    </div>

                    {prosperityPointsEarned > 0 ? (
                        <div className="rounded-xl border-2 border-(--border) bg-(--accent) px-3 py-2.5 text-center">
                            <p className="text-[13px] font-black tracking-wide text-(--muted)">發達之路</p>
                            <p className="mt-0.5 text-lg font-black sm:text-xl" style={{fontFamily: "var(--font-display)"}}>
                                +{prosperityPointsEarned} 分
                            </p>
                        </div>
                    ) : null}
                </div>
            </section>

            <div className="screen-enter screen-enter-delay-4 w-full">
                <Button onClick={onBackToTitle}>結束遊戲</Button>
            </div>
        </main>
    );
};
