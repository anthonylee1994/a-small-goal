/** MVP domain types — aligned with SPEC.md §6 / §14 */

export type Phase = "title" | "event" | "playing" | "dead" | "retired";
export type GameOverReason = "death" | "retirement";

export type GoodTier = "low" | "mid" | "high";

export type GoodId = "chips" | "vitasoy" | "phone" | "sneakers" | "bitcoin" | "gold" | "ev" | "options";

export type CompanyTypeId = "bubble_tea" | "netcafe" | "ai_startup" | "property";

export type PartnerId = "ming" | "yan" | "kei";

export type EventId = "snack_boom" | "crypto_crash" | "windfall" | "collapse";

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

export interface GameState {
    phase: Phase;
    age: number;
    cash: number;
    health: number;
    reputation: number;
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
