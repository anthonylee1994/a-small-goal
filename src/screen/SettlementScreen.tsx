import React from "react";
import type {GameState} from "../types/game";
import {startSettlementBgm, stopSettlementBgm} from "@/audio/bgm";
import {playSettlement} from "@/audio/sfx";
import {BIRTH_FAMILY_MAP} from "../data/birthFamilies";
import {companyValue, getRank, inventoryValue} from "../game/engine";
import {formatMoney} from "../game/format";
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
    /** 達標一億小目標 = 贏；猝死／破產／自殺／未達標退休 = 輸。 */
    const isWin = !isDead && rank.tier === "winner";

    const title = isSuicide ? "投胎結算" : isBankruptcy ? "破產結算" : isDead ? "猝死結算" : "退休結算";
    const ageHint = isSuicide ? " · 自殺" : isBankruptcy ? " · 負債出局" : isDead ? " · 未活到退休" : null;
    const badge = isSuicide ? "再嚟" : isBankruptcy ? "破產" : isDead ? "GG" : isWin ? "WIN!" : "差啲";

    React.useEffect(() => {
        const outcome = isWin ? "win" : "lose";
        playSettlement(outcome);
        startSettlementBgm(outcome);
        return () => stopSettlementBgm();
    }, [isWin]);

    return (
        <main className="app-shell relative mx-auto flex w-full flex-col justify-center overflow-x-hidden px-4 py-8 text-center sm:px-5 md:px-6 md:py-16 lg:px-8 lg:py-20">
            <SoundEffectToggle className="absolute top-3 right-3 z-10 sm:top-4 sm:right-4 md:top-5 md:right-5" />

            <div className="screen-enter-hero relative mx-auto mb-2 max-w-36 md:mb-4 md:max-w-44">
                <div
                    className={`mx-auto flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-(--border) shadow-[5px_5px_0_var(--border)] md:h-36 md:w-36 md:rounded-4xl md:shadow-[7px_7px_0_var(--border)] ${
                        isDead ? "bg-[#ffe4e6]" : "bg-(--accent)"
                    }`}
                    aria-hidden="true"
                >
                    <StatusIcon className="size-12 md:size-16" strokeWidth={2.25} />
                </div>
                <span
                    className="screen-enter-badge screen-enter-delay-1 absolute -top-2 right-0 rounded-lg border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0_var(--border)] md:right-1 md:rounded-xl md:px-3 md:py-1 md:text-base"
                    style={{"--badge-tilt": "12deg"} as React.CSSProperties}
                    aria-hidden="true"
                >
                    {badge}
                </span>
            </div>

            <div className="screen-enter screen-enter-delay-2 my-4 space-y-2 md:my-6 md:space-y-3">
                <h1 className="text-3xl font-black tracking-tight md:text-5xl" style={{fontFamily: "var(--font-display)"}}>
                    {title}
                </h1>
                <p className="text-sm font-bold text-(--muted) md:text-lg">
                    {family ? `出生：${family.name}` : null}
                    {family ? " · " : null}
                    {state.age} 歲{ageHint}
                </p>
            </div>

            <section className="screen-enter screen-enter-delay-3 mb-5 rounded-2xl border-4 border-(--border) bg-white p-4 text-left shadow-[4px_4px_0_var(--border)] md:mb-8 md:rounded-3xl md:p-6 md:shadow-[6px_6px_0_var(--border)] lg:p-8">
                <div className="md:grid md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-start md:gap-6 lg:gap-8">
                    <div className="min-w-0">
                        <div className="mb-3 flex items-center gap-2 md:mb-4 md:gap-3">
                            <RankIcon className="size-6 shrink-0 md:size-8" strokeWidth={2.5} aria-hidden="true" />
                            <h2 className="text-lg font-black md:text-2xl" style={{fontFamily: "var(--font-display)"}}>
                                {rank.title}
                            </h2>
                        </div>
                        <p className="mb-4 text-sm text-(--muted) md:mb-0 md:text-base md:leading-relaxed">{rank.message}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3 md:grid-cols-1 md:gap-3 lg:grid-cols-1">
                        <Stat label="現金" value={formatMoney(cash)} tone={cash < 0 ? "danger" : "default"} />
                        <Stat label="貨物" value={formatMoney(goods)} />
                        <Stat label="公司" value={formatMoney(companies)} />
                    </div>
                </div>

                <div className="mt-4 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-3 text-center md:mt-6 md:rounded-2xl md:px-4 md:py-4">
                    <p className="text-xs font-black tracking-wide text-(--muted) md:text-sm">總資產</p>
                    <p className="mt-1 text-xl font-black tabular-nums md:text-3xl" style={{fontFamily: "var(--font-display)"}}>
                        {formatMoney(assets)}
                    </p>
                </div>
            </section>

            <div className="screen-enter screen-enter-delay-4 mx-auto w-full max-w-md md:max-w-lg">
                <Button onClick={onBackToTitle}>結束遊戲</Button>
            </div>
        </main>
    );
};
