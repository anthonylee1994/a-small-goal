import {Button} from "@/components/Button";
import {SoundEffectToggle} from "@/components/SoundEffectToggle";
import {formatMoney} from "@/game/format";
import {canBuyUpgrade, getStartBonuses, getUpgradeCost, PROSPERITY_UPGRADES} from "@/meta/prosperity";
import type {MetaProgress, ProsperityUpgradeId} from "@/types/meta";

interface Props {
    meta: MetaProgress;
    onBuy: (id: ProsperityUpgradeId) => void;
    onBack: () => void;
}

const UPGRADE_VISUAL: Record<
    ProsperityUpgradeId,
    {
        emoji: string;
        barClass: string;
        chipClass: string;
        iconBg: string;
    }
> = {
    start_cash: {
        emoji: "💵",
        barClass: "bg-(--coral)",
        chipClass: "bg-[#ffe4e0]",
        iconBg: "bg-[#ffe4e0]",
    },
    start_reputation: {
        emoji: "⭐",
        barClass: "bg-(--accent)",
        chipClass: "bg-[#fff3c4]",
        iconBg: "bg-[#fff3c4]",
    },
    start_warehouse: {
        emoji: "📦",
        barClass: "bg-(--sky)",
        chipClass: "bg-[#dff2ff]",
        iconBg: "bg-[#dff2ff]",
    },
    retire_age: {
        emoji: "⏳",
        barClass: "bg-(--mint)",
        chipClass: "bg-[#d8f8ec]",
        iconBg: "bg-[#d8f8ec]",
    },
};

function effectLabel(id: ProsperityUpgradeId, perLevel: number, level: number): string {
    const total = perLevel * level;
    switch (id) {
        case "start_cash":
            return level === 0 ? "未加成" : `累計 +${formatMoney(total)}`;
        case "start_reputation":
            return level === 0 ? "未加成" : `累計 +${total} 名聲`;
        case "start_warehouse":
            return level === 0 ? "未加成" : `累計 +${total} 格`;
        case "retire_age":
            return level === 0 ? "預設 60 歲退休" : `而家 ${60 + total} 歲退休`;
        default:
            return "";
    }
}

function nextEffectHint(id: ProsperityUpgradeId, perLevel: number): string {
    switch (id) {
        case "start_cash":
            return `下一級 +${formatMoney(perLevel)}`;
        case "start_reputation":
            return `下一級 +${perLevel} 名聲`;
        case "start_warehouse":
            return `下一級 +${perLevel} 格`;
        case "retire_age":
            return `下一級 +${perLevel} 歲`;
        default:
            return "";
    }
}

/** Cartoon progress track: fill + optional tick segments. */
function LevelProgressBar({level, maxLevel, barClass, label}: {level: number; maxLevel: number; barClass: string; label: string}) {
    const pct = maxLevel <= 0 ? 0 : Math.min(100, Math.round((level / maxLevel) * 100));
    const maxed = level >= maxLevel;

    return (
        <div className="w-full">
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[11px] font-black md:text-sm">
                <span className="tabular-nums">
                    Lv.{level}
                    <span className="text-(--muted)"> / {maxLevel}</span>
                </span>
                <span className={maxed ? "text-(--success)" : "text-(--muted)"}>{maxed ? "滿級！" : label}</span>
            </div>
            <div
                className="relative h-3.5 overflow-hidden rounded-full border-2 border-(--border) bg-white md:h-4"
                role="progressbar"
                aria-valuenow={level}
                aria-valuemin={0}
                aria-valuemax={maxLevel}
                aria-label={`等級 ${level} / ${maxLevel}`}
            >
                <div className={`h-full rounded-full transition-[width] duration-300 ease-out ${maxed ? "bg-(--success)" : barClass}`} style={{width: `${pct}%`}} />
                {/* Segment ticks for cartoon “level steps” feel */}
                <div className="pointer-events-none absolute inset-0 flex" aria-hidden="true">
                    {Array.from({length: maxLevel - 1}, (_, i) => (
                        <div key={i} className="relative flex-1 border-r border-(--border)/25 last:border-r-0" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export const ProsperityPathScreen = ({meta, onBuy, onBack}: Props) => {
    const bonuses = getStartBonuses(meta);
    const totalLevels = PROSPERITY_UPGRADES.reduce((sum, def) => sum + def.maxLevel, 0);
    const ownedLevels = PROSPERITY_UPGRADES.reduce((sum, def) => sum + meta.levels[def.id], 0);
    const pathPct = totalLevels <= 0 ? 0 : Math.round((ownedLevels / totalLevels) * 100);

    return (
        <main className="app-shell relative mx-auto flex w-full flex-col overflow-x-hidden px-4 py-8 sm:px-5 md:px-6 md:py-12 lg:px-8">
            <SoundEffectToggle floating />

            <div className="screen-enter mx-auto w-full max-w-lg space-y-5 md:max-w-xl md:space-y-6">
                <div className="text-center">
                    <div
                        className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-(--border) bg-(--mint) text-4xl shadow-[4px_4px_0_var(--border)] md:h-24 md:w-24 md:text-5xl"
                        aria-hidden="true"
                    >
                        🛤️
                    </div>
                    <h1 className="text-3xl font-black tracking-tight md:text-4xl" style={{fontFamily: "var(--font-display)"}}>
                        發達之路
                    </h1>
                </div>

                {/* Summary card + overall path progress */}
                <section className="rounded-2xl border-4 border-(--border) bg-white p-4 shadow-[4px_4px_0_var(--border)] md:rounded-3xl md:p-5 md:shadow-[5px_5px_0_var(--border)]">
                    <div className="grid grid-cols-2 gap-2.5 text-center md:gap-3">
                        <div className="rounded-xl border-2 border-(--border) bg-(--accent)/35 px-2 py-3 md:rounded-2xl">
                            <p className="text-[11px] font-black tracking-wide text-(--muted) md:text-sm">可用積分</p>
                            <p className="mt-1 text-2xl font-black tabular-nums md:text-3xl" style={{fontFamily: "var(--font-display)"}}>
                                {meta.points}
                            </p>
                        </div>
                        <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2 py-3 md:rounded-2xl">
                            <p className="text-[11px] font-black tracking-wide text-(--muted) md:text-sm">生涯累積</p>
                            <p className="mt-1 text-2xl font-black tabular-nums md:text-3xl" style={{fontFamily: "var(--font-display)"}}>
                                {meta.lifetimePointsEarned}
                            </p>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[11px] font-black md:text-sm">
                            <span>總進度</span>
                            <span className="tabular-nums text-(--muted)">
                                {ownedLevels}/{totalLevels} · {pathPct}%
                            </span>
                        </div>
                        <div
                            className="h-3 overflow-hidden rounded-full border-2 border-(--border) bg-white md:h-3.5"
                            role="progressbar"
                            aria-valuenow={ownedLevels}
                            aria-valuemin={0}
                            aria-valuemax={totalLevels}
                            aria-label="發達之路總進度"
                        >
                            <div className="h-full rounded-full bg-(--coral) transition-[width] duration-300 ease-out" style={{width: `${pathPct}%`}} />
                        </div>
                    </div>

                    <p className="mt-3 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) px-3 py-2 text-center text-[11px] font-bold leading-relaxed text-(--muted) md:text-sm">
                        下一局：現金+{formatMoney(bonuses.cashBonus)} · 名聲+{bonuses.reputationBonus} · 倉庫+{bonuses.warehouseBonus} · 退休
                        {bonuses.endAge}歲
                    </p>
                </section>

                <ul className="space-y-3 md:space-y-4">
                    {PROSPERITY_UPGRADES.map(def => {
                        const level = meta.levels[def.id];
                        const cost = getUpgradeCost(meta, def.id);
                        const blocked = canBuyUpgrade(meta, def.id);
                        const maxed = level >= def.maxLevel;
                        const visual = UPGRADE_VISUAL[def.id];
                        const progressLabel = maxed ? "滿級" : nextEffectHint(def.id, def.perLevel);

                        return (
                            <li
                                key={def.id}
                                className={`relative overflow-hidden rounded-2xl border-4 border-(--border) bg-white p-4 shadow-[3px_3px_0_var(--border)] md:rounded-3xl md:p-5 md:shadow-[4px_4px_0_var(--border)] ${
                                    maxed ? "ring-2 ring-(--success)/40" : ""
                                }`}
                            >
                                {maxed ? (
                                    <span
                                        className="absolute top-3 right-3 rounded-lg border-2 border-(--border) bg-(--mint) px-2 py-0.5 text-[10px] font-black shadow-[2px_2px_0_var(--border)] md:top-4 md:right-4 md:text-xs"
                                        aria-hidden="true"
                                    >
                                        MAX
                                    </span>
                                ) : null}

                                <div className="flex items-start gap-3 md:gap-4">
                                    <div
                                        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) text-2xl shadow-[2px_2px_0_var(--border)] md:size-14 md:text-3xl ${visual.iconBg}`}
                                        aria-hidden="true"
                                    >
                                        {visual.emoji}
                                    </div>
                                    <div className="min-w-0 flex-1 text-left">
                                        <h2 className="pr-12 text-lg font-black leading-tight md:text-xl" style={{fontFamily: "var(--font-display)"}}>
                                            {def.name}
                                        </h2>
                                        <p className="mt-0.5 text-xs font-bold text-(--muted) md:text-sm">{def.description}</p>
                                        <p className={`mt-2 inline-block rounded-lg border border-(--border) px-2 py-0.5 text-[11px] font-black md:text-sm ${visual.chipClass}`}>
                                            {effectLabel(def.id, def.perLevel, level)}
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-3.5 md:mt-4">
                                    <LevelProgressBar level={level} maxLevel={def.maxLevel} barClass={visual.barClass} label={progressLabel} />
                                </div>

                                <div className="mt-3 md:mt-3.5">
                                    <Button variant={maxed ? "ghost" : "secondary"} size="sm" className="w-full" disabled={blocked != null} onClick={() => onBuy(def.id)}>
                                        {maxed ? "已滿級" : `升級（${cost} 分）`}
                                    </Button>
                                    {blocked && !maxed ? <p className="mt-1.5 text-center text-[11px] font-bold text-(--muted) md:text-sm">{blocked}</p> : null}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <Button variant="ghost" onClick={onBack}>
                    返回標題
                </Button>
            </div>
        </main>
    );
};
