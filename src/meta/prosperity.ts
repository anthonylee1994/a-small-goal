/**
 * 「發達之路」meta progression — pure helpers (no React / store).
 */
import {END_AGE, START_AGE, START_WAREHOUSE} from "../game/constants";
import {getRank, totalAssets} from "../game/engine";
import type {GameState} from "../types/game";
import type {MetaProgress, ProsperityLevels, ProsperityUpgradeDef, ProsperityUpgradeId, StartMetaBonuses} from "../types/meta";

export const PROSPERITY_UPGRADES: readonly ProsperityUpgradeDef[] = [
    {
        id: "start_cash",
        name: "初次資金",
        description: "每級起步現金 +$15,000",
        perLevel: 15_000,
        maxLevel: 10,
        baseCost: 20,
        costStep: 15,
    },
    {
        id: "start_reputation",
        name: "初次名聲",
        description: "每級起步名聲 +3",
        perLevel: 3,
        maxLevel: 8,
        baseCost: 25,
        costStep: 20,
    },
    {
        id: "start_warehouse",
        name: "初次倉庫",
        description: "每級起步倉庫 +20 格",
        perLevel: 20,
        maxLevel: 8,
        baseCost: 20,
        costStep: 15,
    },
    {
        id: "retire_age",
        name: "延長退休",
        description: "每級退休年齡 +1 歲（由 60 起）",
        perLevel: 1,
        maxLevel: 10,
        baseCost: 40,
        costStep: 25,
    },
] as const;

const UPGRADE_MAP: Record<ProsperityUpgradeId, ProsperityUpgradeDef> = Object.fromEntries(PROSPERITY_UPGRADES.map(u => [u.id, u])) as Record<ProsperityUpgradeId, ProsperityUpgradeDef>;

export function createDefaultMeta(): MetaProgress {
    return {
        points: 0,
        lifetimePointsEarned: 0,
        levels: {
            start_cash: 0,
            start_reputation: 0,
            start_warehouse: 0,
            retire_age: 0,
        },
        lastAwardedRunKey: null,
    };
}

export function normalizeMeta(raw: Partial<MetaProgress> | null | undefined): MetaProgress {
    const base = createDefaultMeta();
    if (!raw) return base;
    const levels: ProsperityLevels = {
        start_cash: clampLevel(raw.levels?.start_cash, "start_cash"),
        start_reputation: clampLevel(raw.levels?.start_reputation, "start_reputation"),
        start_warehouse: clampLevel(raw.levels?.start_warehouse, "start_warehouse"),
        retire_age: clampLevel(raw.levels?.retire_age, "retire_age"),
    };
    return {
        points: Math.max(0, Math.floor(raw.points ?? 0)),
        lifetimePointsEarned: Math.max(0, Math.floor(raw.lifetimePointsEarned ?? 0)),
        levels,
        lastAwardedRunKey: raw.lastAwardedRunKey ?? null,
    };
}

function clampLevel(value: number | undefined, id: ProsperityUpgradeId): number {
    const max = UPGRADE_MAP[id].maxLevel;
    if (value == null || !Number.isFinite(value)) return 0;
    return Math.max(0, Math.min(max, Math.floor(value)));
}

export function getUpgradeDef(id: ProsperityUpgradeId): ProsperityUpgradeDef {
    return UPGRADE_MAP[id];
}

/** Cost to buy the next level (current level → current+1). */
export function getUpgradeCost(meta: MetaProgress, id: ProsperityUpgradeId): number | null {
    const def = UPGRADE_MAP[id];
    const level = meta.levels[id];
    if (level >= def.maxLevel) return null;
    return def.baseCost + level * def.costStep;
}

export function canBuyUpgrade(meta: MetaProgress, id: ProsperityUpgradeId): string | null {
    const def = UPGRADE_MAP[id];
    if (meta.levels[id] >= def.maxLevel) return "已滿級";
    const cost = getUpgradeCost(meta, id);
    if (cost == null) return "已滿級";
    if (meta.points < cost) return `積分唔夠（要 ${cost} 分）`;
    return null;
}

export function buyUpgrade(meta: MetaProgress, id: ProsperityUpgradeId): MetaProgress {
    const blocked = canBuyUpgrade(meta, id);
    if (blocked) return meta;
    const cost = getUpgradeCost(meta, id);
    if (cost == null) return meta;
    return {
        ...meta,
        points: meta.points - cost,
        levels: {
            ...meta.levels,
            [id]: meta.levels[id] + 1,
        },
    };
}

export function getStartBonuses(meta: MetaProgress): StartMetaBonuses {
    const cashDef = UPGRADE_MAP.start_cash;
    const repDef = UPGRADE_MAP.start_reputation;
    const whDef = UPGRADE_MAP.start_warehouse;
    const ageDef = UPGRADE_MAP.retire_age;
    return {
        cashBonus: meta.levels.start_cash * cashDef.perLevel,
        reputationBonus: meta.levels.start_reputation * repDef.perLevel,
        warehouseBonus: meta.levels.start_warehouse * whDef.perLevel,
        endAge: END_AGE + meta.levels.retire_age * ageDef.perLevel,
    };
}

export function formatStartWarehouse(meta: MetaProgress): number {
    return START_WAREHOUSE + getStartBonuses(meta).warehouseBonus;
}

function assetPoints(assets: number): number {
    if (assets < 100_000) return 0;
    if (assets < 1_000_000) return 5;
    if (assets < 10_000_000) return 12;
    if (assets < 50_000_000) return 20;
    if (assets < 100_000_000) return 28;
    return 40;
}

function rankPoints(tier: ReturnType<typeof getRank>["tier"]): number {
    switch (tier) {
        case "winner":
            return 50;
        case "almost":
            return 25;
        case "middle":
            return 10;
        default:
            return 0;
    }
}

function outcomeBase(reason: GameState["gameOverReason"]): number {
    let base = 10;
    if (reason === "retirement") base += 15;
    else if (reason === "death" || reason === "bankruptcy") base += 5;
    else if (reason === "suicide") base += 2;
    return base;
}

export function runKey(game: GameState): string {
    const assets = game.totalAssets ?? totalAssets(game);
    return `${game.seed ?? 0}|${game.age}|${game.gameOverReason ?? "none"}|${assets}`;
}

/**
 * Points for a finished run.
 * Early suicide (still starting age — 刷完投胎／首抽就走、未過完一年) = 0.
 */
export function computeRunPoints(game: GameState): number {
    if (game.phase !== "dead" && game.phase !== "retired") return 0;

    // 未完成第一年就重新投胎：只係刷投胎，唔俾分。
    if (game.gameOverReason === "suicide" && game.age <= START_AGE) {
        return 0;
    }

    const assets = game.totalAssets ?? totalAssets(game);
    const rank = getRank(assets);
    const yearsLived = Math.max(0, game.age - START_AGE);
    const longevity = Math.min(20, Math.floor(yearsLived / 2));

    let earned = outcomeBase(game.gameOverReason) + rankPoints(rank.tier) + assetPoints(assets) + longevity;
    if (game.easyMode) {
        earned = Math.floor(earned * 0.75);
    }
    return Math.max(1, earned);
}

export interface AwardResult {
    meta: MetaProgress;
    earned: number;
    alreadyAwarded: boolean;
}

export function awardRun(meta: MetaProgress, game: GameState): AwardResult {
    if (game.phase !== "dead" && game.phase !== "retired") {
        return {meta, earned: 0, alreadyAwarded: false};
    }
    const key = runKey(game);
    if (meta.lastAwardedRunKey === key) {
        return {meta, earned: 0, alreadyAwarded: true};
    }
    const earned = computeRunPoints(game);
    return {
        meta: {
            ...meta,
            points: meta.points + earned,
            lifetimePointsEarned: meta.lifetimePointsEarned + earned,
            lastAwardedRunKey: key,
        },
        earned,
        alreadyAwarded: false,
    };
}
