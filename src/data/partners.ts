import type {PartnerDef, PartnerId} from "../types/game";

export const PARTNERS: readonly PartnerDef[] = [
    {
        id: "ming",
        name: "阿明",
        weddingCost: 50_000,
        requireCash: 80_000,
        instant: {reputation: 5},
        yearly: {cash: -20_000, health: 2, childChanceBonus: 0.05},
    },
    {
        id: "yan",
        name: "嘉欣",
        weddingCost: 200_000,
        requireCash: 300_000,
        requireReputation: 20,
        instant: {cash: 100_000, reputation: 8},
        yearly: {cash: -50_000, health: 4, reputation: 1, childChanceBonus: 0.08},
    },
    {
        id: "kei",
        name: "詩詩",
        weddingCost: 1_000_000,
        requireCash: 2_000_000,
        requireReputation: 50,
        requireAssets: 5_000_000,
        instant: {cash: 500_000, reputation: 15, health: 5},
        yearly: {cash: -120_000, health: 3, reputation: 2, childChanceBonus: 0.1},
    },
] as const;

export const PARTNER_MAP: Record<PartnerId, PartnerDef> = Object.fromEntries(
    PARTNERS.map(p => [p.id, p]),
) as Record<PartnerId, PartnerDef>;
