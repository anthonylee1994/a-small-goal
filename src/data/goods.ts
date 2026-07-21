import type {GoodDef, GoodId} from "../types/game";

export const GOODS: readonly GoodDef[] = [
    {id: "chips", name: "薯片", tier: "low", basePrice: 20, space: 1},
    {id: "vitasoy", name: "維他奶", tier: "low", basePrice: 50, space: 1},
    {id: "phone", name: "智能手機", tier: "mid", basePrice: 8_000, space: 1},
    {id: "sneakers", name: "名牌波鞋", tier: "mid", basePrice: 3_000, space: 1},
    {id: "bitcoin", name: "比特幣", tier: "high", basePrice: 50_000, space: 1},
    {id: "gold", name: "黃金", tier: "high", basePrice: 20_000, space: 1},
    {id: "ev", name: "電動車", tier: "high", basePrice: 300_000, space: 1},
    {id: "options", name: "美股期權", tier: "high", basePrice: 15_000, space: 1},
] as const;

export const GOOD_MAP: Record<GoodId, GoodDef> = Object.fromEntries(GOODS.map(g => [g.id, g])) as Record<
    GoodId,
    GoodDef
>;
