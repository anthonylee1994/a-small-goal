import type {EventDef, EventId} from "../types/game";

export const EVENTS: readonly EventDef[] = [
    {
        id: "snack_boom",
        title: "薯片代言瘋搶",
        message: "天王巨星代言薯片，全城瘋搶，街邊檔都斷貨。",
        weight: 1,
        effects: [{type: "price_mult", goodId: "chips", mult: 5}],
    },
    {
        id: "crypto_crash",
        title: "區塊鏈泡沫爆破",
        message: "交易所跑路，區塊鏈泡沫爆破，幣圈哀鴻遍野。",
        weight: 1,
        effects: [{type: "price_mult", goodId: "bitcoin", mult: 0.1}],
    },
    {
        id: "windfall",
        title: "踩中六合彩",
        message: "行街唔睇路，竟然踩中六合彩！運氣好到嚇親。",
        weight: 1,
        effects: [{type: "cash", amount: 100_000}],
    },
    {
        id: "collapse",
        title: "暈倒街頭",
        message: "打兩份工兼炒幣，終於暈倒街頭，身體同荷包一齊爆。",
        weight: 1,
        effects: [
            {type: "health", amount: -30},
            {type: "cash", amount: -20_000},
        ],
    },
    {
        id: "nothing",
        title: "冇事發生",
        message: "今年平平淡淡，唔使大喜大悲，繼續捱落去就得。",
        weight: 1,
        effects: [],
    },
] as const;

export const EVENT_MAP: Record<EventId, EventDef> = Object.fromEntries(EVENTS.map(e => [e.id, e])) as Record<EventId, EventDef>;
