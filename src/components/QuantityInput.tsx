interface Props {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    disabled?: boolean;
    id?: string;
    label?: string;
}

export function QuantityInput({value, onChange, min = 1, max = 999, disabled = false, id, label}: Props) {
    const clampValue = (n: number) => Math.min(max, Math.max(min, Math.floor(n) || min));

    return (
        <div className="flex items-center gap-1">
            {label ? (
                <label htmlFor={id} className="sr-only">
                    {label}
                </label>
            ) : null}
            <button
                type="button"
                disabled={disabled || value <= min}
                aria-label="減少"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-(--border) bg-white text-lg font-black disabled:opacity-40"
                onClick={() => onChange(clampValue(value - 1))}
            >
                −
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
                className="h-9 w-14 rounded-xl border-2 border-(--border) bg-(--bg) text-center text-sm font-black tabular-nums disabled:opacity-40"
            />
            <button
                type="button"
                disabled={disabled || value >= max}
                aria-label="增加"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-2 border-(--border) bg-white text-lg font-black disabled:opacity-40"
                onClick={() => onChange(clampValue(value + 1))}
            >
                +
            </button>
        </div>
    );
}
