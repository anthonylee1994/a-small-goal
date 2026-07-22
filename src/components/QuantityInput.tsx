import {Minus, Plus} from "lucide-react";

interface Props {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    id?: string;
    label?: string;
}

export const QuantityInput = ({value, onChange, min = 1, max = 999, disabled = false, id, label}: Props) => {
    const clampValue = (n: number) => {
        if (!Number.isFinite(n)) return min;
        return Math.min(max, Math.max(min, Math.trunc(n)));
    };

    return (
        <div className="inline-flex h-9 w-full items-stretch overflow-hidden rounded-xl border-2 border-(--border) bg-white">
            {label ? (
                <label htmlFor={id} className="sr-only">
                    {label}
                </label>
            ) : null}
            <button
                type="button"
                disabled={disabled || value <= min}
                aria-label="減少"
                className="flex w-9 shrink-0 items-center justify-center bg-white disabled:opacity-40"
                onClick={() => onChange(clampValue(value - 1))}
            >
                <Minus className="size-3.5" strokeWidth={2.75} aria-hidden="true" />
            </button>
            <input
                id={id}
                type="number"
                inputMode="numeric"
                min={min}
                max={max}
                disabled={disabled}
                value={value}
                onChange={e => onChange(clampValue(Number(e.target.value)))}
                className="min-w-0 flex-1 border-x-2 border-(--border) bg-(--bg) text-center text-sm md:text-base font-black tabular-nums outline-none disabled:opacity-40"
            />
            <button
                type="button"
                disabled={disabled || value >= max}
                aria-label="增加"
                className="flex w-9 shrink-0 items-center justify-center bg-white disabled:opacity-40"
                onClick={() => onChange(clampValue(value + 1))}
            >
                <Plus className="size-3.5" strokeWidth={2.75} aria-hidden="true" />
            </button>
        </div>
    );
};
