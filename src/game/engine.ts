import {BIRTH_FAMILIES} from "../data/birthFamilies";
import {COMPANIES, COMPANY_MAP} from "../data/companies";
import {EVENT_MAP, EVENTS} from "../data/events";
import {GOOD_MAP, GOODS} from "../data/goods";
import {PARTNER_MAP, PARTNERS} from "../data/partners";
import type {Child, CompanyClosure, CompanyTypeId, EventDef, GameState, GoodId, LogEntry, MilestoneId, OwnedCompany, PartnerId, Rank, RankTier, TurnSummary} from "../types/game";
import {
    BASE_CHILD_CHANCE,
    CASH_LOSS_MAX_FRACTION,
    CASH_LOSS_MIN_RESERVE,
    CHILD_MATURE_YEARS,
    CHILD_TUITION,
    COMPANY_COLLAPSE_GRACE_YEARS,
    COMPANY_FAIL_REFUND_RATE,
    COMPANY_SHARE_PRICE_MAX,
    COMPANY_SHARE_PRICE_MIN,
    COMPANY_TOTAL_SHARES,
    DOCTOR_BASE_FEE,
    DOCTOR_FEE_CAP,
    DOCTOR_WEALTH_RATE,
    DONATE_BASE_FEE,
    DONATE_REP_COST_SCALE,
    DONATE_REP_GAIN,
    END_AGE,
    FREE_CHECKUP_AGE_STEP,
    FREE_CHECKUP_HEALTH,
    HEALTH_DRAIN_PER_TURN,
    ILLNESS_FEE,
    ILLNESS_HEALTH_RESTORE,
    ILLNESS_HEALTH_THRESHOLD,
    INFLATION_PER_YEAR,
    MAX_CHILDREN,
    MAX_LOGS,
    MILESTONE_THRESHOLDS,
    PRICE_CHEAP_RATIO,
    PRICE_EXPENSIVE_RATIO,
    PRICE_RANDOM_MAX,
    PRICE_RANDOM_MIN,
    START_AGE,
    START_HEALTH,
    START_REPUTATION,
    START_WAREHOUSE,
    WAREHOUSE_UPGRADE_COST_BASE,
    WAREHOUSE_UPGRADE_COST_GROWTH,
    WAREHOUSE_UPGRADE_SIZE,
} from "./constants";
import {clamp, formatMoney} from "./format";
import {createRng, pickWeighted, randomBetween, randomInt, type Rng} from "./rng";

export type PriceSignal = "cheap" | "fair" | "expensive";

export interface StartGameOptions {
    easyMode?: boolean;
}

const CHILD_NAMES = ["小明", "小美", "阿強", "嘉欣", "梓軒", "詩詩", "浩然", "欣怡", "子傑", "樂怡"];

function emptyInventory(): Record<GoodId, number> {
    return Object.fromEntries(GOODS.map(g => [g.id, 0])) as Record<GoodId, number>;
}

function emptyPrices(): Record<GoodId, number> {
    return Object.fromEntries(GOODS.map(g => [g.id, 0])) as Record<GoodId, number>;
}

function emptyCompanySharePrices(): Record<CompanyTypeId, number> {
    return Object.fromEntries(COMPANIES.map(c => [c.id, 0])) as Record<CompanyTypeId, number>;
}

function generateCompanySharePrices(age: number, rng: Rng): Record<CompanyTypeId, number> {
    const infl = inflationFactor(age);
    const prices = emptyCompanySharePrices();
    for (const company of COMPANIES) {
        const roll = randomBetween(rng, COMPANY_SHARE_PRICE_MIN, COMPANY_SHARE_PRICE_MAX);
        const marketCap = company.valuation * infl * roll;
        prices[company.id] = Math.max(1, Math.round(marketCap / COMPANY_TOTAL_SHARES));
    }
    return prices;
}

/** Ownership fraction 0–1. */
export function companyOwnership(company: OwnedCompany): number {
    const shares = Math.max(0, Math.min(COMPANY_TOTAL_SHARES, company.shares ?? 0));
    return shares / COMPANY_TOTAL_SHARES;
}

export function getCompanySharePrice(state: GameState, typeId: CompanyTypeId): number {
    const live = state.companySharePrices?.[typeId];
    if (live != null && live > 0) return live;
    const def = COMPANY_MAP[typeId];
    if (!def) return 0;
    return Math.max(1, Math.round((def.valuation * inflationFactor(state.age)) / COMPANY_TOTAL_SHARES));
}

export function normalizeOwnedCompany(raw: Partial<OwnedCompany> & {typeId: CompanyTypeId; foundedAge: number}): OwnedCompany {
    const def = COMPANY_MAP[raw.typeId];
    const shares = raw.shares ?? COMPANY_TOTAL_SHARES;
    const costBasis = raw.costBasis ?? def?.cost ?? 0;
    return {
        typeId: raw.typeId,
        foundedAge: raw.foundedAge,
        shares: clamp(Math.round(shares), 0, COMPANY_TOTAL_SHARES),
        costBasis: Math.max(0, costBasis),
    };
}

function makeLog(state: GameState, text: string, tone: LogEntry["tone"]): LogEntry {
    // Include text hash so consecutive same-length logs (e.g. two founding fails) get distinct ids for toast.
    return {
        id: `${state.seed ?? 0}-${state.age}-${state.log.length}-${hashString(text)}`,
        age: state.age,
        text,
        tone,
    };
}

function pushLog(state: GameState, text: string, tone: LogEntry["tone"] = "info"): GameState {
    const entry = makeLog(state, text, tone);
    return {...state, log: [entry, ...state.log].slice(0, MAX_LOGS)};
}

function isPositiveInt(n: number): boolean {
    return Number.isInteger(n) && n > 0;
}

function turnRng(state: GameState, salt: number): Rng {
    return createRng((state.seed ?? 0) + state.age * 9973 + salt);
}

/** Stable non-cryptographic hash so company ids get distinct RNG salts. */
function hashString(input: string): number {
    let h = 2166136261;
    for (let i = 0; i < input.length; i += 1) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

export function inflationFactor(age: number): number {
    return 1 + Math.max(0, age - START_AGE) * INFLATION_PER_YEAR;
}

export function getUsedWarehouse(state: GameState): number {
    let used = 0;
    for (const good of GOODS) {
        used += (state.inventory[good.id] ?? 0) * good.space;
    }
    return used;
}

export function inventoryValue(state: GameState): number {
    let total = 0;
    for (const good of GOODS) {
        total += (state.inventory[good.id] ?? 0) * (state.prices[good.id] ?? 0);
    }
    return total;
}

/** Total purchase cost basis for one good. */
export function holdingCostTotal(state: GameState, goodId: GoodId): number {
    const qty = state.inventory[goodId] ?? 0;
    if (qty <= 0) return 0;
    return Math.max(0, state.inventoryCost?.[goodId] ?? 0);
}

/** Weighted-average unit cost; 0 when empty. */
export function holdingUnitCost(state: GameState, goodId: GoodId): number {
    const qty = state.inventory[goodId] ?? 0;
    if (qty <= 0) return 0;
    return Math.round(holdingCostTotal(state, goodId) / qty);
}

/** Mark-to-market P&L vs cost basis (positive = floating profit). */
export function holdingUnrealizedPnl(state: GameState, goodId: GoodId): number {
    const qty = state.inventory[goodId] ?? 0;
    if (qty <= 0) return 0;
    const market = qty * (state.prices[goodId] ?? 0);
    return market - holdingCostTotal(state, goodId);
}

export function companyValue(state: GameState): number {
    return state.companies.reduce((sum, c) => {
        const price = getCompanySharePrice(state, c.typeId);
        const shares = c.shares ?? COMPANY_TOTAL_SHARES;
        return sum + price * shares;
    }, 0);
}

export function companySharesHeld(state: GameState, typeId: CompanyTypeId): number {
    return state.companies.find(c => c.typeId === typeId)?.shares ?? 0;
}

export function companyStockCostBasis(state: GameState, typeId: CompanyTypeId): number {
    return state.companies.find(c => c.typeId === typeId)?.costBasis ?? 0;
}

export function companyStockUnrealizedPnl(state: GameState, typeId: CompanyTypeId): number {
    const company = state.companies.find(c => c.typeId === typeId);
    if (!company || company.shares <= 0) return 0;
    const market = getCompanySharePrice(state, typeId) * company.shares;
    return market - company.costBasis;
}

export function totalAssets(state: GameState): number {
    return state.cash + inventoryValue(state) + companyValue(state);
}

export function getRank(assets: number): Rank {
    let tier: RankTier;
    let title: string;
    let message: string;

    if (assets >= 100_000_000) {
        tier = "winner";
        title = "小目標達成！";
        message = "人生贏家，可以隨便開香檳。";
    } else if (assets >= 10_000_000) {
        tier = "almost";
        title = "半隻腳上岸";
        message = "財富自由近在眼前，但仲未完成目標。";
    } else if (assets >= 100_000) {
        tier = "middle";
        title = "平凡中產";
        message = "叫做好過人，勉強買到個兩房單位。";
    } else {
        tier = "bottom";
        title = "社會畜生";
        message = "你呢一生人都係幫老細供樓。";
    }

    return {tier, title, message};
}

function generatePrices(age: number, rng: Rng, eventMults: Partial<Record<GoodId, number>> = {}): Record<GoodId, number> {
    const infl = inflationFactor(age);
    const prices = emptyPrices();
    for (const good of GOODS) {
        const roll = randomBetween(rng, PRICE_RANDOM_MIN, PRICE_RANDOM_MAX);
        const mult = eventMults[good.id] ?? 1;
        prices[good.id] = Math.max(1, Math.round(good.basePrice * infl * roll * mult));
    }
    return prices;
}

function eventPriceMults(event: EventDef): Partial<Record<GoodId, number>> {
    const mults: Partial<Record<GoodId, number>> = {};
    for (const effect of event.effects) {
        if (effect.type === "price_mult") {
            mults[effect.goodId] = (mults[effect.goodId] ?? 1) * effect.mult;
        }
    }
    return mults;
}

/** Soften cash losses so a single event cannot wipe a poor run. Easy mode halves losses. */
export function softenCashLoss(rawAmount: number, cash: number, easyMode: boolean): number {
    if (rawAmount >= 0) return rawAmount;

    let loss = -rawAmount;
    if (easyMode) loss = Math.ceil(loss / 2);

    const byFraction = Math.floor(Math.max(0, cash) * CASH_LOSS_MAX_FRACTION);
    const byReserve = Math.max(0, cash - CASH_LOSS_MIN_RESERVE);
    loss = Math.min(loss, byFraction, byReserve, Math.max(0, cash));
    return -loss;
}

function applyEventNonPriceEffects(state: GameState, event: EventDef): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];

    for (const effect of event.effects) {
        switch (effect.type) {
            case "cash": {
                const amount = softenCashLoss(effect.amount, next.cash, next.easyMode);
                next = {...next, cash: next.cash + amount};
                if (amount !== effect.amount && effect.amount < 0) {
                    messages.push(`現金 ${formatMoney(amount)}（原 ${formatMoney(effect.amount)}，已封頂保護）`);
                } else {
                    messages.push(amount >= 0 ? `現金 +${formatMoney(amount)}` : `現金 ${formatMoney(amount)}`);
                }
                break;
            }
            case "health":
                next = {...next, health: clamp(next.health + effect.amount, 0, 100)};
                messages.push(`健康 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`);
                break;
            case "reputation": {
                const before = next.reputation;
                next = {...next, reputation: clamp(next.reputation + effect.amount, 0, 100)};
                const delta = next.reputation - before;
                messages.push(`名聲 ${delta >= 0 ? "+" : ""}${delta}`);
                break;
            }
            case "price_mult": {
                const name = GOOD_MAP[effect.goodId]?.name ?? effect.goodId;
                messages.push(`${name} 價格 ×${effect.mult}`);
                break;
            }
        }
    }

    return {state: next, messages};
}

export function fairUnitPrice(goodId: GoodId, age: number): number {
    const good = GOOD_MAP[goodId];
    if (!good) return 0;
    return Math.max(1, Math.round(good.basePrice * inflationFactor(age)));
}

export function priceSignal(price: number, fair: number): PriceSignal {
    if (fair <= 0) return "fair";
    const ratio = price / fair;
    if (ratio <= PRICE_CHEAP_RATIO) return "cheap";
    if (ratio >= PRICE_EXPENSIVE_RATIO) return "expensive";
    return "fair";
}

export function priceSignalLabel(signal: PriceSignal): string {
    switch (signal) {
        case "cheap":
            return "平";
        case "expensive":
            return "貴";
        default:
            return "合理";
    }
}

function unlockMilestone(state: GameState, id: MilestoneId, text: string): GameState {
    if (state.milestonesUnlocked.includes(id)) return state;
    let next: GameState = {
        ...state,
        milestonesUnlocked: [...state.milestonesUnlocked, id],
    };
    return pushLog(next, `🏅 ${text}`, "good");
}

function checkAssetMilestones(state: GameState): GameState {
    let next = state;
    const assets = totalAssets(next);
    for (const m of MILESTONE_THRESHOLDS) {
        if (assets >= m.threshold) {
            next = unlockMilestone(next, m.id, `【${m.title}】${m.message}`);
        }
    }
    return next;
}

function checkAgeMilestones(state: GameState): GameState {
    if (state.age >= 40) {
        return unlockMilestone(state, "age_40", "【不惑之年】活到 40 歲，仲未猝死已經贏咗一半人。");
    }
    return state;
}

/** Fill fields missing from older persisted saves. */
export function normalizeGameState(raw: GameState): GameState {
    return {
        ...createInitialState(raw.seed),
        ...raw,
        easyMode: raw.easyMode ?? false,
        milestonesUnlocked: raw.milestonesUnlocked ?? [],
        companyFoundAttempts: raw.companyFoundAttempts ?? 0,
        lastTurnSummary: raw.lastTurnSummary
            ? {
                  ...raw.lastTurnSummary,
                  closures: raw.lastTurnSummary.closures ?? [],
              }
            : null,
        inventory: {...emptyInventory(), ...raw.inventory},
        inventoryCost: {...emptyInventory(), ...(raw.inventoryCost ?? {})},
        prices: {...emptyPrices(), ...raw.prices},
        companySharePrices: {...emptyCompanySharePrices(), ...(raw.companySharePrices ?? {})},
        companies: (raw.companies ?? []).map(c => normalizeOwnedCompany(c)),
        children: raw.children ?? [],
        log: raw.log ?? [],
    };
}

export function createInitialState(seed?: number): GameState {
    return {
        phase: "title",
        age: START_AGE,
        cash: 0,
        health: START_HEALTH,
        reputation: START_REPUTATION,
        birthFamilyId: null,
        birthRevealed: true,
        warehouseCapacity: START_WAREHOUSE,
        inventory: emptyInventory(),
        inventoryCost: emptyInventory(),
        prices: emptyPrices(),
        companies: [],
        companySharePrices: emptyCompanySharePrices(),
        partnerId: null,
        children: [],
        currentEventId: null,
        eventDismissed: false,
        totalAssets: null,
        gameOverReason: null,
        log: [],
        seed,
        easyMode: false,
        milestonesUnlocked: [],
        companyFoundAttempts: 0,
        lastTurnSummary: null,
    };
}

export function startGame(state: GameState, seed?: number, options?: StartGameOptions): GameState {
    const nextSeed = seed ?? state.seed ?? Date.now();
    const easyMode = options?.easyMode ?? state.easyMode ?? false;
    const rng = createRng(nextSeed);
    const family = pickWeighted(rng, BIRTH_FAMILIES);

    let next: GameState = {
        ...createInitialState(nextSeed),
        cash: family.startingCash,
        birthFamilyId: family.id,
        birthRevealed: false,
        seed: nextSeed,
        easyMode,
    };

    next = pushLog(next, `投胎成功：你而家係一名${family.name}，起步資金 ${formatMoney(family.startingCash)}`, "good");
    if (easyMode) {
        next = pushLog(next, "簡易模式開啟：健康消耗減半、負面現金事件較溫和。", "info");
    }

    return beginTurn(next);
}

export function dismissTurnSummary(state: GameState): GameState {
    if (!state.lastTurnSummary) return state;
    return {...state, lastTurnSummary: null};
}

export function dismissBirthReveal(state: GameState): GameState {
    if (state.birthRevealed || !state.birthFamilyId) return state;
    return {...state, birthRevealed: true};
}

export function beginTurn(state: GameState): GameState {
    if (state.phase === "dead" || state.phase === "retired") return state;
    if (state.health <= 0) return finishDeath(state);

    const rng = turnRng(state, 1);
    const event = pickWeighted(rng, EVENTS);
    const prices = generatePrices(state.age, rng, eventPriceMults(event));
    const companySharePrices = generateCompanySharePrices(state.age, rng);
    const applied = applyEventNonPriceEffects({...state, prices, companySharePrices}, event);

    let next: GameState = {
        ...applied.state,
        phase: "event",
        prices,
        companySharePrices,
        currentEventId: event.id,
        eventDismissed: false,
    };

    next = pushLog(next, `【${event.title}】${event.message}`, "event");
    for (const msg of applied.messages) {
        next = pushLog(next, `【${event.title}】${msg}`, "event");
    }

    if (next.health <= 0) return finishDeath(next);
    return next;
}

export function dismissEvent(state: GameState): GameState {
    if (state.phase !== "event") return state;
    return {...state, phase: "playing", eventDismissed: true};
}

/** 睇醫生收費：基價×通脹 + 資產抽成，上限跟通脹。 */
export function getDoctorFee(state: GameState): number {
    const infl = inflationFactor(state.age);
    const base = DOCTOR_BASE_FEE * infl;
    const assets = Math.max(0, totalAssets(state));
    const raw = Math.round(base + assets * DOCTOR_WEALTH_RATE);
    const cap = Math.round(DOCTOR_FEE_CAP * infl);
    return Math.min(cap, Math.max(Math.round(base), raw));
}

export function seeDoctor(state: GameState): GameState {
    if (state.phase !== "playing") return state;
    if (state.health >= 100) return state;

    const fee = getDoctorFee(state);
    if (state.cash < fee) return state;

    const before = state.health;
    let next: GameState = {
        ...state,
        cash: state.cash - fee,
        health: 100,
    };
    return pushLog(next, `睇完醫生，花咗 ${formatMoney(fee)}，健康 ${before} → 100。`, "good");
}

/** 今次捐款實際可得名聲（已計 100 cap）。 */
export function getDonateReputationGain(state: GameState): number {
    if (state.reputation >= 100) return 0;
    return Math.min(DONATE_REP_GAIN, 100 - state.reputation);
}

/** 捐款收費：基價×通脹×(1 + 名聲×SCALE)。 */
export function getDonateFee(state: GameState): number {
    const infl = inflationFactor(state.age);
    const repScale = 1 + Math.max(0, state.reputation) * DONATE_REP_COST_SCALE;
    return Math.max(1, Math.round(DONATE_BASE_FEE * infl * repScale));
}

export function donate(state: GameState): GameState {
    if (state.phase !== "playing") return state;
    const gain = getDonateReputationGain(state);
    if (gain <= 0) return state;

    const fee = getDonateFee(state);
    if (state.cash < fee) return state;

    const before = state.reputation;
    let next: GameState = {
        ...state,
        cash: state.cash - fee,
        reputation: clamp(state.reputation + gain, 0, 100),
    };
    return pushLog(next, `捐咗 ${formatMoney(fee)} 做公益，名聲 ${before} → ${next.reputation}（+${gain}）。`, "good");
}

export function buyGood(state: GameState, goodId: GoodId, quantity: number): GameState {
    if (state.phase !== "playing") return state;
    if (!isPositiveInt(quantity)) return state;

    const good = GOOD_MAP[goodId];
    const price = state.prices[goodId];
    if (!good || price == null || price <= 0) return state;

    const cost = price * quantity;
    const needSpace = good.space * quantity;
    const free = state.warehouseCapacity - getUsedWarehouse(state);

    if (needSpace > free) {
        return pushLog(state, `倉庫唔夠位！剩餘 ${free} 格。`, "bad");
    }
    if (state.cash < cost) {
        return pushLog(state, `錢唔夠！需要 ${formatMoney(cost)}。`, "bad");
    }

    const prevQty = state.inventory[goodId] ?? 0;
    const prevCost = state.inventoryCost?.[goodId] ?? 0;
    const nextQty = prevQty + quantity;
    const nextCost = prevCost + cost;

    let next: GameState = {
        ...state,
        cash: state.cash - cost,
        inventory: {
            ...state.inventory,
            [goodId]: nextQty,
        },
        inventoryCost: {
            ...emptyInventory(),
            ...state.inventoryCost,
            [goodId]: nextCost,
        },
    };
    next = pushLog(next, `買入 ${good.name} x${quantity}，花費 ${formatMoney(cost)}。`, "info");
    return checkAssetMilestones(next);
}

export function sellGood(state: GameState, goodId: GoodId, quantity: number): GameState {
    if (state.phase !== "playing") return state;
    if (!isPositiveInt(quantity)) return state;

    const good = GOOD_MAP[goodId];
    const owned = state.inventory[goodId] ?? 0;
    if (!good) return state;
    if (quantity > owned) {
        return pushLog(state, "你冇咁多貨！", "bad");
    }

    const price = state.prices[goodId] ?? 0;
    const revenue = price * quantity;
    const prevCost = state.inventoryCost?.[goodId] ?? 0;
    const costSold = owned > 0 ? Math.round((prevCost * quantity) / owned) : 0;
    const remainQty = owned - quantity;
    const remainCost = remainQty <= 0 ? 0 : Math.max(0, prevCost - costSold);
    const pnl = revenue - costSold;

    let next: GameState = {
        ...state,
        cash: state.cash + revenue,
        inventory: {
            ...state.inventory,
            [goodId]: remainQty,
        },
        inventoryCost: {
            ...emptyInventory(),
            ...state.inventoryCost,
            [goodId]: remainCost,
        },
    };
    const pnlText = pnl === 0 ? "" : pnl > 0 ? `，帳面賺 ${formatMoney(pnl)}` : `，帳面蝕 ${formatMoney(Math.abs(pnl))}`;
    next = pushLog(next, `賣出 ${good.name} x${quantity}，收入 ${formatMoney(revenue)}${pnlText}。`, pnl >= 0 ? "good" : "bad");
    if (revenue > 0 && !next.milestonesUnlocked.includes("first_trade_profit")) {
        next = unlockMilestone(next, "first_trade_profit", "【第一桶金】成功賣出貨品套現，炒家之路開始。");
    }
    return checkAssetMilestones(next);
}

/** How many upgrades already applied from starting capacity. */
export function warehouseUpgradeLevel(capacity: number): number {
    return Math.max(0, Math.round((capacity - START_WAREHOUSE) / WAREHOUSE_UPGRADE_SIZE));
}

/**
 * Next warehouse upgrade cost — exponential in upgrade level:
 * BASE × GROWTH^level (level 0 = first upgrade from starting capacity).
 */
export function getWarehouseUpgradeCost(capacity: number): number {
    const level = warehouseUpgradeLevel(capacity);
    return Math.max(1, Math.round(WAREHOUSE_UPGRADE_COST_BASE * Math.pow(WAREHOUSE_UPGRADE_COST_GROWTH, level)));
}

export function upgradeWarehouse(state: GameState): GameState {
    if (state.phase !== "playing") return state;

    const cost = getWarehouseUpgradeCost(state.warehouseCapacity);
    if (state.cash < cost) {
        return pushLog(state, `升級倉庫要 ${formatMoney(cost)}，錢唔夠。`, "bad");
    }

    const before = state.warehouseCapacity;
    const after = before + WAREHOUSE_UPGRADE_SIZE;
    let next: GameState = {
        ...state,
        cash: state.cash - cost,
        warehouseCapacity: after,
    };
    return pushLog(next, `倉庫升級！容量 ${before} → ${after}（第 ${warehouseUpgradeLevel(after)} 次擴建，花費 ${formatMoney(cost)}）`, "good");
}

export function foundCompany(state: GameState, companyId: CompanyTypeId): GameState {
    if (state.phase !== "playing") {
        return pushLog(state, "而家唔係操作階段，唔可以創業。", "bad");
    }
    const def = COMPANY_MAP[companyId];
    if (!def) return state;

    if (state.companies.some(c => c.typeId === companyId)) {
        return pushLog(state, `你已經有間${def.name}啦。`, "bad");
    }
    if (state.cash < def.cost) {
        return pushLog(state, `開${def.name}要 ${formatMoney(def.cost)}，錢唔夠。`, "bad");
    }
    if (state.reputation < def.minReputation) {
        return pushLog(state, `名聲唔夠開${def.name}（需要 ${def.minReputation}，你得 ${state.reputation}）。`, "bad");
    }

    const successChance = clamp(0.55 + state.reputation / 200 - def.failChance, 0.35, 0.95);
    const firstAttempt = state.companyFoundAttempts === 0;
    const guaranteed = firstAttempt;
    // Mix attempt count + company id so retries in the same year re-roll instead of replaying the same seed.
    const attemptSalt = 100 + hashString(companyId) + state.companyFoundAttempts * 7919;
    const rng = turnRng(state, attemptSalt);
    const roll = rng();

    let next: GameState = {
        ...state,
        cash: state.cash - def.cost,
        companyFoundAttempts: state.companyFoundAttempts + 1,
    };

    if (!guaranteed && roll > successChance) {
        const refund = Math.round(def.cost * COMPANY_FAIL_REFUND_RATE);
        next = {
            ...next,
            cash: next.cash + refund,
            reputation: clamp(next.reputation - 3, 0, 100),
        };
        next = pushLog(next, `開${def.name}失敗！退回一半籌備費 ${formatMoney(refund)}，淨蝕 ${formatMoney(def.cost - refund)}。（成功率 ${(successChance * 100).toFixed(0)}%）`, "bad");
        return next;
    }

    const founded: OwnedCompany = {
        typeId: companyId,
        foundedAge: next.age,
        shares: COMPANY_TOTAL_SHARES,
        costBasis: def.cost,
    };
    next = {
        ...next,
        companies: [...next.companies, founded],
        reputation: clamp(next.reputation + 5, 0, 100),
    };
    const sharePrice = getCompanySharePrice(next, companyId);
    const bonus = guaranteed ? "（第一次創業保底成功！）" : "";
    next = pushLog(next, `成功創立${def.name}！持有 ${COMPANY_TOTAL_SHARES} 股（100%），現價約 ${formatMoney(sharePrice)}/股。${bonus}`, "good");
    next = unlockMilestone(next, "first_company", "【老闆上身】成功開舖，開始食公司紅利。");
    return checkAssetMilestones(next);
}

/** Buy back shares of a company you already founded (max 100%). */
export function buyCompanyShares(state: GameState, companyId: CompanyTypeId, shares: number): GameState {
    if (state.phase !== "playing") return state;
    if (!isPositiveInt(shares)) return state;

    const def = COMPANY_MAP[companyId];
    if (!def) return state;

    const idx = state.companies.findIndex(c => c.typeId === companyId);
    if (idx < 0) {
        return pushLog(state, `你未開過${def.name}，唔可以買佢嘅股票。`, "bad");
    }

    const company = normalizeOwnedCompany(state.companies[idx]!);
    const room = COMPANY_TOTAL_SHARES - company.shares;
    if (room <= 0) {
        return pushLog(state, `${def.name} 你已經持有 100% 股份。`, "bad");
    }
    if (shares > room) {
        return pushLog(state, `最多只可以再買入 ${room} 股（而家持有 ${company.shares}%）。`, "bad");
    }

    const price = getCompanySharePrice(state, companyId);
    const cost = price * shares;
    if (state.cash < cost) {
        return pushLog(state, `錢唔夠！買入 ${shares} 股要 ${formatMoney(cost)}。`, "bad");
    }

    const updated: OwnedCompany = {
        ...company,
        shares: company.shares + shares,
        costBasis: company.costBasis + cost,
    };
    const companies = state.companies.map((c, i) => (i === idx ? updated : c));
    let next: GameState = {...state, cash: state.cash - cost, companies};
    next = pushLog(next, `增持${def.name} ${shares} 股，花費 ${formatMoney(cost)}（${formatMoney(price)}/股）。現持 ${updated.shares}%。`, "info");
    return checkAssetMilestones(next);
}

/** Sell shares of your company. Selling all shares closes the company listing. */
export function sellCompanyShares(state: GameState, companyId: CompanyTypeId, shares: number): GameState {
    if (state.phase !== "playing") return state;
    if (!isPositiveInt(shares)) return state;

    const def = COMPANY_MAP[companyId];
    if (!def) return state;

    const idx = state.companies.findIndex(c => c.typeId === companyId);
    if (idx < 0) {
        return pushLog(state, `你未開過${def.name}。`, "bad");
    }

    const company = normalizeOwnedCompany(state.companies[idx]!);
    if (shares > company.shares) {
        return pushLog(state, `你只有 ${company.shares} 股${def.name}。`, "bad");
    }

    const price = getCompanySharePrice(state, companyId);
    const revenue = price * shares;
    const costSold = company.shares > 0 ? Math.round((company.costBasis * shares) / company.shares) : 0;
    const remainShares = company.shares - shares;
    const remainCost = remainShares <= 0 ? 0 : Math.max(0, company.costBasis - costSold);
    const pnl = revenue - costSold;

    let companies: OwnedCompany[];
    if (remainShares <= 0) {
        companies = state.companies.filter((_, i) => i !== idx);
    } else {
        companies = state.companies.map((c, i) => (i === idx ? {...company, shares: remainShares, costBasis: remainCost} : c));
    }

    let next: GameState = {...state, cash: state.cash + revenue, companies};
    const pnlText = pnl === 0 ? "" : pnl > 0 ? `，帳面賺 ${formatMoney(pnl)}` : `，帳面蝕 ${formatMoney(Math.abs(pnl))}`;
    const exitText = remainShares <= 0 ? " 已全部沽清，唔再持有呢間公司。" : ` 剩餘 ${remainShares}%。`;
    next = pushLog(next, `沽出${def.name} ${shares} 股，收入 ${formatMoney(revenue)}（${formatMoney(price)}/股）${pnlText}。${exitText}`, pnl >= 0 ? "good" : "bad");
    return checkAssetMilestones(next);
}

export function canMarry(state: GameState, partnerId: PartnerId): string | null {
    if (state.partnerId) return "你已經有伴啦。";
    const def = PARTNER_MAP[partnerId];
    if (!def) return "搵唔到呢個人。";
    if (state.cash < def.weddingCost) {
        return `結婚成本唔夠（需要 ${formatMoney(def.weddingCost)}）`;
    }
    if (def.requireCash != null && state.cash < def.requireCash) {
        return `現金唔夠（需要 ${formatMoney(def.requireCash)}）`;
    }
    if (def.requireReputation != null && state.reputation < def.requireReputation) {
        return `名聲唔夠（需要 ${def.requireReputation}）`;
    }
    if (def.requireAssets != null && totalAssets(state) < def.requireAssets) {
        return `總資產唔夠（需要 ${formatMoney(def.requireAssets)}）`;
    }
    return null;
}

export function marry(state: GameState, partnerId: PartnerId): GameState {
    if (state.phase !== "playing") return state;
    const err = canMarry(state, partnerId);
    if (err) return pushLog(state, `相親失敗：${err}`, "bad");

    const def = PARTNER_MAP[partnerId]!;
    let next: GameState = {
        ...state,
        partnerId,
        cash: state.cash - def.weddingCost + (def.instant.cash ?? 0),
        health: clamp(state.health + (def.instant.health ?? 0), 0, 100),
        reputation: clamp(state.reputation + (def.instant.reputation ?? 0), 0, 100),
    };
    next = pushLog(next, `同${def.name}結婚啦！婚禮花費 ${formatMoney(def.weddingCost)}。`, "good");
    if (def.instant.cash) {
        next = pushLog(next, `新婚即時效果：現金 ${formatMoney(def.instant.cash)}`, "good");
    }
    next = unlockMilestone(next, "first_marriage", "【成家立室】結咗婚，有人同你分擔健康消耗。");
    return checkAssetMilestones(next);
}

function companyCollapseChance(state: GameState, companyTypeId: CompanyTypeId): number {
    const def = COMPANY_MAP[companyTypeId];
    if (!def) return 0;
    return clamp(def.failChance - state.reputation / 500, 0.01, 0.35);
}

function settleCompanies(state: GameState, rng: Rng): {state: GameState; messages: string[]; closures: CompanyClosure[]} {
    let next = {...state};
    const messages: string[] = [];
    const closures: CompanyClosure[] = [];
    const kept: typeof next.companies = [];

    for (const raw of next.companies) {
        const company = normalizeOwnedCompany(raw);
        const def = COMPANY_MAP[company.typeId];
        if (!def || company.shares <= 0) continue;

        const stake = companyOwnership(company);
        const income = Math.round(def.annualIncome * stake);
        const maintenance = Math.round(def.maintenance * stake);
        next = {...next, cash: next.cash + income};
        next = {...next, cash: next.cash - maintenance};
        messages.push(`${def.name}（${company.shares}%）：收入 +${formatMoney(income)}，維護 -${formatMoney(maintenance)}`);

        // New shops get a grace period so "just opened → gone next year" feels less BS.
        const yearsOpen = next.age - company.foundedAge;
        if (yearsOpen < COMPANY_COLLAPSE_GRACE_YEARS) {
            messages.push(`${def.name}：新舖保護期（仲差 ${COMPANY_COLLAPSE_GRACE_YEARS - yearsOpen} 年先有倒閉風險）`);
            kept.push(company);
            continue;
        }

        const failChance = companyCollapseChance(next, company.typeId);
        if (rng() < failChance) {
            messages.push(`${def.name} 倒閉！持股同估值歸 0。（今年倒閉率約 ${(failChance * 100).toFixed(0)}%）`);
            next = {...next, reputation: clamp(next.reputation - 8, 0, 100)};
            closures.push({typeId: company.typeId, name: def.name, shares: company.shares, reason: "collapse"});
        } else {
            kept.push(company);
        }
    }

    return {state: {...next, companies: kept}, messages, closures};
}

function settleFamily(state: GameState, rng: Rng): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];

    if (next.partnerId) {
        const partner = PARTNER_MAP[next.partnerId];
        if (partner) {
            const y = partner.yearly;
            if (y.cash) {
                next = {...next, cash: next.cash + y.cash};
                messages.push(y.cash < 0 ? `交家用 ${formatMoney(Math.abs(y.cash))}` : `伴侶支援 +${formatMoney(y.cash)}`);
            }
            if (y.reputation) {
                next = {...next, reputation: clamp(next.reputation + y.reputation, 0, 100)};
                messages.push(`伴侶幫你抬名聲 ${y.reputation >= 0 ? "+" : ""}${y.reputation}`);
            }

            const chance = BASE_CHILD_CHANCE + (y.childChanceBonus ?? 0);
            if (rng() < chance && next.children.length < MAX_CHILDREN) {
                const name = CHILD_NAMES[randomInt(rng, 0, CHILD_NAMES.length)]!;
                const child: Child = {
                    id: `child-${next.age}-${next.children.length}`,
                    name,
                    birthAge: next.age,
                    matured: false,
                };
                next = {...next, children: [...next.children, child]};
                messages.push(`添丁！${name} 出世啦！`);
            }
        }
    }

    const updatedChildren: Child[] = [];
    for (const child of next.children) {
        const years = next.age - child.birthAge;
        if (years < CHILD_MATURE_YEARS) {
            next = {...next, cash: next.cash - CHILD_TUITION};
            messages.push(`養大${child.name}（${years}歲）學費 -${formatMoney(CHILD_TUITION)}`);
            updatedChildren.push(child);
        } else if (!child.matured) {
            const roll = rng();
            if (roll < 0.45) {
                const gift = 500_000 + Math.floor(rng() * 2_000_000);
                next = {...next, cash: next.cash + gift};
                messages.push(`${child.name} 出人頭地，孝敬 ${formatMoney(gift)}！`);
            } else if (roll < 0.75) {
                const loss = 200_000 + Math.floor(rng() * 1_500_000);
                next = {...next, cash: next.cash - loss};
                messages.push(`${child.name} 變咗敗家仔，幫你輸咗 ${formatMoney(loss)}…`);
            } else {
                messages.push(`${child.name} 平平穩穩過生活，無功無過。`);
            }
            updatedChildren.push({...child, matured: true});
        } else {
            updatedChildren.push(child);
        }
    }

    return {state: {...next, children: updatedChildren}, messages};
}

function settleHealth(state: GameState): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];

    let drain = HEALTH_DRAIN_PER_TURN;
    if (next.easyMode) drain = Math.max(1, Math.ceil(drain / 2));
    if (next.partnerId) {
        const bonus = PARTNER_MAP[next.partnerId]?.yearly.health ?? 0;
        drain -= bonus;
        if (bonus > 0) messages.push(`伴侶照顧你，抵銷健康消耗 ${bonus}`);
    }

    next = {...next, health: clamp(next.health - Math.max(0, drain), 0, 100)};
    messages.push(`一年操勞，健康 ${drain > 0 ? `-${drain}` : "無損"}`);

    if (next.age > START_AGE && next.age % FREE_CHECKUP_AGE_STEP === 0 && next.health > 0) {
        const before = next.health;
        next = {...next, health: clamp(next.health + FREE_CHECKUP_HEALTH, 0, 100)};
        messages.push(`五年免費身體檢查，健康 ${before} → ${next.health}`);
    }

    if (next.health > 0 && next.health < ILLNESS_HEALTH_THRESHOLD) {
        let fee = ILLNESS_FEE;
        if (next.easyMode) fee = Math.ceil(fee / 2);
        fee = Math.min(fee, Math.max(0, next.cash));
        next = {
            ...next,
            cash: next.cash - fee,
            health: clamp(next.health + ILLNESS_HEALTH_RESTORE, 0, 100),
        };
        messages.push(`大病住院！醫療費 ${formatMoney(fee)}，健康恢復至 ${next.health}`);
    }

    return {state: next, messages};
}

function forceLiquidate(state: GameState): {state: GameState; messages: string[]; closures: CompanyClosure[]} {
    let next = {...state};
    const messages: string[] = [];
    const closures: CompanyClosure[] = [];

    for (const good of GOODS) {
        if (next.cash >= 0) break;
        const qty = next.inventory[good.id] ?? 0;
        if (qty <= 0) continue;
        const price = next.prices[good.id] ?? 0;
        const revenue = price * qty;
        next = {
            ...next,
            cash: next.cash + revenue,
            inventory: {...next.inventory, [good.id]: 0},
            inventoryCost: {...emptyInventory(), ...next.inventoryCost, [good.id]: 0},
        };
        messages.push(`清盤賣出 ${good.name} x${qty}，得返 ${formatMoney(revenue)}`);
    }

    if (next.cash < 0 && next.companies.length > 0) {
        const remaining: typeof next.companies = [];
        for (const raw of next.companies) {
            if (next.cash >= 0) {
                remaining.push(normalizeOwnedCompany(raw));
                continue;
            }
            const company = normalizeOwnedCompany(raw);
            const def = COMPANY_MAP[company.typeId];
            if (!def) continue;
            const price = getCompanySharePrice(next, company.typeId);
            const revenue = price * company.shares;
            next = {...next, cash: next.cash + revenue};
            messages.push(`清盤沽清${def.name} ${company.shares} 股，得返 ${formatMoney(revenue)}`);
            closures.push({typeId: company.typeId, name: def.name, shares: company.shares, reason: "liquidated"});
        }
        next = {...next, companies: remaining};
    }

    return {state: next, messages, closures};
}

function finishDeath(state: GameState): GameState {
    const assets = totalAssets(state);
    let next: GameState = {
        ...state,
        phase: "dead",
        gameOverReason: "death",
        health: 0,
        totalAssets: assets,
    };
    return pushLog(next, `健康歸零，你猝死街頭。總資產 ${formatMoney(assets)}（未活到 60 歲）`, "bad");
}

function finishBankruptcy(state: GameState): GameState {
    const assets = totalAssets(state);
    let next: GameState = {
        ...state,
        phase: "dead",
        gameOverReason: "bankruptcy",
        totalAssets: assets,
    };
    return pushLog(next, `清盤後仍然負債，你破產出局。總資產 ${formatMoney(assets)}`, "bad");
}

export function commitSuicide(state: GameState): GameState {
    if (state.phase === "dead" || state.phase === "retired" || state.phase === "title") return state;

    const assets = totalAssets(state);
    let next: GameState = {
        ...state,
        phase: "dead",
        gameOverReason: "suicide",
        health: 0,
        totalAssets: assets,
    };
    return pushLog(next, `你選擇咗自殺，準備重新投胎。總資產 ${formatMoney(assets)}`, "bad");
}

function finishRetire(state: GameState): GameState {
    const assets = totalAssets(state);
    const rank = getRank(assets);
    let next: GameState = {
        ...state,
        phase: "retired",
        gameOverReason: "retirement",
        age: END_AGE,
        totalAssets: assets,
    };
    return pushLog(next, `60 歲光榮退休！總資產 ${formatMoney(assets)} — ${rank.title}`, rank.tier === "winner" ? "good" : "info");
}

/** SPEC §5 endTurn settlement order. */
export function endTurn(state: GameState): GameState {
    if (state.phase !== "playing") return state;

    const rng = turnRng(state, 4242);
    const messages: string[] = [];
    const closures: CompanyClosure[] = [];
    const cashBefore = state.cash;
    const healthBefore = state.health;
    let companyNet = 0;
    let next: GameState = {...state};

    {
        const cos = settleCompanies(next, rng);
        next = cos.state;
        messages.push(...cos.messages);
        closures.push(...cos.closures);
        for (const company of state.companies) {
            const def = COMPANY_MAP[company.typeId];
            if (!def) continue;
            const stake = companyOwnership(normalizeOwnedCompany(company));
            companyNet += Math.round((def.annualIncome - def.maintenance) * stake);
        }
    }
    {
        const family = settleFamily(next, rng);
        next = family.state;
        messages.push(...family.messages);
    }
    {
        const health = settleHealth(next);
        next = health.state;
        messages.push(...health.messages);
    }

    if (next.cash < 0) {
        messages.push("現金見紅，強制清盤");
        const liq = forceLiquidate(next);
        next = liq.state;
        messages.push(...liq.messages);
        closures.push(...liq.closures);
        if (next.cash < 0) {
            messages.push("清盤後仍然負債，破產出局");
        }
    }

    for (const msg of messages) {
        next = pushLog(next, msg, msg.includes("倒閉") || msg.includes("見紅") || msg.includes("破產") || msg.includes("清盤沽清") ? "bad" : "info");
    }

    const summary: TurnSummary = {
        age: state.age,
        cashBefore,
        cashAfter: next.cash,
        healthBefore,
        healthAfter: next.health,
        companyNet,
        highlights: messages.slice(0, 6),
        closures,
    };
    next = {...next, lastTurnSummary: summary};
    next = checkAgeMilestones(next);
    next = checkAssetMilestones(next);

    if (next.health <= 0) return finishDeath(next);
    if (next.cash < 0) return finishBankruptcy(next);

    const nextAge = next.age + 1;
    if (nextAge >= END_AGE) {
        return finishRetire({...next, age: END_AGE});
    }

    return beginTurn({
        ...next,
        age: nextAge,
        currentEventId: null,
        eventDismissed: false,
    });
}

export function getPartnerOptions(state: GameState) {
    return PARTNERS.map(p => ({
        ...p,
        blockedReason: canMarry(state, p.id),
    }));
}

export function getCompanyOptions(state: GameState) {
    return COMPANIES.map(c => {
        const ownedRaw = state.companies.find(x => x.typeId === c.id);
        const owned = ownedRaw ? normalizeOwnedCompany(ownedRaw) : null;
        const yearsOpen = owned ? state.age - owned.foundedAge : null;
        const inGrace = owned != null && yearsOpen != null && yearsOpen < COMPANY_COLLAPSE_GRACE_YEARS;
        const sharePrice = getCompanySharePrice(state, c.id);
        const fairShare = Math.max(1, Math.round((c.valuation * inflationFactor(state.age)) / COMPANY_TOTAL_SHARES));
        return {
            ...c,
            owned: owned != null,
            ownedShares: owned?.shares ?? 0,
            ownedCostBasis: owned?.costBasis ?? 0,
            canAfford: state.cash >= c.cost,
            repOk: state.reputation >= c.minReputation,
            annualCollapseChance: companyCollapseChance(state, c.id),
            inGrace,
            graceYearsLeft: owned != null && yearsOpen != null ? Math.max(0, COMPANY_COLLAPSE_GRACE_YEARS - yearsOpen) : null,
            sharePrice,
            fairSharePrice: fairShare,
            marketCap: sharePrice * COMPANY_TOTAL_SHARES,
            holdingValue: owned ? sharePrice * owned.shares : 0,
            unrealizedPnl: owned ? sharePrice * owned.shares - owned.costBasis : 0,
            roomToBuy: owned ? COMPANY_TOTAL_SHARES - owned.shares : 0,
        };
    });
}

export function getCurrentEvent(state: GameState): EventDef | null {
    return state.currentEventId ? (EVENT_MAP[state.currentEventId] ?? null) : null;
}
