import {
    Bitcoin,
    Bot,
    Building2,
    Car,
    Castle,
    ChartLine,
    CircleDollarSign,
    CircleHelp,
    Coffee,
    Cookie,
    Crown,
    CupSoda,
    Dices,
    Factory,
    Footprints,
    Frown,
    Heart,
    HeartHandshake,
    Home,
    Medal,
    Meh,
    Monitor,
    PartyPopper,
    ShoppingCart,
    Skull,
    Smartphone,
    Smile,
    Tent,
    TrendingDown,
    Trophy,
    TriangleAlert,
    Zap,
    type LucideIcon,
} from "lucide-react";
import type {BirthFamilyId, CompanyTypeId, EventId, GoodId, GoodTier, PartnerId, RankTier} from "@/types/game";

export const GOOD_ICONS: Record<GoodId, LucideIcon> = {
    chips: Cookie,
    vitasoy: CupSoda,
    phone: Smartphone,
    sneakers: Footprints,
    bitcoin: Bitcoin,
    gold: Medal,
    ev: Car,
    options: ChartLine,
};

export const TIER_LABEL: Record<GoodTier, string> = {
    low: "低階",
    mid: "中階",
    high: "高階",
};

export const COMPANY_ICONS: Record<CompanyTypeId, LucideIcon> = {
    bubble_tea: Coffee,
    netcafe: Monitor,
    ai_startup: Bot,
    property: Building2,
};

export const PARTNER_ICONS: Record<PartnerId, LucideIcon> = {
    mary: Smile,
    jenny: Heart,
    jessica: Crown,
};

export const EVENT_ICONS: Record<EventId, LucideIcon> = {
    snack_boom: Zap,
    crypto_crash: TrendingDown,
    windfall: Dices,
    collapse: Frown,
    nothing: Meh,
};

export const BIRTH_FAMILY_ICONS: Record<BirthFamilyId, LucideIcon> = {
    low_class: Tent,
    middle_class: Home,
    high_class: Castle,
};

export const RANK_ICONS: Record<RankTier, LucideIcon> = {
    winner: Trophy,
    almost: Footprints,
    middle: Home,
    bottom: Frown,
};

export const BrandIcon = CircleDollarSign;
export const MarketSectionIcon = ShoppingCart;
export const CompanySectionIcon = Factory;
export const FamilySectionIcon = HeartHandshake;
export const ConfirmDangerIcon = TriangleAlert;
export const ConfirmHelpIcon = CircleHelp;
export const DeathIcon = Skull;
export const RetireIcon = PartyPopper;
