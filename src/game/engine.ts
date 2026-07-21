import {BIRTH_FAMILIES} from "../data/birthFamilies";
import {COMPANIES, COMPANY_MAP} from "../data/companies";
import {EVENT_MAP, EVENTS} from "../data/events";
import {GOOD_MAP, GOODS} from "../data/goods";
import {PARTNER_MAP, PARTNERS} from "../data/partners";
import type {Child, CompanyTypeId, EventDef, GameState, GoodId, LogEntry, PartnerId, Rank, RankTier} from "../types/game";
import {
    BASE_CHILD_CHANCE,
    CHILD_MATURE_YEARS,
    CHILD_TUITION,
    END_AGE,
    HEALTH_DRAIN_PER_TURN,
    ILLNESS_FEE,
    ILLNESS_HEALTH_RESTORE,
    ILLNESS_HEALTH_THRESHOLD,
    INFLATION_PER_YEAR,
    MAX_CHILDREN,
    MAX_LOGS,
    PRICE_RANDOM_MAX,
    PRICE_RANDOM_MIN,
    START_AGE,
    START_HEALTH,
    START_REPUTATION,
    START_WAREHOUSE,
    WAREHOUSE_UPGRADE_COST,
    WAREHOUSE_UPGRADE_SIZE,
} from "./constants";
import {clamp, formatMoney} from "./format";
import {createRng, pickWeighted, randomBetween, randomInt, type Rng} from "./rng";

const CHILD_NAMES = ["小明", "小美", "阿強", "嘉欣", "梓軒", "詩詩", "浩然", "欣怡", "子傑", "樂怡"];

function emptyInventory(): Record<GoodId, number> {
    return Object.fromEntries(GOODS.map(g => [g.id, 0])) as Record<GoodId, number>;
}

function emptyPrices(): Record<GoodId, number> {
    return Object.fromEntries(GOODS.map(g => [g.id, 0])) as Record<GoodId, number>;
}

function makeLog(state: GameState, text: string, tone: LogEntry["tone"]): LogEntry {
    return {
        id: `${state.seed ?? 0}-${state.age}-${state.log.length}`,
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

export function companyValue(state: GameState): number {
    return state.companies.reduce((sum, c) => sum + (COMPANY_MAP[c.typeId]?.valuation ?? 0), 0);
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

function applyEventNonPriceEffects(state: GameState, event: EventDef): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];

    for (const effect of event.effects) {
        switch (effect.type) {
            case "cash":
                next = {...next, cash: next.cash + effect.amount};
                messages.push(effect.amount >= 0 ? `現金 +${formatMoney(effect.amount)}` : `現金 ${formatMoney(effect.amount)}`);
                break;
            case "health":
                next = {...next, health: clamp(next.health + effect.amount, 0, 100)};
                messages.push(`健康 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`);
                break;
            case "price_mult": {
                const name = GOOD_MAP[effect.goodId]?.name ?? effect.goodId;
                messages.push(`${name} 價格 ×${effect.mult}`);
                break;
            }
        }
    }

    return {state: next, messages};
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
        prices: emptyPrices(),
        companies: [],
        partnerId: null,
        children: [],
        currentEventId: null,
        eventDismissed: false,
        debtTurns: 0,
        totalAssets: null,
        gameOverReason: null,
        log: [],
        seed,
    };
}

export function startGame(state: GameState, seed?: number): GameState {
    const nextSeed = seed ?? state.seed ?? Date.now();
    const rng = createRng(nextSeed);
    const family = pickWeighted(rng, BIRTH_FAMILIES);

    let next: GameState = {
        ...createInitialState(nextSeed),
        cash: family.startingCash,
        birthFamilyId: family.id,
        birthRevealed: false,
        seed: nextSeed,
    };

    next = pushLog(next, `投胎成功：你而家係一名${family.name}，起步資金 ${formatMoney(family.startingCash)}`, "good");

    return beginTurn(next);
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
    const applied = applyEventNonPriceEffects({...state, prices}, event);

    let next: GameState = {
        ...applied.state,
        phase: "event",
        prices,
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

    let next: GameState = {
        ...state,
        cash: state.cash - cost,
        inventory: {
            ...state.inventory,
            [goodId]: (state.inventory[goodId] ?? 0) + quantity,
        },
    };
    return pushLog(next, `買入 ${good.name} x${quantity}，花費 ${formatMoney(cost)}。`, "info");
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
    let next: GameState = {
        ...state,
        cash: state.cash + revenue,
        inventory: {
            ...state.inventory,
            [goodId]: owned - quantity,
        },
    };
    return pushLog(next, `賣出 ${good.name} x${quantity}，收入 ${formatMoney(revenue)}。`, "good");
}

export function upgradeWarehouse(state: GameState): GameState {
    if (state.phase !== "playing") return state;
    if (state.cash < WAREHOUSE_UPGRADE_COST) {
        return pushLog(state, `升級倉庫要 ${formatMoney(WAREHOUSE_UPGRADE_COST)}，錢唔夠。`, "bad");
    }

    let next: GameState = {
        ...state,
        cash: state.cash - WAREHOUSE_UPGRADE_COST,
        warehouseCapacity: state.warehouseCapacity + WAREHOUSE_UPGRADE_SIZE,
    };
    return pushLog(next, `倉庫升級！容量 ${next.warehouseCapacity - WAREHOUSE_UPGRADE_SIZE} → ${next.warehouseCapacity}`, "good");
}

export function foundCompany(state: GameState, companyId: CompanyTypeId): GameState {
    if (state.phase !== "playing") return state;
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
    const rng = turnRng(state, 100 + companyId.length);
    const roll = rng();

    let next: GameState = {
        ...state,
        cash: state.cash - def.cost,
    };

    if (roll > successChance) {
        next = pushLog(next, `開${def.name}失敗！蝕晒 ${formatMoney(def.cost)} 籌備費。（成功率 ${(successChance * 100).toFixed(0)}%）`, "bad");
        return {...next, reputation: clamp(next.reputation - 3, 0, 100)};
    }

    next = {
        ...next,
        companies: [...next.companies, {typeId: companyId, foundedAge: next.age}],
        reputation: clamp(next.reputation + 5, 0, 100),
    };
    return pushLog(next, `成功創立${def.name}！`, "good");
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
    return next;
}

function settleCompanies(state: GameState, rng: Rng): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];
    const kept: typeof next.companies = [];

    for (const company of next.companies) {
        const def = COMPANY_MAP[company.typeId];
        if (!def) continue;

        next = {...next, cash: next.cash + def.annualIncome};
        next = {...next, cash: next.cash - def.maintenance};
        messages.push(`${def.name}：收入 +${formatMoney(def.annualIncome)}，維護 -${formatMoney(def.maintenance)}`);

        const failChance = clamp(def.failChance - next.reputation / 500, 0.01, 0.35);
        if (rng() < failChance) {
            messages.push(`${def.name} 倒閉！估值歸 0。`);
            next = {...next, reputation: clamp(next.reputation - 8, 0, 100)};
        } else {
            kept.push(company);
        }
    }

    return {state: {...next, companies: kept}, messages};
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
    if (next.partnerId) {
        const bonus = PARTNER_MAP[next.partnerId]?.yearly.health ?? 0;
        drain -= bonus;
        if (bonus > 0) messages.push(`伴侶照顧你，抵銷健康消耗 ${bonus}`);
    }

    next = {...next, health: clamp(next.health - Math.max(0, drain), 0, 100)};
    messages.push(`一年操勞，健康 ${drain > 0 ? `-${drain}` : "無損"}`);

    if (next.health > 0 && next.health < ILLNESS_HEALTH_THRESHOLD) {
        next = {
            ...next,
            cash: next.cash - ILLNESS_FEE,
            health: clamp(next.health + ILLNESS_HEALTH_RESTORE, 0, 100),
        };
        messages.push(`大病住院！醫療費 ${formatMoney(ILLNESS_FEE)}，健康恢復至 ${next.health}`);
    }

    return {state: next, messages};
}

function forceLiquidate(state: GameState): {state: GameState; messages: string[]} {
    let next = {...state};
    const messages: string[] = [];

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
        };
        messages.push(`清盤賣出 ${good.name} x${qty}，得返 ${formatMoney(revenue)}`);
    }

    if (next.cash < 0 && next.companies.length > 0) {
        const remaining: typeof next.companies = [];
        for (const company of next.companies) {
            if (next.cash >= 0) {
                remaining.push(company);
                continue;
            }
            const def = COMPANY_MAP[company.typeId];
            if (!def) continue;
            next = {...next, cash: next.cash + def.valuation};
            messages.push(`清盤出售${def.name}，估值回收 ${formatMoney(def.valuation)}`);
        }
        next = {...next, companies: remaining};
    }

    return {state: next, messages};
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

/** 玩家主動結束今世，進入結算後可重新投胎。 */
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
    return pushLog(next, `你選擇結束今世，準備重新投胎。總資產 ${formatMoney(assets)}`, "bad");
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
    let next: GameState = {...state};

    {
        const cos = settleCompanies(next, rng);
        next = cos.state;
        messages.push(...cos.messages);
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
        const debtTurns = next.debtTurns + 1;
        next = {...next, debtTurns};
        messages.push(`現金見紅（連續 ${debtTurns} 年）`);
        const liq = forceLiquidate(next);
        next = {
            ...liq.state,
            debtTurns: liq.state.cash >= 0 ? 0 : debtTurns,
        };
        messages.push(...liq.messages);
        if (next.cash < 0) {
            messages.push("清盤後仍然負資產…下年再嚟。");
        }
    } else {
        next = {...next, debtTurns: 0};
    }

    for (const msg of messages) {
        next = pushLog(next, msg, msg.includes("倒閉") || msg.includes("見紅") ? "bad" : "info");
    }

    if (next.health <= 0) return finishDeath(next);

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
    return COMPANIES.map(c => ({
        ...c,
        owned: state.companies.some(x => x.typeId === c.id),
        canAfford: state.cash >= c.cost,
        repOk: state.reputation >= c.minReputation,
    }));
}

export function getCurrentEvent(state: GameState): EventDef | null {
    return state.currentEventId ? (EVENT_MAP[state.currentEventId] ?? null) : null;
}
