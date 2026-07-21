import type {ReactNode} from "react";

interface Props {
    label: string;
    value: string;
    tone?: "default" | "warn" | "danger" | "good";
    hint?: ReactNode;
    action?: ReactNode;
}

const TONE_STYLES = {
    default: "border-(--border) bg-white",
    warn: "border-(--border) bg-[#fff3cd]",
    danger: "border-(--danger) bg-[#ffe4e6]",
    good: "border-(--border) bg-[#e7fff5]",
} as const;

const VALUE_STYLES = {
    default: "text-(--ink)",
    warn: "text-[#8a6a00]",
    danger: "text-(--danger)",
    good: "text-(--success)",
} as const;

export const Stat = ({label, value, tone = "default", hint, action}: Props) => {
    return (
        <div className={`rounded-xl border-2 px-3 py-2 ${TONE_STYLES[tone]}`}>
            <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-(--muted)">{label}</div>
                    <div className={`font-black tabular-nums leading-tight ${VALUE_STYLES[tone]}`}>{value}</div>
                    {hint ? <div className="mt-0.5 text-[10px] font-bold text-(--muted)">{hint}</div> : null}
                </div>
                {action}
            </div>
        </div>
    );
};
