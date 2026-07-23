/** MVP domain types — aligned with SPEC.md §6 / §14 */

export type Phase = "title" | "event" | "playing" | "dead" | "retired";
export type GameOverReason = "death" | "retirement" | "suicide" | "bankruptcy";
export type BirthFamilyId = "low_class" | "middle_class" | "high_class";

export type GoodId = "chips" | "vitasoy" | "phone" | "sneakers" | "bitcoin" | "gold" | "ev" | "options";

export type CompanyTypeId = "bubble_tea" | "claw_arcade" | "esports" | "ghost_kitchen" | "tutoring" | "feng_shui" | "live_commerce" | "ai_startup" | "crypto_exchange" | "parking_empire" | "property";

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
    | "lucky_draw"
    | "whatsapp_scam"
    | "banquet_debt"
    | "black_rain_bonus"
    | "parking_fine"
    | "stock_group_trap"
    | "viral_milk_tea"
    | "nft_jpeg"
    | "dentist_shock"
    | "karaoke_overtime"
    | "octopus_stuck"
    | "haidilao_birthday"
    | "bus_uncle"
    | "side_hustle_delivery"
    | "flu_wave"
    | "cross_border_shop"
    | "electricity_hike"
    | "mahjong_night"
    | "yum_cha_sunday"
    | "aed_queue"
    | "wfh_commute_save"
    | "sneakers_collab"
    | "gold_cny"
    | "options_fomc"
    | "phone_trade_in_scam"
    | "chips_bar_promo"
    | "bitcoin_etf_rumor"
    | "vitasoy_heatwave"
    | "ev_charger_queue"
    | "red_packet_war"
    | "night_market_win"
    | "office_layoff_rumor"
    | "tax_return"
    | "mid_autumn_box"
    | "double_eleven_sale"
    | "hospital_bill"
    | "ferry_cancel"
    | "wet_market_auntie"
    | "blood_donate"
    | "flag_day"
    | "food_bank_shift"
    | "elderly_visit"
    | "scholarship_fund"
    | "stray_rescue"
    | "community_chest"
    | "typhoon_shelter_help"
    | "corporate_donation"
    | "anonymous_kindness"
    | "organ_donor_card"
    | "park_cleanup";

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
    /** Shares held out of COMPANY_TOTAL_SHARES (full stake when founding). */
    shares: number;
    /** Total cost basis for current shares (founding cost + buybacks − sell cost). */
    costBasis: number;
}

export interface Rank {
    tier: RankTier;
    title: string;
    message: string;
}

/** Company lost during year-end settlement. */
export interface CompanyClosure {
    typeId: CompanyTypeId;
    name: string;
    shares: number;
    reason: "collapse" | "liquidated";
}

/** One-screen highlight after endTurn settlement. */
export interface TurnSummary {
    age: number;
    cashBefore: number;
    cashAfter: number;
    healthBefore: number;
    healthAfter: number;
    companyNet: number;
    highlights: string[];
    /** Companies that closed this settlement (倒閉／清盤). */
    closures: CompanyClosure[];
}

export type MilestoneId = "assets_1m" | "assets_10m" | "assets_50m" | "assets_100m" | "first_trade_profit" | "first_company" | "first_marriage" | "age_40";

export interface GoodDef {
    id: GoodId;
    name: string;
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

export type EventEffect = {type: "price_mult"; goodId: GoodId; mult: number} | {type: "cash"; amount: number} | {type: "health"; amount: number} | {type: "reputation"; amount: number};

/** One player-facing branch for a yearly event. */
export interface EventChoice {
    id: string;
    /** Button label (short). */
    label: string;
    effects: EventEffect[];
}

export interface EventDef {
    id: EventId;
    title: string;
    message: string;
    weight: number;
    /** Player must pick one; effects apply only after chooseEvent. */
    choices: EventChoice[];
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
    /** Total purchase cost basis per good (weighted average on buy, proportional on sell). */
    inventoryCost: Record<GoodId, number>;
    prices: Record<GoodId, number>;
    companies: OwnedCompany[];
    /** Per-share market price this year for each company type. */
    companySharePrices: Record<CompanyTypeId, number>;
    partnerId: PartnerId | null;
    children: Child[];
    currentEventId: EventId | null;
    /** Choice id after player resolves the event; null while still deciding. */
    currentEventChoiceId: string | null;
    /**
     * True until chooseEvent applies this year's choice effects.
     * Legacy saves default to false so old mid-event states are not double-applied.
     */
    eventEffectsPending: boolean;
    eventDismissed: boolean;
    totalAssets: number | null;
    gameOverReason: GameOverReason | null;
    log: LogEntry[];
    seed?: number;
    /** Softer health drain + half negative cash events. */
    easyMode: boolean;
    /** Asset / life milestones already toasted. */
    milestonesUnlocked: MilestoneId[];
    /** First founding attempt is free success; later fails refund half. */
    companyFoundAttempts: number;
    /** Settlement highlight for the year just ended; UI dismisses. */
    lastTurnSummary: TurnSummary | null;
}
