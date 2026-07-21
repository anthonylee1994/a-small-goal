/** Shared MVP constants — SPEC.md §4 / §7 / §11 */

export const START_AGE = 20;
export const END_AGE = 60;
export const START_HEALTH = 100;
export const START_REPUTATION = 0;
export const START_WAREHOUSE = 100;

export const TARGET_ASSETS = 100_000_000;

export const INFLATION_PER_YEAR = 0.02;
/** Tighter than the old 0.5–2.0 so pure flip-trading is strong but not the only path to $100M. */
export const PRICE_RANDOM_MIN = 0.7;
export const PRICE_RANDOM_MAX = 1.45;

/** Relative to fair (base × inflation): below = cheap, above = expensive. */
export const PRICE_CHEAP_RATIO = 0.9;
export const PRICE_EXPENSIVE_RATIO = 1.15;

export const WAREHOUSE_UPGRADE_SIZE = 50;
export const WAREHOUSE_UPGRADE_COST = 50_000;

/** Softened from 5 so mid-game less “invisible tax”. Easy mode halves this. */
export const HEALTH_DRAIN_PER_TURN = 4;
export const ILLNESS_HEALTH_THRESHOLD = 30;
export const ILLNESS_FEE = 20_000;
export const ILLNESS_HEALTH_RESTORE = 15;

/** Free checkup every N calendar ages (25, 30, …). */
export const FREE_CHECKUP_AGE_STEP = 5;
export const FREE_CHECKUP_HEALTH = 10;

/** 睇醫生：基價 + 總資產抽成，有 cap 避免中後期被抽乾。 */
export const DOCTOR_BASE_FEE = 5_000;
export const DOCTOR_WEALTH_RATE = 0.02;
export const DOCTOR_FEE_CAP = 50_000;
export const DOCTOR_HEALTH_RESTORE = 25;

/** Negative cash events: never wipe a poor run in one hit. */
export const CASH_LOSS_MAX_FRACTION = 0.5;
export const CASH_LOSS_MIN_RESERVE = 1_000;

/** Failed founding refunds this fraction of cost (after first free success). */
export const COMPANY_FAIL_REFUND_RATE = 0.5;
/** Years after founding before annual collapse rolls apply (0 = founding year endTurn only). */
export const COMPANY_COLLAPSE_GRACE_YEARS = 2;
/** Each company is split into this many tradable shares (100% = full stake). */
export const COMPANY_TOTAL_SHARES = 100;
/** Share price = (valuation × inflation × roll) / TOTAL_SHARES. */
export const COMPANY_SHARE_PRICE_MIN = 0.75;
export const COMPANY_SHARE_PRICE_MAX = 1.4;

export const BASE_CHILD_CHANCE = 0.18;
export const CHILD_MATURE_YEARS = 18;
export const CHILD_TUITION = 30_000;
export const MAX_CHILDREN = 4;

export const MAX_LOGS = 40;

export const MILESTONE_THRESHOLDS = [
    {id: "assets_1m" as const, threshold: 1_000_000, title: "百萬身家", message: "帳戶多咗個零，阿嬸都開始問你炒咩！"},
    {id: "assets_10m" as const, threshold: 10_000_000, title: "半隻腳上岸", message: "一千萬到帳，財富自由喺對面馬路招手。"},
    {id: "assets_50m" as const, threshold: 50_000_000, title: "半億大佬", message: "五千萬啦，離一億小目標只差一程地鐵。"},
    {id: "assets_100m" as const, threshold: 100_000_000, title: "小目標達成", message: "一億到手，人生贏家可以開香檳。"},
] as const;
