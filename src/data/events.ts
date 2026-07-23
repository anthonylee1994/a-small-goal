import type {EventDef, EventId} from "../types/game";

/**
 * Yearly events are decision points: beginTurn only rolls the event,
 * effects apply when the player picks a choice (chooseEvent).
 * First choice ≈ classic / default path for balance.sim auto-dismiss.
 */
export const EVENTS: readonly EventDef[] = [
    {
        id: "snack_boom",
        title: "薯片代言瘋搶",
        message: "天王巨星代言薯片，成個香港搶到癲。街邊檔斷貨，炒家已經喺度虎視眈眈。",
        weight: 0.8,
        choices: [
            {
                id: "ride",
                label: "跟風炒薯片",
                effects: [{type: "price_mult", goodId: "chips", mult: 2.5}],
            },
            {
                id: "fade",
                label: "當熱鬧睇戲",
                effects: [{type: "price_mult", goodId: "chips", mult: 1.25}],
            },
            {
                id: "leak",
                label: "放料話「好快潮完」",
                effects: [
                    {type: "price_mult", goodId: "chips", mult: 1.6},
                    {type: "reputation", amount: -3},
                ],
            },
        ],
    },
    {
        id: "crypto_crash",
        title: "區塊鏈泡沫爆破",
        message: "交易所傳出捲款走佬，幣圈個個喊苦喊忽。冧市之前，你要諗清楚企邊邊。",
        weight: 0.8,
        choices: [
            {
                id: "panic",
                label: "跟大隊恐慌掟貨",
                effects: [{type: "price_mult", goodId: "bitcoin", mult: 0.35}],
            },
            {
                id: "hold_nerves",
                label: "裝淡定硬食",
                effects: [
                    {type: "price_mult", goodId: "bitcoin", mult: 0.55},
                    {type: "health", amount: -8},
                ],
            },
            {
                id: "bottom_fish_talk",
                label: "大聲講「撈底良機」",
                effects: [
                    {type: "price_mult", goodId: "bitcoin", mult: 0.45},
                    {type: "reputation", amount: 2},
                ],
            },
        ],
    },
    {
        id: "windfall",
        title: "六合彩中三獎",
        message: "求其買張六合彩，點知真係中三獎！櫃枱職員都忍唔住望多你兩眼。",
        weight: 0.7,
        choices: [
            {
                id: "pocket",
                label: "袋袋平安",
                effects: [{type: "cash", amount: 50000}],
            },
            {
                id: "treat",
                label: "請親戚食大餐",
                effects: [
                    {type: "cash", amount: 35000},
                    {type: "health", amount: 5},
                    {type: "reputation", amount: 3},
                ],
            },
            {
                id: "double_or",
                label: "獎金再去買大路",
                effects: [
                    {type: "cash", amount: 20000},
                    {type: "health", amount: -5},
                ],
            },
        ],
    },
    {
        id: "collapse",
        title: "暈倒街頭",
        message: "打兩份工兼炒幣，眼前一黑。路人圍住你，救護車響緊。",
        weight: 0.7,
        choices: [
            {
                id: "ambulance",
                label: "上救護車",
                effects: [
                    {type: "health", amount: -20},
                    {type: "cash", amount: -12000},
                ],
            },
            {
                id: "walk_it_off",
                label: "強行企起身返工",
                effects: [
                    {type: "health", amount: -30},
                    {type: "cash", amount: -2000},
                ],
            },
            {
                id: "taxi_clinic",
                label: "的士去私家診所",
                effects: [
                    {type: "health", amount: -15},
                    {type: "cash", amount: -22000},
                ],
            },
        ],
    },
    {
        id: "nothing",
        title: "冇事發生",
        message: "今年平平淡淡，又就咁過咗一年。睇你想點樣捱埋落去。",
        weight: 4,
        choices: [
            {
                id: "lie_flat",
                label: "瞓平養生",
                effects: [{type: "health", amount: 3}],
            },
            {
                id: "side_grind",
                label: "偷偷做埋少少嘢",
                effects: [
                    {type: "cash", amount: 4000},
                    {type: "health", amount: -4},
                ],
            },
            {
                id: "network",
                label: "周圍去飯局識人",
                effects: [
                    {type: "reputation", amount: 2},
                    {type: "cash", amount: -3000},
                ],
            },
        ],
    },
    {
        id: "vitasoy_craze",
        title: "維他奶荒",
        message: "間間茶餐廳都話「今日冇奶」，阿嬸已經排起長龍。",
        weight: 0.9,
        choices: [
            {
                id: "hype",
                label: "跟風炒維他奶",
                effects: [{type: "price_mult", goodId: "vitasoy", mult: 2.2}],
            },
            {
                id: "chill",
                label: "自己夠飲就得",
                effects: [{type: "price_mult", goodId: "vitasoy", mult: 1.2}],
            },
            {
                id: "scalper_shame",
                label: "打尖攞貨再放",
                effects: [
                    {type: "price_mult", goodId: "vitasoy", mult: 1.8},
                    {type: "reputation", amount: -4},
                ],
            },
        ],
    },
    {
        id: "phone_hype",
        title: "新機開賣排長龍",
        message: "炒家通宵瞓街排隊，新手機一機難求。",
        weight: 0.9,
        choices: [
            {
                id: "queue",
                label: "通宵排隊等炒",
                effects: [
                    {type: "price_mult", goodId: "phone", mult: 1.8},
                    {type: "health", amount: -6},
                ],
            },
            {
                id: "skip",
                label: "唔排隊睇戲",
                effects: [{type: "price_mult", goodId: "phone", mult: 1.2}],
            },
            {
                id: "scalp_rumor",
                label: "放風話「有內部貨」",
                effects: [
                    {type: "price_mult", goodId: "phone", mult: 1.5},
                    {type: "reputation", amount: -3},
                ],
            },
        ],
    },
    {
        id: "sneaker_frenzy",
        title: "限量波鞋抽籤",
        message: "抽中等於中獎，抽唔中就要食炒價。全城撳 App 撳到手軟。",
        weight: 0.9,
        choices: [
            {
                id: "bot",
                label: "狂撳 App 抽籤",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 2.2}],
            },
            {
                id: "pass",
                label: "對波鞋冇興趣",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 1.15}],
            },
            {
                id: "resell_gang",
                label: "加入炒家群組",
                effects: [
                    {type: "price_mult", goodId: "sneakers", mult: 1.9},
                    {type: "health", amount: -5},
                ],
            },
        ],
    },
    {
        id: "gold_rush",
        title: "結婚旺季搶金",
        message: "個個趕住拉埋天窗，金舖職員忙到手軟。",
        weight: 0.9,
        choices: [
            {
                id: "stack",
                label: "跟住搶金",
                effects: [{type: "price_mult", goodId: "gold", mult: 1.7}],
            },
            {
                id: "ignore",
                label: "金唔關我事",
                effects: [{type: "price_mult", goodId: "gold", mult: 1.15}],
            },
            {
                id: "wedding_guest",
                label: "去食十席人情",
                effects: [
                    {type: "price_mult", goodId: "gold", mult: 1.4},
                    {type: "cash", amount: -15000},
                ],
            },
        ],
    },
    {
        id: "ev_subsidy",
        title: "電動車津貼",
        message: "政府突然派津貼，人人都想轉揸電動車。",
        weight: 0.8,
        choices: [
            {
                id: "lobby",
                label: "高調撐政策",
                effects: [{type: "price_mult", goodId: "ev", mult: 1.6}],
            },
            {
                id: "skeptic",
                label: "唱淡「津貼唔長久」",
                effects: [{type: "price_mult", goodId: "ev", mult: 1.2}],
            },
            {
                id: "apply_self",
                label: "自己都申請吓",
                effects: [
                    {type: "price_mult", goodId: "ev", mult: 1.4},
                    {type: "cash", amount: 5000},
                ],
            },
        ],
    },
    {
        id: "options_moon",
        title: "美股狂牛",
        message: "隔夜美股齊齊爆升，期權黨通宵尖叫。",
        weight: 0.8,
        choices: [
            {
                id: "fomo",
                label: "FOMO 追入去",
                effects: [{type: "price_mult", goodId: "options", mult: 2}],
            },
            {
                id: "take_profit_talk",
                label: "勸人「見好就收」",
                effects: [
                    {type: "price_mult", goodId: "options", mult: 1.3},
                    {type: "reputation", amount: 2},
                ],
            },
            {
                id: "all_in_chat",
                label: "群組吹水當股神",
                effects: [
                    {type: "price_mult", goodId: "options", mult: 1.7},
                    {type: "health", amount: -6},
                ],
            },
        ],
    },
    {
        id: "phone_brick",
        title: "舊機變磚",
        message: "新一代手機一出，舊機即刻變電子磚頭。",
        weight: 0.9,
        choices: [
            {
                id: "dump",
                label: "跟大隊掟貨",
                effects: [{type: "price_mult", goodId: "phone", mult: 0.55}],
            },
            {
                id: "hold",
                label: "硬撐「仲用得」",
                effects: [{type: "price_mult", goodId: "phone", mult: 0.75}],
            },
            {
                id: "recycle",
                label: "拎去環保回收",
                effects: [
                    {type: "price_mult", goodId: "phone", mult: 0.65},
                    {type: "reputation", amount: 2},
                ],
            },
        ],
    },
    {
        id: "gold_dump",
        title: "金價插水",
        message: "傳聞有大戶狂沽黃金，金舖門口變清貨現場。",
        weight: 0.9,
        choices: [
            {
                id: "panic_sell",
                label: "跟大戶沽貨",
                effects: [{type: "price_mult", goodId: "gold", mult: 0.55}],
            },
            {
                id: "accumulate",
                label: "趁低撈貨",
                effects: [{type: "price_mult", goodId: "gold", mult: 0.75}],
            },
            {
                id: "conspiracy",
                label: "放風話「今次假跌」",
                effects: [
                    {type: "price_mult", goodId: "gold", mult: 0.65},
                    {type: "reputation", amount: -2},
                ],
            },
        ],
    },
    {
        id: "options_wipeout",
        title: "期權歸零夜",
        message: "美股黑色星期一，期權黨由股神變乞兒。",
        weight: 0.7,
        choices: [
            {
                id: "wipe",
                label: "見證歸零",
                effects: [{type: "price_mult", goodId: "options", mult: 0.3}],
            },
            {
                id: "hedge_rumor",
                label: "提早叫人避險",
                effects: [
                    {type: "price_mult", goodId: "options", mult: 0.5},
                    {type: "reputation", amount: 2},
                ],
            },
            {
                id: "cope",
                label: "開直播安慰同路人",
                effects: [
                    {type: "price_mult", goodId: "options", mult: 0.4},
                    {type: "health", amount: -8},
                    {type: "reputation", amount: 3},
                ],
            },
        ],
    },
    {
        id: "sneaker_flop",
        title: "潮完就落價",
        message: "網紅突然轉軚話「唔再著呢對」，二手波鞋冇人要。",
        weight: 0.9,
        choices: [
            {
                id: "clearance",
                label: "清貨大減價",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 0.5}],
            },
            {
                id: "wait",
                label: "收埋等翻身",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 0.7}],
            },
            {
                id: "hate_influencer",
                label: "公審網紅",
                effects: [
                    {type: "price_mult", goodId: "sneakers", mult: 0.6},
                    {type: "reputation", amount: -3},
                ],
            },
        ],
    },
    {
        id: "ev_price_war",
        title: "電動車減價戰",
        message: "車廠鬥劈價，買車嘅笑、囤車嘅喊。",
        weight: 0.8,
        choices: [
            {
                id: "war",
                label: "趁減價戰炒一轉",
                effects: [{type: "price_mult", goodId: "ev", mult: 0.6}],
            },
            {
                id: "brand",
                label: "死撐「品牌有價」",
                effects: [{type: "price_mult", goodId: "ev", mult: 0.8}],
            },
            {
                id: "buy_intent",
                label: "放話一定會買",
                effects: [
                    {type: "price_mult", goodId: "ev", mult: 0.7},
                    {type: "cash", amount: -5000},
                ],
            },
        ],
    },
    {
        id: "chips_recall",
        title: "薯片回收潮",
        message: "有人喺袋底搵到不明物體，品牌緊急回收。",
        weight: 0.8,
        choices: [
            {
                id: "recall",
                label: "跟風恐慌掟貨",
                effects: [{type: "price_mult", goodId: "chips", mult: 0.45}],
            },
            {
                id: "eat_anyway",
                label: "話「我照食」",
                effects: [
                    {type: "price_mult", goodId: "chips", mult: 0.7},
                    {type: "health", amount: -5},
                ],
            },
            {
                id: "sue_talk",
                label: "叫齊人夾份告佢",
                effects: [
                    {type: "price_mult", goodId: "chips", mult: 0.55},
                    {type: "reputation", amount: 2},
                ],
            },
        ],
    },
    {
        id: "bitcoin_moon",
        title: "幣圈復活夜",
        message: "名人出咗個帖文，比特幣半夜起飛。",
        weight: 0.8,
        choices: [
            {
                id: "moon",
                label: "通宵睇盤慶祝",
                effects: [
                    {type: "price_mult", goodId: "bitcoin", mult: 2.2},
                    {type: "health", amount: -5},
                ],
            },
            {
                id: "skeptic",
                label: "唱淡「呢轉假突破」",
                effects: [{type: "price_mult", goodId: "bitcoin", mult: 1.25}],
            },
            {
                id: "influencer",
                label: "轉發抽水當專家",
                effects: [
                    {type: "price_mult", goodId: "bitcoin", mult: 1.7},
                    {type: "reputation", amount: 2},
                ],
            },
        ],
    },
    {
        id: "gov_cash",
        title: "政府派錢",
        message: "電子消費券入帳。雖然唔多，但都係錢。",
        weight: 1,
        choices: [
            {
                id: "spend",
                label: "即刻花晒",
                effects: [
                    {type: "cash", amount: 10000},
                    {type: "health", amount: 2},
                ],
            },
            {
                id: "save",
                label: "鎖起啲錢唔使",
                effects: [{type: "cash", amount: 10000}],
            },
            {
                id: "donate_part",
                label: "捐一半扮有心",
                effects: [
                    {type: "cash", amount: 5000},
                    {type: "reputation", amount: 4},
                ],
            },
        ],
    },
    {
        id: "landlord_rage",
        title: "業主加租通知",
        message: "業主一句「市道好」，租金加到你懷疑人生。",
        weight: 0.9,
        choices: [
            {
                id: "pay",
                label: "咬牙續租",
                effects: [{type: "cash", amount: -25000}],
            },
            {
                id: "move",
                label: "搬去遠啲／細啲",
                effects: [
                    {type: "cash", amount: -10000},
                    {type: "health", amount: -8},
                ],
            },
            {
                id: "fight",
                label: "同業主死過",
                effects: [
                    {type: "cash", amount: -12000},
                    {type: "reputation", amount: -5},
                ],
            },
        ],
    },
    {
        id: "scam_course",
        title: "中伏致富課程",
        message: "「財務自由」講座傳單塞滿信箱。你要決定信定唔信。",
        weight: 0.8,
        choices: [
            {
                id: "enroll",
                label: "報名上堂",
                effects: [{type: "cash", amount: -40000}],
            },
            {
                id: "skip",
                label: "當垃圾掉咗佢",
                effects: [],
            },
            {
                id: "expose",
                label: "上網公審導師",
                effects: [
                    {type: "cash", amount: -2000},
                    {type: "reputation", amount: 3},
                ],
            },
        ],
    },
    {
        id: "lai_see",
        title: "阿爺派利是",
        message: "拜年見到阿爺，封利是厚到可以當啟動資金。",
        weight: 1,
        choices: [
            {
                id: "keep",
                label: "乖乖收下",
                effects: [{type: "cash", amount: 8888}],
            },
            {
                id: "refuse_half",
                label: "推辭話太多，只收一半",
                effects: [
                    {type: "cash", amount: 4000},
                    {type: "reputation", amount: 3},
                ],
            },
            {
                id: "gamble_new_year",
                label: "利是錢去打牌",
                effects: [
                    {type: "cash", amount: 3000},
                    {type: "health", amount: -4},
                ],
            },
        ],
    },
    {
        id: "food_poisoning",
        title: "街邊小食中伏",
        message: "魚蛋食完肚痛，你企喺街考慮下一步。",
        weight: 0.9,
        choices: [
            {
                id: "clinic",
                label: "去診所",
                effects: [
                    {type: "health", amount: -15},
                    {type: "cash", amount: -5000},
                ],
            },
            {
                id: "tough",
                label: "頂硬上返工",
                effects: [{type: "health", amount: -22}],
            },
            {
                id: "hospital",
                label: "直入私家醫院",
                effects: [
                    {type: "health", amount: -8},
                    {type: "cash", amount: -18000},
                ],
            },
        ],
    },
    {
        id: "overtime_bonus",
        title: "OT 換花紅",
        message: "老細話今年花紅睇表現，OT 名單已經寫住你個名。",
        weight: 1,
        choices: [
            {
                id: "grind",
                label: "加班換花紅",
                effects: [
                    {type: "cash", amount: 35000},
                    {type: "health", amount: -12},
                ],
            },
            {
                id: "refuse",
                label: "準時走人",
                effects: [{type: "health", amount: 4}],
            },
            {
                id: "half",
                label: "做一半 OT",
                effects: [
                    {type: "cash", amount: 15000},
                    {type: "health", amount: -5},
                ],
            },
        ],
    },
    {
        id: "spa_reboot",
        title: "強迫式放鬆",
        message: "朋友逼你去 SPA：「你成個人似條屍。」",
        weight: 1,
        choices: [
            {
                id: "go",
                label: "去喇！",
                effects: [
                    {type: "health", amount: 15},
                    {type: "cash", amount: -8000},
                ],
            },
            {
                id: "no",
                label: "拒絕社交",
                effects: [{type: "reputation", amount: -1}],
            },
            {
                id: "cheap",
                label: "自己喺屋企浸浴",
                effects: [
                    {type: "health", amount: 6},
                    {type: "cash", amount: -500},
                ],
            },
        ],
    },
    {
        id: "typhoon_rest",
        title: "十號風球福利",
        message: "十號風球一掛，全世界停擺。你要點樣用呢日？",
        weight: 1.2,
        choices: [
            {
                id: "sleep",
                label: "瞓足一日",
                effects: [{type: "health", amount: 10}],
            },
            {
                id: "side",
                label: "喺屋企接私活",
                effects: [
                    {type: "cash", amount: 6000},
                    {type: "health", amount: 3},
                ],
            },
            {
                id: "party",
                label: "打機打到天光",
                effects: [
                    {type: "health", amount: -4},
                    {type: "cash", amount: -1000},
                ],
            },
        ],
    },
    {
        id: "gym_trap",
        title: "健身會籍陷阱",
        message: "推銷員笑容滿面，合約就喺你面前。",
        weight: 0.9,
        choices: [
            {
                id: "sign",
                label: "簽三年",
                effects: [
                    {type: "cash", amount: -12000},
                    {type: "health", amount: 5},
                ],
            },
            {
                id: "run",
                label: "即刻走人",
                effects: [],
            },
            {
                id: "day_pass",
                label: "只買日票試吓",
                effects: [
                    {type: "cash", amount: -200},
                    {type: "health", amount: 2},
                ],
            },
        ],
    },
    {
        id: "mtr_apology",
        title: "港鐵延誤賠償",
        message: "喺月台等到懷疑人生，App 終於彈出個象徵式補償。",
        weight: 1.2,
        choices: [
            {
                id: "claim",
                label: "拎賠償",
                effects: [{type: "cash", amount: 100}],
            },
            {
                id: "rant",
                label: "上網開火",
                effects: [
                    {type: "health", amount: -3},
                    {type: "reputation", amount: 1},
                ],
            },
            {
                id: "walk",
                label: "改行路當做運動",
                effects: [{type: "health", amount: 4}],
            },
        ],
    },
    {
        id: "relative_borrow",
        title: "親戚借錢術",
        message: "遠房親戚：「過兩日還返畀你。」語氣誠懇到可怕。",
        weight: 0.9,
        choices: [
            {
                id: "lend",
                label: "借出",
                effects: [{type: "cash", amount: -20000}],
            },
            {
                id: "refuse",
                label: "拒絕",
                effects: [{type: "reputation", amount: -4}],
            },
            {
                id: "half",
                label: "只借一半",
                effects: [
                    {type: "cash", amount: -10000},
                    {type: "reputation", amount: -1},
                ],
            },
        ],
    },
    {
        id: "lucky_draw",
        title: "超市大抽獎",
        message: "買滿五十蚊可以抽獎，轉盤喺你面前轉緊。",
        weight: 1,
        choices: [
            {
                id: "draw",
                label: "抽！",
                effects: [{type: "cash", amount: 3000}],
            },
            {
                id: "skip",
                label: "懶得填表",
                effects: [],
            },
            {
                id: "staff",
                label: "幫手叫其他人抽",
                effects: [
                    {type: "cash", amount: 1000},
                    {type: "reputation", amount: 1},
                ],
            },
        ],
    },
    {
        id: "whatsapp_scam",
        title: "WhatsApp「阿仔」",
        message: "收到個自稱「阿仔」嘅 WhatsApp，一開口就問你借錢。",
        weight: 1,
        choices: [
            {
                id: "block",
                label: "即刻封鎖",
                effects: [{type: "health", amount: -5}],
            },
            {
                id: "engage",
                label: "回覆盤問",
                effects: [
                    {type: "health", amount: -10},
                    {type: "cash", amount: -1000},
                ],
            },
            {
                id: "report",
                label: "報警同廣傳",
                effects: [
                    {type: "health", amount: -2},
                    {type: "reputation", amount: 2},
                ],
            },
        ],
    },
    {
        id: "banquet_debt",
        title: "人情酒飲唔停",
        message: "今年食到第三十席，收到帖收到你想移民。",
        weight: 0.9,
        choices: [
            {
                id: "all",
                label: "全部去齊",
                effects: [
                    {type: "cash", amount: -28000},
                    {type: "health", amount: -8},
                ],
            },
            {
                id: "skip_half",
                label: "剔走一半遠親",
                effects: [
                    {type: "cash", amount: -12000},
                    {type: "reputation", amount: -3},
                ],
            },
            {
                id: "gift_only",
                label: "只做人情唔到場",
                effects: [
                    {type: "cash", amount: -18000},
                    {type: "health", amount: -2},
                    {type: "reputation", amount: -1},
                ],
            },
        ],
    },
    {
        id: "black_rain_bonus",
        title: "黑雨停工禮",
        message: "黑雨警告生效，公司終於叫你留喺屋企。",
        weight: 1.1,
        choices: [
            {
                id: "rest",
                label: "煲劇瞓覺",
                effects: [{type: "health", amount: 12}],
            },
            {
                id: "work",
                label: "偷偷加班博表現",
                effects: [
                    {type: "cash", amount: 8000},
                    {type: "health", amount: 4},
                ],
            },
            {
                id: "errand",
                label: "冒雨買糧",
                effects: [
                    {type: "cash", amount: -500},
                    {type: "health", amount: 6},
                ],
            },
        ],
    },
    {
        id: "parking_fine",
        title: "咪錶刺客",
        message: "「只係停多兩分鐘」，罰單已經貼上玻璃。",
        weight: 1.1,
        choices: [
            {
                id: "pay",
                label: "乖乖交罰款",
                effects: [{type: "cash", amount: -640}],
            },
            {
                id: "appeal",
                label: "寫信申訴",
                effects: [
                    {type: "cash", amount: -320},
                    {type: "health", amount: -2},
                ],
            },
            {
                id: "rage",
                label: "拍片鬧交通署",
                effects: [
                    {type: "cash", amount: -640},
                    {type: "reputation", amount: 1},
                    {type: "health", amount: -3},
                ],
            },
        ],
    },
    {
        id: "stock_group_trap",
        title: "必升股票群",
        message: "群組話「穩賺不賠」，入群費同跟單提示一齊湧埋嚟。",
        weight: 0.8,
        choices: [
            {
                id: "follow",
                label: "跟單",
                effects: [
                    {type: "cash", amount: -35000},
                    {type: "price_mult", goodId: "options", mult: 0.7},
                ],
            },
            {
                id: "leave",
                label: "靜靜退群",
                effects: [],
            },
            {
                id: "warn",
                label: "出帖警告其他人",
                effects: [
                    {type: "cash", amount: -2000},
                    {type: "reputation", amount: 3},
                    {type: "price_mult", goodId: "options", mult: 0.85},
                ],
            },
        ],
    },
    {
        id: "viral_milk_tea",
        title: "打卡奶茶潮",
        message: "KOL 話呢杯「人生必試」，人龍長過機場跑道。",
        weight: 0.9,
        choices: [
            {
                id: "hype",
                label: "跟風炒維他奶概念",
                effects: [{type: "price_mult", goodId: "vitasoy", mult: 1.6}],
            },
            {
                id: "queue",
                label: "自己去排隊打卡",
                effects: [
                    {type: "price_mult", goodId: "vitasoy", mult: 1.25},
                    {type: "cash", amount: -200},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "hate",
                label: "寫長文唱淡",
                effects: [
                    {type: "price_mult", goodId: "vitasoy", mult: 1.05},
                    {type: "reputation", amount: -2},
                ],
            },
        ],
    },
    {
        id: "nft_jpeg",
        title: "買咗張 JPEG",
        message: "朋友話呢張圖將來值千萬。錢包連結頁已打開。",
        weight: 0.8,
        choices: [
            {
                id: "buy",
                label: "買入 JPEG",
                effects: [
                    {type: "cash", amount: -22000},
                    {type: "price_mult", goodId: "bitcoin", mult: 0.75},
                ],
            },
            {
                id: "no",
                label: "拒絕朋友",
                effects: [{type: "reputation", amount: -2}],
            },
            {
                id: "small",
                label: "買張平嘅畀面",
                effects: [
                    {type: "cash", amount: -5000},
                    {type: "price_mult", goodId: "bitcoin", mult: 0.9},
                ],
            },
        ],
    },
    {
        id: "dentist_shock",
        title: "牙醫報價單",
        message: "牙痛忍唔住，張報價單一出，仲痛過隻牙。",
        weight: 0.9,
        choices: [
            {
                id: "full",
                label: "照單全做",
                effects: [
                    {type: "cash", amount: -18000},
                    {type: "health", amount: 10},
                ],
            },
            {
                id: "delay",
                label: "淨係止痛拖住先",
                effects: [
                    {type: "cash", amount: -3000},
                    {type: "health", amount: -5},
                ],
            },
            {
                id: "public",
                label: "去公立排期",
                effects: [
                    {type: "cash", amount: -500},
                    {type: "health", amount: 3},
                ],
            },
        ],
    },
    {
        id: "karaoke_overtime",
        title: "通宵 K 房",
        message: "同事：「唱兩首就走。」麥克風已經塞喺你手上。",
        weight: 1,
        choices: [
            {
                id: "all_night",
                label: "唱到日出",
                effects: [
                    {type: "cash", amount: -6000},
                    {type: "health", amount: -10},
                ],
            },
            {
                id: "early",
                label: "兩首後閃人",
                effects: [
                    {type: "cash", amount: -1500},
                    {type: "health", amount: -2},
                ],
            },
            {
                id: "skip",
                label: "今晚欠奉",
                effects: [{type: "reputation", amount: -2}],
            },
        ],
    },
    {
        id: "octopus_stuck",
        title: "八達通卡閘機",
        message: "入閘嗰刻餘額不足，後面條龍用眼神殺死你。",
        weight: 1.2,
        choices: [
            {
                id: "topup",
                label: "尷尬增值",
                effects: [
                    {type: "cash", amount: -100},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "wave",
                label: "求人幫手拍卡",
                effects: [
                    {type: "health", amount: -6},
                    {type: "reputation", amount: -1},
                ],
            },
            {
                id: "exit",
                label: "改走路",
                effects: [{type: "health", amount: 2}],
            },
        ],
    },
    {
        id: "haidilao_birthday",
        title: "生日優惠",
        message: "火鍋舖為你唱生日歌、表演拉麵，張單一樣照收。",
        weight: 0.9,
        choices: [
            {
                id: "enjoy",
                label: "照食兼睇表演",
                effects: [
                    {type: "cash", amount: -2888},
                    {type: "health", amount: 6},
                ],
            },
            {
                id: "share",
                label: "叫朋友 AA",
                effects: [
                    {type: "cash", amount: -1200},
                    {type: "health", amount: 4},
                    {type: "reputation", amount: 1},
                ],
            },
            {
                id: "home",
                label: "返屋企食杯麵慶生",
                effects: [
                    {type: "cash", amount: -30},
                    {type: "health", amount: 1},
                ],
            },
        ],
    },
    {
        id: "bus_uncle",
        title: "巴士阿叔開咪",
        message: "後座阿叔講足成粒鐘人生哲學，把聲大到根本唔使咪。",
        weight: 1.1,
        choices: [
            {
                id: "endure",
                label: "戴耳機忍",
                effects: [{type: "health", amount: -6}],
            },
            {
                id: "argue",
                label: "駁嘴辯論",
                effects: [
                    {type: "health", amount: -10},
                    {type: "reputation", amount: -2},
                ],
            },
            {
                id: "alight",
                label: "早幾個站落車行路",
                effects: [{type: "health", amount: -1}],
            },
        ],
    },
    {
        id: "side_hustle_delivery",
        title: "週末送外賣",
        message: "App 彈出通知：「附近多到爆單，上線即賺。」",
        weight: 1,
        choices: [
            {
                id: "deliver",
                label: "落雨都送",
                effects: [
                    {type: "cash", amount: 15000},
                    {type: "health", amount: -10},
                ],
            },
            {
                id: "no",
                label: "週末休息",
                effects: [{type: "health", amount: 5}],
            },
            {
                id: "half_day",
                label: "只做半日",
                effects: [
                    {type: "cash", amount: 7000},
                    {type: "health", amount: -4},
                ],
            },
        ],
    },
    {
        id: "flu_wave",
        title: "流感高峰期",
        message: "辦公室咳到似演唱會，你喉嚨開始癢。",
        weight: 1,
        choices: [
            {
                id: "sick_leave",
                label: "請病假睇醫生",
                effects: [
                    {type: "health", amount: -14},
                    {type: "cash", amount: -4500},
                ],
            },
            {
                id: "work_sick",
                label: "帶病返工",
                effects: [
                    {type: "health", amount: -20},
                    {type: "reputation", amount: -2},
                ],
            },
            {
                id: "wfh_meds",
                label: "留喺屋企食藥頂住",
                effects: [
                    {type: "health", amount: -10},
                    {type: "cash", amount: -1500},
                ],
            },
        ],
    },
    {
        id: "cross_border_shop",
        title: "北上掃貨",
        message: "群組瘋傳北上平貨清單，高鐵票可以而家訂。",
        weight: 1,
        choices: [
            {
                id: "go",
                label: "過關掃貨",
                effects: [
                    {type: "cash", amount: 6000},
                    {type: "health", amount: -4},
                ],
            },
            {
                id: "stay",
                label: "留港消費",
                effects: [],
            },
            {
                id: "agent",
                label: "搵代購",
                effects: [{type: "cash", amount: 2500}],
            },
        ],
    },
    {
        id: "electricity_hike",
        title: "電費加價通知",
        message: "電費單厚過月餅。冷氣遙控喺你手上。",
        weight: 1,
        choices: [
            {
                id: "pay",
                label: "照交照開冷氣",
                effects: [{type: "cash", amount: -9500}],
            },
            {
                id: "sweat",
                label: "慳電忍熱",
                effects: [
                    {type: "cash", amount: -4000},
                    {type: "health", amount: -6},
                ],
            },
            {
                id: "solar_talk",
                label: "研究節能（最後變購物）",
                effects: [
                    {type: "cash", amount: -6000},
                    {type: "health", amount: -2},
                    {type: "reputation", amount: 1},
                ],
            },
        ],
    },
    {
        id: "mahjong_night",
        title: "通宵打麻雀",
        message: "朋友：「打兩圈就散。」牌已經洗好。",
        weight: 0.95,
        choices: [
            {
                id: "play",
                label: "打到日出",
                effects: [
                    {type: "cash", amount: -8000},
                    {type: "health", amount: -12},
                ],
            },
            {
                id: "watch",
                label: "旁觀唔落場",
                effects: [
                    {type: "cash", amount: -500},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "home",
                label: "提早走",
                effects: [
                    {type: "reputation", amount: -1},
                    {type: "health", amount: 2},
                ],
            },
        ],
    },
    {
        id: "yum_cha_sunday",
        title: "星期日飲茶",
        message: "阿媽已經點咗成枱點心：「食多啲先有氣力賺錢。」",
        weight: 1.1,
        choices: [
            {
                id: "filial",
                label: "埋單孝順",
                effects: [
                    {type: "cash", amount: -1680},
                    {type: "health", amount: 6},
                ],
            },
            {
                id: "split",
                label: "堅持 AA",
                effects: [
                    {type: "cash", amount: -600},
                    {type: "health", amount: 4},
                    {type: "reputation", amount: -1},
                ],
            },
            {
                id: "takeaway",
                label: "叫走部分",
                effects: [
                    {type: "cash", amount: -1000},
                    {type: "health", amount: 3},
                ],
            },
        ],
    },
    {
        id: "aed_queue",
        title: "急症室長龍",
        message: "凌晨三點仲喺急症室等，冷氣凍過雪櫃。",
        weight: 0.9,
        choices: [
            {
                id: "wait",
                label: "繼續等",
                effects: [
                    {type: "health", amount: -8},
                    {type: "cash", amount: -1200},
                ],
            },
            {
                id: "leave",
                label: "忍痛走人",
                effects: [{type: "health", amount: -15}],
            },
            {
                id: "private",
                label: "轉私家",
                effects: [
                    {type: "health", amount: -3},
                    {type: "cash", amount: -15000},
                ],
            },
        ],
    },
    {
        id: "wfh_commute_save",
        title: "WFH 一日",
        message: "公司忽然畀你 WFH，睡衣都可以當正裝。",
        weight: 1.1,
        choices: [
            {
                id: "chill",
                label: "慳車費休養",
                effects: [
                    {type: "cash", amount: 3200},
                    {type: "health", amount: 5},
                ],
            },
            {
                id: "overwork",
                label: "喺屋企加班博表現",
                effects: [
                    {type: "cash", amount: 8000},
                    {type: "health", amount: -4},
                ],
            },
            {
                id: "side",
                label: "返工時間做私活",
                effects: [
                    {type: "cash", amount: 6000},
                    {type: "reputation", amount: -2},
                    {type: "health", amount: 2},
                ],
            },
        ],
    },
    {
        id: "sneakers_collab",
        title: "聯名波鞋突襲",
        message: "品牌聯名一出，App 一秒 sold out。",
        weight: 0.85,
        choices: [
            {
                id: "hype",
                label: "炒聯名行情",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 1.9}],
            },
            {
                id: "meh",
                label: "冇興趣",
                effects: [{type: "price_mult", goodId: "sneakers", mult: 1.15}],
            },
            {
                id: "camp",
                label: "通宵撳 refresh",
                effects: [
                    {type: "price_mult", goodId: "sneakers", mult: 1.7},
                    {type: "health", amount: -6},
                ],
            },
        ],
    },
    {
        id: "gold_cny",
        title: "過年搶金條",
        message: "年初二金舖條龍長過賀歲片。",
        weight: 0.9,
        choices: [
            {
                id: "queue",
                label: "跟阿嬸搶金",
                effects: [{type: "price_mult", goodId: "gold", mult: 1.55}],
            },
            {
                id: "skip",
                label: "寧願派利是",
                effects: [
                    {type: "price_mult", goodId: "gold", mult: 1.1},
                    {type: "cash", amount: -3000},
                ],
            },
            {
                id: "photo",
                label: "排隊打卡但唔買",
                effects: [
                    {type: "price_mult", goodId: "gold", mult: 1.3},
                    {type: "health", amount: -3},
                ],
            },
        ],
    },
    {
        id: "options_fomc",
        title: "聯儲局開會夜",
        message: "聯儲局準備開金口，期權盤上落如過山車。",
        weight: 0.85,
        choices: [
            {
                id: "yolo",
                label: "賭方向",
                effects: [{type: "price_mult", goodId: "options", mult: 1.45}],
            },
            {
                id: "flat",
                label: "揸現金睇戲",
                effects: [{type: "price_mult", goodId: "options", mult: 1.1}],
            },
            {
                id: "stream",
                label: "開直播解盤",
                effects: [
                    {type: "price_mult", goodId: "options", mult: 1.3},
                    {type: "reputation", amount: 2},
                    {type: "health", amount: -5},
                ],
            },
        ],
    },
    {
        id: "phone_trade_in_scam",
        title: "舊機回收中伏",
        message: "舖頭話高價回收，驗機後報價劈半。",
        weight: 0.85,
        choices: [
            {
                id: "accept",
                label: "含淚成交",
                effects: [
                    {type: "cash", amount: -12000},
                    {type: "price_mult", goodId: "phone", mult: 0.7},
                ],
            },
            {
                id: "walk",
                label: "拎返部機走人",
                effects: [{type: "price_mult", goodId: "phone", mult: 0.85}],
            },
            {
                id: "review",
                label: "上網留一星",
                effects: [
                    {type: "cash", amount: -3000},
                    {type: "price_mult", goodId: "phone", mult: 0.8},
                    {type: "reputation", amount: 1},
                ],
            },
        ],
    },
    {
        id: "chips_bar_promo",
        title: "酒吧送薯片潮",
        message: "蘭桂坊買酒送薯片，零食櫃被掃空。",
        weight: 0.85,
        choices: [
            {
                id: "hype",
                label: "炒薯片",
                effects: [{type: "price_mult", goodId: "chips", mult: 1.55}],
            },
            {
                id: "party",
                label: "自己去飲",
                effects: [
                    {type: "price_mult", goodId: "chips", mult: 1.2},
                    {type: "cash", amount: -4000},
                    {type: "health", amount: -6},
                ],
            },
            {
                id: "ignore",
                label: "早瞓",
                effects: [{type: "price_mult", goodId: "chips", mult: 1.05}],
            },
        ],
    },
    {
        id: "bitcoin_etf_rumor",
        title: "ETF 傳聞滿天飛",
        message: "群組：「就嚟批啦！」K 線同心跳一齊震。",
        weight: 0.85,
        choices: [
            {
                id: "buy_rumor",
                label: "信傳聞追入去",
                effects: [{type: "price_mult", goodId: "bitcoin", mult: 1.6}],
            },
            {
                id: "fade",
                label: "當假消息",
                effects: [{type: "price_mult", goodId: "bitcoin", mult: 1.1}],
            },
            {
                id: "leak",
                label: "加鹽加醋再傳出去",
                effects: [
                    {type: "price_mult", goodId: "bitcoin", mult: 1.4},
                    {type: "reputation", amount: -3},
                ],
            },
        ],
    },
    {
        id: "vitasoy_heatwave",
        title: "熱浪搶凍奶",
        message: "三十八度，便利店凍維他奶被掃清。",
        weight: 0.9,
        choices: [
            {
                id: "stack",
                label: "炒凍奶行情",
                effects: [{type: "price_mult", goodId: "vitasoy", mult: 1.65}],
            },
            {
                id: "hydrate",
                label: "買定一箱自己飲",
                effects: [
                    {type: "price_mult", goodId: "vitasoy", mult: 1.2},
                    {type: "cash", amount: -300},
                    {type: "health", amount: 3},
                ],
            },
            {
                id: "ac",
                label: "留喺屋企吹冷氣",
                effects: [
                    {type: "price_mult", goodId: "vitasoy", mult: 1.1},
                    {type: "cash", amount: -800},
                ],
            },
        ],
    },
    {
        id: "ev_charger_queue",
        title: "充電樁大排長龍",
        message: "充電站前面仲有七架車，你舊電就快跌到零。",
        weight: 0.9,
        choices: [
            {
                id: "wait",
                label: "繼續等",
                effects: [
                    {type: "health", amount: -5},
                    {type: "price_mult", goodId: "ev", mult: 0.85},
                ],
            },
            {
                id: "leave",
                label: "改搭巴士",
                effects: [
                    {type: "price_mult", goodId: "ev", mult: 0.95},
                    {type: "cash", amount: -50},
                    {type: "health", amount: 1},
                ],
            },
            {
                id: "argue",
                label: "同打尖司機嘈",
                effects: [
                    {type: "health", amount: -10},
                    {type: "price_mult", goodId: "ev", mult: 0.8},
                    {type: "reputation", amount: -2},
                ],
            },
        ],
    },
    {
        id: "red_packet_war",
        title: "人情利是戰",
        message: "喜酒、滿月、搬家宴同一個月砸落嚟。",
        weight: 0.9,
        choices: [
            {
                id: "full",
                label: "人情封到足",
                effects: [{type: "cash", amount: -18000}],
            },
            {
                id: "cut",
                label: "削減預算",
                effects: [
                    {type: "cash", amount: -8000},
                    {type: "reputation", amount: -4},
                ],
            },
            {
                id: "delay",
                label: "扮唔記得遲啲先回",
                effects: [
                    {type: "cash", amount: -12000},
                    {type: "reputation", amount: -2},
                ],
            },
        ],
    },
    {
        id: "night_market_win",
        title: "夜市夾公仔",
        message: "夾公仔機似喺度嘲笑你。要唔要再投幣？",
        weight: 1.05,
        choices: [
            {
                id: "win",
                label: "一嘢夾中",
                effects: [{type: "cash", amount: 2000}],
            },
            {
                id: "stop",
                label: "停手",
                effects: [{type: "cash", amount: -100}],
            },
            {
                id: "all_in",
                label: "蝕住繼續",
                effects: [
                    {type: "cash", amount: -800},
                    {type: "health", amount: -2},
                ],
            },
        ],
    },
    {
        id: "office_layoff_rumor",
        title: "公司裁員傳聞",
        message: "茶水間流傳「下個月大執位」，空氣凝固。",
        weight: 0.95,
        choices: [
            {
                id: "anxiety",
                label: "焦慮到失眠",
                effects: [{type: "health", amount: -11}],
            },
            {
                id: "prep",
                label: "更新 CV 偷面試",
                effects: [
                    {type: "health", amount: -5},
                    {type: "cash", amount: -1000},
                ],
            },
            {
                id: "gossip",
                label: "再放多啲流料",
                effects: [
                    {type: "health", amount: -8},
                    {type: "reputation", amount: -4},
                ],
            },
        ],
    },
    {
        id: "tax_return",
        title: "退稅入帳",
        message: "稅局終於退錢，App 顯示一筆入帳。",
        weight: 1,
        choices: [
            {
                id: "save",
                label: "即刻鎖入定期",
                effects: [{type: "cash", amount: 12800}],
            },
            {
                id: "splurge",
                label: "慰勞自己",
                effects: [
                    {type: "cash", amount: 8000},
                    {type: "health", amount: 6},
                ],
            },
            {
                id: "invest_talk",
                label: "大叫「投資自己」",
                effects: [
                    {type: "cash", amount: 10000},
                    {type: "reputation", amount: 1},
                ],
            },
        ],
    },
    {
        id: "mid_autumn_box",
        title: "月餅禮盒災難",
        message: "你收到八盒月餅，屋企個雪櫃已經頂唔順。",
        weight: 1,
        choices: [
            {
                id: "eat",
                label: "自己硬食",
                effects: [
                    {type: "cash", amount: -680},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "regift",
                label: "轉送畀同事",
                effects: [
                    {type: "cash", amount: -200},
                    {type: "reputation", amount: 2},
                ],
            },
            {
                id: "bin",
                label: "靜雞雞掉咗佢",
                effects: [
                    {type: "health", amount: -1},
                    {type: "reputation", amount: -1},
                ],
            },
        ],
    },
    {
        id: "double_eleven_sale",
        title: "雙十一網購劫",
        message: "撳埋單之前先發現，運費已經食晒所有折扣。",
        weight: 0.9,
        choices: [
            {
                id: "buy",
                label: "手痕照買",
                effects: [
                    {type: "cash", amount: -7500},
                    {type: "price_mult", goodId: "phone", mult: 0.8},
                ],
            },
            {
                id: "cart",
                label: "擺入購物車但唔買",
                effects: [{type: "price_mult", goodId: "phone", mult: 0.9}],
            },
            {
                id: "list",
                label: "寫篇戒買宣言",
                effects: [
                    {type: "reputation", amount: 1},
                    {type: "price_mult", goodId: "phone", mult: 0.95},
                ],
            },
        ],
    },
    {
        id: "hospital_bill",
        title: "私家醫院賬單",
        message: "為求安心去做檢查，報告未出，張單就搶住嚟。",
        weight: 0.8,
        choices: [
            {
                id: "pay",
                label: "咬實牙關畀錢",
                effects: [
                    {type: "cash", amount: -32000},
                    {type: "health", amount: 18},
                ],
            },
            {
                id: "public",
                label: "轉公營輪候",
                effects: [
                    {type: "cash", amount: -2000},
                    {type: "health", amount: 5},
                ],
            },
            {
                id: "skip",
                label: "都係唔驗",
                effects: [{type: "health", amount: -8}],
            },
        ],
    },
    {
        id: "ferry_cancel",
        title: "渡輪臨時停開",
        message: "出咗門口先收到取消通知，碼頭大風到人都企唔穩。",
        weight: 1.05,
        choices: [
            {
                id: "taxi",
                label: "改搭貴價車",
                effects: [
                    {type: "cash", amount: -480},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "wait",
                label: "死等下一班",
                effects: [{type: "health", amount: -8}],
            },
            {
                id: "home",
                label: "返屋企遙距算數",
                effects: [{type: "health", amount: 2}],
            },
        ],
    },
    {
        id: "wet_market_auntie",
        title: "街市阿嬸強力推銷",
        message: "阿嬸塞咗兩斤菜畀你：「新鮮到跳。」你根本唔敢拒絕。",
        weight: 1.15,
        choices: [
            {
                id: "buy",
                label: "照單全收",
                effects: [
                    {type: "cash", amount: -120},
                    {type: "health", amount: 4},
                ],
            },
            {
                id: "negotiate",
                label: "講價講到半價",
                effects: [
                    {type: "cash", amount: -60},
                    {type: "health", amount: 2},
                ],
            },
            {
                id: "run",
                label: "塞返畀阿嬸即走",
                effects: [
                    {type: "reputation", amount: -1},
                    {type: "health", amount: -1},
                ],
            },
        ],
    },
    {
        id: "blood_donate",
        title: "捐血一袋",
        message: "紅十字會擺街站，護士笑住遞張登記表畀你。",
        weight: 1.05,
        choices: [
            {
                id: "donate",
                label: "捐！",
                effects: [
                    {type: "reputation", amount: 4},
                    {type: "health", amount: -6},
                ],
            },
            {
                id: "skip",
                label: "下次啦",
                effects: [],
            },
            {
                id: "snack_only",
                label: "食完餅就走",
                effects: [
                    {type: "reputation", amount: -1},
                    {type: "health", amount: 1},
                ],
            },
        ],
    },
    {
        id: "flag_day",
        title: "賣旗日當義工",
        message: "社福機構唔夠人手，一朝早連旗袋都幫你準備好。",
        weight: 1.1,
        choices: [
            {
                id: "volunteer",
                label: "做足全日",
                effects: [
                    {type: "reputation", amount: 3},
                    {type: "health", amount: -3},
                ],
            },
            {
                id: "half",
                label: "做兩個鐘就走",
                effects: [
                    {type: "reputation", amount: 1},
                    {type: "health", amount: -1},
                ],
            },
            {
                id: "donate_cash",
                label: "畀錢代替出力",
                effects: [
                    {type: "cash", amount: -3000},
                    {type: "reputation", amount: 4},
                ],
            },
        ],
    },
    {
        id: "food_bank_shift",
        title: "食物銀行執貨",
        message: "周末貨倉唔夠義工，成堆米同罐頭等人執。",
        weight: 1,
        choices: [
            {
                id: "full",
                label: "執貨兼捐一筆",
                effects: [
                    {type: "cash", amount: -8000},
                    {type: "reputation", amount: 6},
                    {type: "health", amount: -4},
                ],
            },
            {
                id: "time_only",
                label: "淨係出力唔出錢",
                effects: [
                    {type: "reputation", amount: 3},
                    {type: "health", amount: -4},
                ],
            },
            {
                id: "money_only",
                label: "捐錢唔現身",
                effects: [
                    {type: "cash", amount: -8000},
                    {type: "reputation", amount: 4},
                ],
            },
        ],
    },
    {
        id: "elderly_visit",
        title: "探訪獨居長者",
        message: "機構問你去唔去探獨居伯伯，連水果籃都幫你睇好。",
        weight: 1.05,
        choices: [
            {
                id: "visit",
                label: "探訪",
                effects: [
                    {type: "cash", amount: -500},
                    {type: "reputation", amount: 5},
                    {type: "health", amount: 2},
                ],
            },
            {
                id: "skip",
                label: "話太忙推咗佢",
                effects: [{type: "reputation", amount: -1}],
            },
            {
                id: "money",
                label: "畀錢買物資唔到場",
                effects: [
                    {type: "cash", amount: -2000},
                    {type: "reputation", amount: 3},
                ],
            },
        ],
    },
    {
        id: "scholarship_fund",
        title: "資助清貧學生",
        message: "社工轉介個案，支票簿同良心一齊顫抖。",
        weight: 0.85,
        choices: [
            {
                id: "full",
                label: "簽足數",
                effects: [
                    {type: "cash", amount: -50000},
                    {type: "reputation", amount: 12},
                ],
            },
            {
                id: "half",
                label: "資助一半",
                effects: [
                    {type: "cash", amount: -25000},
                    {type: "reputation", amount: 7},
                ],
            },
            {
                id: "no",
                label: "心有餘，錢不足",
                effects: [{type: "reputation", amount: -1}],
            },
        ],
    },
    {
        id: "stray_rescue",
        title: "拯救街貓手術費",
        message: "後巷有隻貓受咗傷，獸醫一報價，你差啲慘過隻貓。",
        weight: 0.95,
        choices: [
            {
                id: "save",
                label: "救貓",
                effects: [
                    {type: "cash", amount: -15000},
                    {type: "reputation", amount: 7},
                ],
            },
            {
                id: "share",
                label: "開眾籌兼出一份",
                effects: [
                    {type: "cash", amount: -5000},
                    {type: "reputation", amount: 4},
                ],
            },
            {
                id: "walk",
                label: "扮睇唔到走人",
                effects: [
                    {type: "health", amount: -4},
                    {type: "reputation", amount: -2},
                ],
            },
        ],
    },
    {
        id: "community_chest",
        title: "公益金捐款",
        message: "公司群組發起配對捐款，「有心」金額任揀。",
        weight: 1,
        choices: [
            {
                id: "big",
                label: "大手筆",
                effects: [
                    {type: "cash", amount: -25000},
                    {type: "reputation", amount: 9},
                ],
            },
            {
                id: "min",
                label: "意思意思",
                effects: [
                    {type: "cash", amount: -5000},
                    {type: "reputation", amount: 3},
                ],
            },
            {
                id: "ignore",
                label: "已讀不覆",
                effects: [{type: "reputation", amount: -2}],
            },
        ],
    },
    {
        id: "typhoon_shelter_help",
        title: "避風中心派飯",
        message: "十號波掛緊，避風中心偏偏唔夠人手派飯盒。",
        weight: 1,
        choices: [
            {
                id: "help",
                label: "去派飯",
                effects: [
                    {type: "reputation", amount: 5},
                    {type: "health", amount: -5},
                ],
            },
            {
                id: "home",
                label: "自己避風",
                effects: [{type: "health", amount: 3}],
            },
            {
                id: "donate_meals",
                label: "贊助飯盒",
                effects: [
                    {type: "cash", amount: -4000},
                    {type: "reputation", amount: 4},
                ],
            },
        ],
    },
    {
        id: "corporate_donation",
        title: "冠名慈善晚會",
        message: "晚宴司儀遞咪：「下一位善長……」聚光燈打中你。",
        weight: 0.75,
        choices: [
            {
                id: "headline",
                label: "高額認捐",
                effects: [
                    {type: "cash", amount: -120000},
                    {type: "reputation", amount: 18},
                ],
            },
            {
                id: "modest",
                label: "中額掛名",
                effects: [
                    {type: "cash", amount: -40000},
                    {type: "reputation", amount: 8},
                ],
            },
            {
                id: "escape",
                label: "去洗手間避難",
                effects: [
                    {type: "reputation", amount: -5},
                    {type: "health", amount: -2},
                ],
            },
        ],
    },
    {
        id: "anonymous_kindness",
        title: "低調做好事",
        message: "鄰居搬緊貨，阿婆又拎住袋重嘢。你啱啱經過，大可以扮睇唔到。",
        weight: 1.15,
        choices: [
            {
                id: "help",
                label: "出手幫忙",
                effects: [{type: "reputation", amount: 2}],
            },
            {
                id: "phone",
                label: "低頭撳手機行過",
                effects: [],
            },
            {
                id: "extra",
                label: "幫完手仲請飲茶",
                effects: [
                    {type: "cash", amount: -200},
                    {type: "reputation", amount: 4},
                ],
            },
        ],
    },
    {
        id: "organ_donor_card",
        title: "簽器官捐贈卡",
        message: "街站職員遞咗張器官捐贈卡同支筆畀你。",
        weight: 1.05,
        choices: [
            {
                id: "sign",
                label: "簽咗佢",
                effects: [
                    {type: "reputation", amount: 3},
                    {type: "health", amount: 3},
                ],
            },
            {
                id: "later",
                label: "遲啲先算",
                effects: [],
            },
            {
                id: "debate",
                label: "同職員辯論哲學",
                effects: [
                    {type: "health", amount: -2},
                    {type: "reputation", amount: 1},
                ],
            },
        ],
    },
    {
        id: "park_cleanup",
        title: "公園清潔日",
        message: "屋邨通知：今個星期日一齊清潔公園，手套自備。",
        weight: 1.1,
        choices: [
            {
                id: "join",
                label: "落場執垃圾",
                effects: [
                    {type: "reputation", amount: 4},
                    {type: "health", amount: -2},
                ],
            },
            {
                id: "skip",
                label: "留喺屋企瞓",
                effects: [],
            },
            {
                id: "sponsor",
                label: "贊助物資",
                effects: [
                    {type: "cash", amount: -1500},
                    {type: "reputation", amount: 3},
                ],
            },
        ],
    },
] as const;

export const EVENT_MAP: Record<EventId, EventDef> = Object.fromEntries(EVENTS.map(e => [e.id, e])) as Record<EventId, EventDef>;
