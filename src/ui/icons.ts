import type {CompanyTypeId, EventId, GoodId, GoodTier, PartnerId} from "@/types/game";

export const GOOD_EMOJI: Record<GoodId, string> = {
    chips: "🥔",
    vitasoy: "🧃",
    phone: "📱",
    sneakers: "👟",
    bitcoin: "₿",
    gold: "🥇",
    ev: "🚗",
    options: "📈",
};

export const TIER_LABEL: Record<GoodTier, string> = {
    low: "低階",
    mid: "中階",
    high: "高階",
};

export const COMPANY_EMOJI: Record<CompanyTypeId, string> = {
    bubble_tea: "🧋",
    netcafe: "🖥️",
    ai_startup: "🤖",
    property: "🏢",
};

export const PARTNER_EMOJI: Record<PartnerId, string> = {
    ming: "😎",
    yan: "💅",
    kei: "👑",
};

export const EVENT_EMOJI: Record<EventId, string> = {
    snack_boom: "💥",
    crypto_crash: "📉",
    windfall: "🎰",
    collapse: "😵",
};
