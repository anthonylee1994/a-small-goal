import type {CompanyDef, CompanyTypeId} from "../types/game";

export const COMPANIES: readonly CompanyDef[] = [
    {
        id: "bubble_tea",
        name: "珍珠奶茶店",
        cost: 80_000,
        annualIncome: 40_000,
        maintenance: 15_000,
        valuation: 120_000,
        minReputation: 0,
        failChance: 0.08,
    },
    {
        id: "netcafe",
        name: "網吧",
        cost: 200_000,
        annualIncome: 90_000,
        maintenance: 35_000,
        valuation: 280_000,
        minReputation: 10,
        failChance: 0.1,
    },
    {
        id: "ai_startup",
        name: "AI 科技初創",
        cost: 1_500_000,
        annualIncome: 600_000,
        maintenance: 200_000,
        valuation: 2_500_000,
        minReputation: 40,
        failChance: 0.18,
    },
    {
        id: "property",
        name: "房地產集團",
        cost: 8_000_000,
        annualIncome: 2_000_000,
        maintenance: 500_000,
        valuation: 12_000_000,
        minReputation: 60,
        failChance: 0.12,
    },
] as const;

export const COMPANY_MAP: Record<CompanyTypeId, CompanyDef> = Object.fromEntries(
    COMPANIES.map(c => [c.id, c]),
) as Record<CompanyTypeId, CompanyDef>;
