/** Shared MVP constants — SPEC.md §4 / §7 / §11 */

export const START_AGE = 20;
export const END_AGE = 60;
export const START_HEALTH = 100;
export const START_REPUTATION = 0;
export const START_WAREHOUSE = 100;

export const TARGET_ASSETS = 100_000_000;

export const INFLATION_PER_YEAR = 0.02;
/**
 * Goods price vs fair (base × inflation).
 * Mid/low tiers keep a wide band so trading stays skillful;
 * high-tier (bitcoin/gold/ev/options) uses a tighter band to curb pure yolo.
 */
export const PRICE_RANDOM_MIN = 0.62;
export const PRICE_RANDOM_MAX = 1.55;
/** High-tier goods: milder lottery than mid/low (still room to trade). */
export const PRICE_HIGH_TIER_MIN = 0.66;
export const PRICE_HIGH_TIER_MAX = 1.5;
export const HIGH_TIER_GOOD_IDS = ["bitcoin", "gold", "ev", "options"] as const;

/** Dead-poor birth: small rep head-start + first shop / first warehouse discounts. */
export const LOW_CLASS_STARTING_REPUTATION = 5;
/** Fraction off founding cost for the first company when birthFamily is low_class. */
export const LOW_CLASS_FIRST_COMPANY_DISCOUNT = 0.3;
/** Fraction off the first warehouse upgrade for low_class. */
export const LOW_CLASS_FIRST_WAREHOUSE_DISCOUNT = 0.4;

export const WAREHOUSE_UPGRADE_SIZE = 50;
/** First upgrade cost (capacity 100 → 150). Later upgrades grow exponentially. */
export const WAREHOUSE_UPGRADE_COST_BASE = 45_000;
/** cost = BASE × GROWTH^upgradeLevel — traders can scale mid-game without EV-only snowball. */
export const WAREHOUSE_UPGRADE_COST_GROWTH = 1.75;
/** @deprecated use getWarehouseUpgradeCost — kept as first-tier alias */
export const WAREHOUSE_UPGRADE_COST = WAREHOUSE_UPGRADE_COST_BASE;

/**
 * Health is a real tax: ignore it and you die; spam doctor and yolo cash dies.
 * Easy mode halves drain / illness fee.
 */
export const HEALTH_DRAIN_PER_TURN = 5;
export const ILLNESS_HEALTH_THRESHOLD = 30;
export const ILLNESS_FEE = 24_000;
export const ILLNESS_HEALTH_RESTORE = 12;

/** Free checkup every N calendar ages (25, 30, …). */
export const FREE_CHECKUP_AGE_STEP = 5;
export const FREE_CHECKUP_HEALTH = 10;

/**
 * 睇醫生：一次過回滿健康。
 * 收費 = 基價×通脹 + 總資產抽成，另有通脹後 cap（全滿血要夠貴先有 trade-off）。
 */
export const DOCTOR_BASE_FEE = 45_000;
export const DOCTOR_WEALTH_RATE = 0.013;
export const DOCTOR_FEE_CAP = 200_000;

/**
 * 捐款買名聲：每次固定 +GAIN（受 100 cap）。
 * 收費 = 基價×通脹×(1 + 現有名聲×SCALE)，越高級公司要嘅名聲越貴，避免無限白嫖。
 * 粗算 0→50 名聲約 ~$0.5M（20 歲無通脹），夠中期公司門檻但唔抵過結婚／事件。
 */
export const DONATE_BASE_FEE = 20_000;
export const DONATE_REP_COST_SCALE = 0.06;
export const DONATE_REP_GAIN = 5;

/** Negative cash events: never wipe a poor run in one hit. */
export const CASH_LOSS_MAX_FRACTION = 0.5;
export const CASH_LOSS_MIN_RESERVE = 1_000;

/** Failed founding refunds this fraction of cost (after first free success). */
export const COMPANY_FAIL_REFUND_RATE = 0.5;
/** Years after founding before annual collapse rolls apply (0 = founding year endTurn only). */
export const COMPANY_COLLAPSE_GRACE_YEARS = 2;
/** Each company is split into this many tradable shares (100% = full stake). */
export const COMPANY_TOTAL_SHARES = 100;
/** Share price = (valuation × inflation × roll) / TOTAL_SHARES. Tighter band after founding IPO. */
export const COMPANY_SHARE_PRICE_MIN = 0.82;
export const COMPANY_SHARE_PRICE_MAX = 1.28;

export const BASE_CHILD_CHANCE = 0.18;
export const CHILD_MATURE_YEARS = 18;
export const CHILD_TUITION = 30_000;
export const MAX_CHILDREN = 4;

export const MAX_LOGS = 40;

/**
 * 銀行貸款：單筆循環貸款，利息按年結複利。
 * 利率跟名聲線性掛鈎：0 名聲 = HIGH，100 名聲 = LOW，中間按比例。
 */
export const LOAN_INTEREST_RATE_HIGH = 0.15; // rep 0
export const LOAN_INTEREST_RATE_LOW = 0.07; // rep 100
/** Max loan = net equity (totalAssets) × this ratio — loan proceeds do not expand the line. */
export const LOAN_MAX_ASSET_RATIO = 0.5;
export const LOAN_MIN_AMOUNT = 10_000;

/**
 * 市場趨勢動量：去年價格偏離公平價時，今年隨機範圍會輕微偏移。
 * 上升趨勢 → 隨機下限/上限各 +BONUS；下降趨勢 → 各 −BONUS。
 */
export const TREND_MOMENTUM_BONUS = 0.08;
/** Price must deviate from fair by this ratio to count as a trend. */
export const TREND_THRESHOLD = 0.1;

export const MILESTONE_THRESHOLDS = [
    {id: "assets_1m" as const, threshold: 1_000_000, title: "百萬身家", message: "帳戶多咗個零，阿嬸都開始問你炒咩！"},
    {id: "assets_10m" as const, threshold: 10_000_000, title: "半隻腳上岸", message: "一千萬到帳，財富自由喺對面馬路招手。"},
    {id: "assets_50m" as const, threshold: 50_000_000, title: "半億大佬", message: "五千萬啦，離一億小目標只差一程地鐵。"},
    {id: "assets_100m" as const, threshold: 100_000_000, title: "小目標達成", message: "一億到手，人生贏家可以開香檳。"},
] as const;
