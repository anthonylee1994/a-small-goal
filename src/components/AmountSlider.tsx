import {useEffect, useRef, useState} from "react";
import {playRouletteTick} from "@/audio/sfx";
import {compactMoney} from "@/game/format";

interface Props {
    options: number[];
    /** Called whenever the selected option changes (and once on mount / option change). */
    onSelect: (amount: number) => void;
    disabled?: boolean;
    /** Index selected when options change / on mount. Defaults to the last (max) option. */
    defaultIndex?: number;
    ariaLabel?: string;
    noOptionsMessage?: string;
}

/**
 * Discrete drag slider for picking an amount from a fixed option list.
 * Thumb snaps to each option; ticks play when the index changes.
 */
export const AmountSlider = ({options, onSelect, disabled = false, defaultIndex, ariaLabel, noOptionsMessage}: Props) => {
    const [index, setIndex] = useState(0);
    const indexRef = useRef(0);
    const onSelectRef = useRef(onSelect);
    onSelectRef.current = onSelect;
    const defaultIndexRef = useRef(defaultIndex);
    defaultIndexRef.current = defaultIndex;
    const optionsRef = useRef(options);
    optionsRef.current = options;

    const optionsKey = options.join(",");

    // Reset selection whenever the option list itself changes, including mount.
    useEffect(() => {
        const opts = optionsRef.current;
        if (opts.length === 0) {
            indexRef.current = 0;
            setIndex(0);
            onSelectRef.current(0);
            return;
        }
        const target = defaultIndexRef.current ?? opts.length - 1;
        const idx = Math.max(0, Math.min(opts.length - 1, target));
        indexRef.current = idx;
        setIndex(idx);
        onSelectRef.current(opts[idx] ?? 0);
    }, [optionsKey]);

    const selectIndex = (next: number) => {
        const opts = optionsRef.current;
        if (opts.length === 0) return;
        const idx = Math.max(0, Math.min(opts.length - 1, next));
        if (idx !== indexRef.current) {
            indexRef.current = idx;
            setIndex(idx);
            playRouletteTick(1);
            onSelectRef.current(opts[idx] ?? 0);
        }
    };

    if (options.length === 0) {
        return (
            <div className="flex h-14 items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--bg) text-sm font-black text-(--muted)">{noOptionsMessage ?? "冇得揀"}</div>
        );
    }

    const maxIdx = options.length - 1;
    const pct = maxIdx === 0 ? 100 : (index / maxIdx) * 100;
    const amount = options[index] ?? 0;

    return (
        <div className={`rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2.5 shadow-[inset_0_2px_0_rgba(26,26,26,0.08)] ${disabled ? "pointer-events-none opacity-40" : ""}`}>
            <div className="mb-1.5 flex items-center justify-between gap-2 text-[12px] font-black tracking-wide text-(--muted) md:text-sm">
                <span className="tabular-nums">{compactMoney(options[0] ?? 0)}</span>
                <span className="tabular-nums">{compactMoney(options[maxIdx] ?? 0)}</span>
            </div>

            <div className="relative flex h-9 items-center">
                {/* Track base */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 h-3 -translate-y-1/2 rounded-full border-2 border-(--border) bg-white" />
                {/* Filled portion */}
                <div aria-hidden className="pointer-events-none absolute top-1/2 left-0 h-3 -translate-y-1/2 rounded-full border-2 border-(--border) bg-(--coral)" style={{width: `${pct}%`}} />
                {/* Tick marks for each option */}
                <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-0.5">
                    {options.map((_, i) => (
                        <span key={i} className={`block h-1.5 w-0.5 rounded-full ${i <= index ? "bg-(--border)/40" : "bg-(--border)/25"}`} />
                    ))}
                </div>

                <input
                    type="range"
                    min={0}
                    max={maxIdx}
                    step={1}
                    value={index}
                    disabled={disabled}
                    aria-label={ariaLabel}
                    aria-valuemin={0}
                    aria-valuemax={maxIdx}
                    aria-valuenow={index}
                    aria-valuetext={compactMoney(amount)}
                    onChange={e => selectIndex(Number(e.target.value))}
                    className="amount-slider relative z-10 w-full cursor-grab active:cursor-grabbing disabled:cursor-not-allowed"
                />
            </div>
        </div>
    );
};
