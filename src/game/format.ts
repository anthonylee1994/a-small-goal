export function formatMoney(amount: number): string {
    const sign = amount < 0 ? "-" : "";
    return `${sign}$${Math.abs(Math.round(amount)).toLocaleString("en-HK")}`;
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}
