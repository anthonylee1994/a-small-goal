import {
    Ban,
    Bitcoin,
    Bot,
    Building2,
    Car,
    Castle,
    ChartLine,
    CircleDollarSign,
    CircleHelp,
    CloudRain,
    Coffee,
    Compass,
    Cookie,
    CookingPot,
    Crown,
    CupSoda,
    Dices,
    Dumbbell,
    Factory,
    Footprints,
    Frown,
    Gamepad2,
    Gift,
    GraduationCap,
    HandCoins,
    Heart,
    HeartHandshake,
    Home,
    Landmark,
    Medal,
    Meh,
    Monitor,
    ParkingSquare,
    PartyPopper,
    PhoneOff,
    Pill,
    Rocket,
    ShoppingCart,
    Skull,
    Smartphone,
    Smile,
    Sparkles,
    Tent,
    TrainFront,
    TrendingDown,
    TrendingUp,
    Trophy,
    TriangleAlert,
    Users,
    Video,
    Zap,
    type LucideIcon,
} from "lucide-react";
import type {BirthFamilyId, CompanyTypeId, EventId, GoodId, PartnerId, RankTier} from "@/types/game";

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

export const COMPANY_ICONS: Record<CompanyTypeId, LucideIcon> = {
    bubble_tea: Coffee,
    claw_arcade: Gamepad2,
    esports: Monitor,
    ghost_kitchen: CookingPot,
    tutoring: GraduationCap,
    feng_shui: Compass,
    live_commerce: Video,
    ai_startup: Bot,
    crypto_exchange: Landmark,
    parking_empire: ParkingSquare,
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
    vitasoy_craze: CupSoda,
    phone_hype: Smartphone,
    sneaker_frenzy: Footprints,
    gold_rush: Medal,
    ev_subsidy: Car,
    options_moon: TrendingUp,
    phone_brick: PhoneOff,
    gold_dump: TrendingDown,
    options_wipeout: Ban,
    sneaker_flop: TrendingDown,
    ev_price_war: TrendingDown,
    chips_recall: Cookie,
    bitcoin_moon: Rocket,
    gov_cash: HandCoins,
    landlord_rage: Home,
    scam_course: TriangleAlert,
    lai_see: Gift,
    food_poisoning: Pill,
    overtime_bonus: Sparkles,
    spa_reboot: Heart,
    typhoon_rest: CloudRain,
    gym_trap: Dumbbell,
    mtr_apology: TrainFront,
    relative_borrow: Users,
    lucky_draw: PartyPopper,
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
