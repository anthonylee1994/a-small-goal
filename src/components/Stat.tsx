interface Props {
    label: string;
    value: string;
}

export function Stat({label, value}: Props) {
    return (
        <div className="rounded-xl border-2 border-(--border) bg-white px-3 py-2">
            <div className="text-xs text-(--muted)">{label}</div>
            <div className="font-bold">{value}</div>
        </div>
    );
}
