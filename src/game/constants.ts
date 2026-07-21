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

export const WAREHOUSE_UPGRADE_SIZE = 50;
export const WAREHOUSE_UPGRADE_COST = 50_000;

export const HEALTH_DRAIN_PER_TURN = 5;
export const ILLNESS_HEALTH_THRESHOLD = 30;
export const ILLNESS_FEE = 20_000;
export const ILLNESS_HEALTH_RESTORE = 15;

export const BASE_CHILD_CHANCE = 0.18;
export const CHILD_MATURE_YEARS = 18;
export const CHILD_TUITION = 30_000;
export const MAX_CHILDREN = 4;

export const MAX_LOGS = 40;
