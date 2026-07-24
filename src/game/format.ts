export function formatMoney(amount: number): string {
    const sign = amount < 0 ? "-" : "";
    return `${sign}$${Math.abs(Math.round(amount)).toLocaleString("en-HK")}`;
}

/** Compact 萬／億 form for tight spaces (e.g. scroller chips). */
export function compactMoney(amount: number): string {
    const n = Math.abs(Math.round(amount));
    const sign = amount < 0 ? "-" : "";
    const trim = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1).replace(/\.0$/, ""));
    if (n >= 100_000_000) return `${sign}$${trim(n / 100_000_000)}億`;
    if (n >= 10_000) return `${sign}$${trim(n / 10_000)}萬`;
    return `${sign}$${n.toLocaleString("en-HK")}`;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
