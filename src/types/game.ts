/** MVP domain types — aligned with SPEC.md §6 / §14 */

export type Phase = "title" | "event" | "playing" | "dead" | "retired";
export type GameOverReason = "death" | "retirement";
export type BirthFamilyId = "low_class" | "middle_class" | "high_class";

export type GoodTier = "low" | "mid" | "high";

export type GoodId = "chips" | "vitasoy" | "phone" | "sneakers" | "bitcoin" | "gold" | "ev" | "options";

export type CompanyTypeId =
    | "bubble_tea"
    | "claw_arcade"
    | "esports"
    | "ghost_kitchen"
    | "tutoring"
    | "feng_shui"
    | "live_commerce"
    | "ai_startup"
    | "crypto_exchange"
    | "parking_empire"
    | "property";

export type PartnerId = "mary" | "jenny" | "jessica";

export type EventId =
    | "snack_boom"
    | "crypto_crash"
    | "windfall"
    | "collapse"
    | "nothing"
    | "vitasoy_craze"
    | "phone_hype"
    | "sneaker_frenzy"
    | "gold_rush"
    | "ev_subsidy"
    | "options_moon"
    | "phone_brick"
    | "gold_dump"
    | "options_wipeout"
    | "sneaker_flop"
    | "ev_price_war"
    | "chips_recall"
    | "bitcoin_moon"
    | "gov_cash"
    | "landlord_rage"
    | "scam_course"
    | "lai_see"
    | "food_poisoning"
    | "overtime_bonus"
    | "spa_reboot"
    | "typhoon_rest"
    | "gym_trap"
    | "mtr_apology"
    | "relative_borrow"
    | "lucky_draw";

export type RankTier = "bottom" | "middle" | "almost" | "winner";

export interface LogEntry {
    id: string;
    age: number;
    text: string;
    tone: "info" | "good" | "bad" | "event";
}

export interface Child {
    id: string;
    name: string;
    birthAge: number;
    matured: boolean;
}

export interface OwnedCompany {
    typeId: CompanyTypeId;
    foundedAge: number;
}

export interface Rank {
    tier: RankTier;
    title: string;
    message: string;
}

export interface GoodDef {
    id: GoodId;
    name: string;
    tier: GoodTier;
    basePrice: number;
    /** Warehouse slots per unit. */
    space: number;
}

export interface CompanyDef {
    id: CompanyTypeId;
    name: string;
    cost: number;
    annualIncome: number;
    maintenance: number;
    valuation: number;
    minReputation: number;
    failChance: number;
}

export interface PartnerInstantEffect {
    cash?: number;
    health?: number;
    reputation?: number;
}

export interface PartnerYearlyEffect {
    cash?: number;
    health?: number;
    reputation?: number;
    childChanceBonus?: number;
}

export interface PartnerDef {
    id: PartnerId;
    name: string;
    weddingCost: number;
    requireCash?: number;
    requireReputation?: number;
    requireAssets?: number;
    instant: PartnerInstantEffect;
    yearly: PartnerYearlyEffect;
}

export type EventEffect = {type: "price_mult"; goodId: GoodId; mult: number} | {type: "cash"; amount: number} | {type: "health"; amount: number};

export interface EventDef {
    id: EventId;
    title: string;
    message: string;
    weight: number;
    effects: EventEffect[];
}

export interface BirthFamilyDef {
    id: BirthFamilyId;
    name: string;
    startingCash: number;
    weight: number;
}

export interface GameState {
    phase: Phase;
    age: number;
    cash: number;
    health: number;
    reputation: number;
    birthFamilyId: BirthFamilyId | null; // title 階段為 null；startGame 後必填
    birthRevealed: boolean; // 開局揭示投胎後先變 true，之後先出事件 modal
    warehouseCapacity: number;
    inventory: Record<GoodId, number>;
    prices: Record<GoodId, number>;
    companies: OwnedCompany[];
    partnerId: PartnerId | null;
    children: Child[];
    currentEventId: EventId | null;
    eventDismissed: boolean;
    debtTurns: number;
    totalAssets: number | null;
    gameOverReason: GameOverReason | null;
    log: LogEntry[];
    seed?: number;
}
