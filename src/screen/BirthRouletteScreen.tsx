import {useEffect, useMemo, useState} from "react";
import {BIRTH_FAMILIES} from "@/data/birthFamilies";
import {formatMoney} from "@/game/format";
import type {BirthFamilyId, GameState} from "@/types/game";
import {Button} from "@/components/Button";
import {BIRTH_FAMILY_ICONS} from "@/ui/icons";

interface Props {
    state: GameState;
    onConfirm: () => void;
}

type Phase = "ready" | "spinning" | "done";

const FAMILY_BLURB: Record<BirthFamilyId, string> = {
    low_class: "袋冇幾多銀，不過至少仲有雙手同野心。",
    middle_class: "唔算大富大貴，起步比人穩陣少少。",
    high_class: "屋企有本錢，不過一億小目標仍然要靠自己。",
};

const WHEEL_COLORS: Record<BirthFamilyId, string> = {
    low_class: "#FF8A7A",
    middle_class: "#4DB7FF",
    high_class: "#FFD400",
};

const SPIN_MS = 4200;
const EXTRA_TURNS = 6;
const VIEW = 200;
const CENTER = VIEW / 2;
const RADIUS = 92;

function mod(n: number, m: number): number {
    if (m <= 0) return 0;
    return ((n % m) + m) % m;
}

function polar(angleDeg: number, radius: number): {x: number; y: number} {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    };
}

function wedgePath(startDeg: number, endDeg: number): string {
    const start = polar(startDeg, RADIUS);
    const end = polar(endDeg, RADIUS);
    const largeArc = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${CENTER} ${CENTER} L ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export const BirthRouletteScreen = ({state, onConfirm}: Props) => {
    const families = BIRTH_FAMILIES;
    const resultId = state.birthFamilyId;
    const result = useMemo(() => families.find(f => f.id === resultId) ?? families[0]!, [families, resultId]);

    const segments = useMemo(() => {
        const totalWeight = families.reduce((sum, f) => sum + f.weight, 0);
        let cursor = 0;
        return families.map(family => {
            const span = (family.weight / totalWeight) * 360;
            const start = cursor;
            const end = cursor + span;
            cursor = end;
            return {family, start, end, mid: start + span / 2, span};
        });
    }, [families]);

    const resultSegment = useMemo(() => segments.find(s => s.family.id === result.id) ?? segments[0]!, [segments, result.id]);

    const [phase, setPhase] = useState<Phase>("ready");
    const [rotation, setRotation] = useState(0);
    const [spinning, setSpinning] = useState(false);
    const reduceMotion = useMemo(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches, []);

    const ResultIcon = BIRTH_FAMILY_ICONS[result.id];
    const landMod = mod(-resultSegment.mid, 360);

    useEffect(() => {
        if (phase !== "spinning") return;
        const timer = window.setTimeout(
            () => {
                setSpinning(false);
                setPhase("done");
            },
            reduceMotion ? 0 : SPIN_MS + 40
        );
        return () => window.clearTimeout(timer);
    }, [phase, reduceMotion, rotation]);

    useEffect(() => {
        let cancelled = false;
        let raf1 = 0;
        let raf2 = 0;

        if (reduceMotion) {
            setRotation(landMod);
            setPhase("done");
            return;
        }

        let delta = landMod;
        if (delta <= 0) delta += 360;
        delta += 360 * EXTRA_TURNS;

        setPhase("spinning");
        // Double rAF: paint at 0deg first, then enable transition + target angle.
        // Also survives React Strict Mode remount (no sticky "already started" ref).
        raf1 = requestAnimationFrame(() => {
            if (cancelled) return;
            setSpinning(true);
            raf2 = requestAnimationFrame(() => {
                if (cancelled) return;
                setRotation(delta);
            });
        });

        return () => {
            cancelled = true;
            cancelAnimationFrame(raf1);
            cancelAnimationFrame(raf2);
        };
    }, [landMod, reduceMotion]);

    const totalWeight = families.reduce((sum, f) => sum + f.weight, 0);

    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-5 overflow-x-hidden px-4 py-8 text-center sm:px-5">
            <div>
                <p className="text-xs font-black tracking-wide text-(--coral)">首抽限定 · 人生開局</p>
                <h1 className="mt-1 text-3xl font-black leading-none" style={{fontFamily: "var(--font-display)"}}>
                    投胎轉盤
                </h1>
                <p className="mt-2 text-sm font-bold text-(--muted)">{phase === "done" ? "命運已定，睇清楚你嘅出身。" : "正在為你投胎……"}</p>
            </div>

            <div className="relative mx-auto w-[min(100%,18.5rem)]">
                <div className="pointer-events-none absolute -top-1 left-1/2 z-20 -translate-x-1/2" aria-hidden="true">
                    <div className="h-0 w-0 border-x-14 border-t-22 border-x-transparent border-t-(--coral) drop-shadow-[2px_3px_0_var(--border)]" />
                </div>

                <div
                    className={`relative aspect-square rounded-full border-4 border-(--border) bg-white shadow-[6px_6px_0_var(--border)] ${phase === "done" ? "roulette-landed" : ""}`}
                    aria-live="polite"
                    aria-atomic="true"
                >
                    <svg
                        viewBox={`0 0 ${VIEW} ${VIEW}`}
                        className="h-full w-full"
                        style={{
                            transform: `rotate(${rotation}deg)`,
                            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.12, 0.75, 0.08, 1)` : "none",
                        }}
                        role="img"
                        aria-label="投胎轉盤"
                    >
                        {segments.map(({family, start, end, mid, span}) => {
                            const label = polar(mid, span >= 90 ? 54 : 58);
                            const fontSize = span >= 90 ? 11 : span >= 60 ? 10 : 9;
                            return (
                                <g key={family.id}>
                                    <path d={wedgePath(start, end)} fill={WHEEL_COLORS[family.id]} stroke="#1A1A1A" strokeWidth="2.5" />
                                    <text
                                        x={label.x}
                                        y={label.y}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#1A1A1A"
                                        fontSize={fontSize}
                                        fontWeight="900"
                                        style={{fontFamily: "var(--font-display)"}}
                                        transform={`rotate(${mid}, ${label.x}, ${label.y})`}
                                    >
                                        {family.name}
                                    </text>
                                </g>
                            );
                        })}
                        <circle cx={CENTER} cy={CENTER} r="22" fill="#FFF8E7" stroke="#1A1A1A" strokeWidth="3" />
                        <text x={CENTER} y={CENTER + 1} textAnchor="middle" dominantBaseline="middle" fontSize="18">
                            💰
                        </text>
                    </svg>
                </div>
            </div>

            <ul className="grid grid-cols-3 gap-2" aria-label="可投胎家庭">
                {families.map(family => {
                    const Icon = BIRTH_FAMILY_ICONS[family.id];
                    const active = phase === "done" && family.id === result.id;
                    const odds = Math.round((family.weight / totalWeight) * 100);
                    return (
                        <li
                            key={family.id}
                            className={`rounded-2xl border-2 border-(--border) px-1.5 py-2 ${active ? "shadow-[3px_3px_0_var(--border)]" : "opacity-80"}`}
                            style={{background: WHEEL_COLORS[family.id]}}
                        >
                            <Icon className="mx-auto size-5" strokeWidth={2.25} aria-hidden="true" />
                            <p className="mt-1 text-[10px] font-black leading-tight">{family.name}</p>
                            <p className="text-[10px] font-bold tabular-nums text-(--ink)/70">{formatMoney(family.startingCash)}</p>
                            <p className="text-[10px] font-black text-(--ink)/80">機率 {odds}%</p>
                        </li>
                    );
                })}
            </ul>

            {phase !== "done" ? (
                <Button disabled onClick={() => undefined}>
                    刷緊首抽
                </Button>
            ) : (
                <div className="space-y-3">
                    <div className="rounded-2xl border-4 border-(--border) bg-white px-4 py-3 shadow-[4px_4px_0_var(--border)]">
                        <div className="mb-2 flex items-center justify-center gap-2">
                            <ResultIcon className="size-6" strokeWidth={2.5} aria-hidden="true" />
                            <p className="text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                                首抽結果：{result.name}
                            </p>
                        </div>
                        <p className="text-sm font-bold text-(--muted)">{FAMILY_BLURB[result.id]}</p>
                        <p className="mt-2 text-xs font-bold text-(--muted)">起步資金 {formatMoney(result.startingCash)}</p>
                    </div>
                    <Button onClick={onConfirm}>開始人生</Button>
                </div>
            )}
        </main>
    );
};
