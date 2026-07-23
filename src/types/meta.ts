/** Meta progression — 「發達之路」permanent upgrades (persisted across runs). */

export type ProsperityUpgradeId = "start_cash" | "start_reputation" | "start_warehouse" | "retire_age";

export interface ProsperityLevels {
    start_cash: number;
    start_reputation: number;
    start_warehouse: number;
    retire_age: number;
}

export interface MetaProgress {
    /** Unspent points. */
    points: number;
    /** Lifetime points earned (never decreases). */
    lifetimePointsEarned: number;
    levels: ProsperityLevels;
    /** Prevents double-awarding the same finished run. */
    lastAwardedRunKey: string | null;
}

export interface StartMetaBonuses {
    cashBonus: number;
    reputationBonus: number;
    warehouseBonus: number;
    endAge: number;
}

export interface ProsperityUpgradeDef {
    id: ProsperityUpgradeId;
    name: string;
    description: string;
    /** Numeric effect per level (cash $, rep points, warehouse slots, or years). */
    perLevel: number;
    maxLevel: number;
    baseCost: number;
    costStep: number;
}
