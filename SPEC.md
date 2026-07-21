# 《一億小目標》實作規格

> 呢份文件係 AI 同開發者共同執行用嘅產品規格。每次只完成一個 phase，完成後先跑驗收，再進入下一個 phase。任何未寫入本文件嘅功能，唔屬於 MVP 必做範圍。

## 1. 產品定位

### 1.1 一句話

一隻 5–10 分鐘完成一局嘅文字模擬經營遊戲：玩家由 20 歲開始，用 40 年靠炒貨、創業同家庭選擇，喺 60 歲退休前累積至少 HK$100,000,000。

### 1.2 目標平台

- 手機優先、直向（portrait）嘅 light-mode PWA。
- 支援窄屏寬度 320px 起；桌面只需要保持可用，不做 desktop-only 版面。
- 主要操作係按鈕、數字輸入同 modal；唔需要拖放或鍵盤快捷鍵。
- 所有玩家可見文字用繁體中文、偏香港口語；數字顯示使用 HK$ 同千位分隔。

### 1.3 技術邊界

- React + TypeScript + Vite + Tailwind CSS。
- 遊戲規則放喺純 TypeScript engine，UI 唔直接改 state。
- Zustand 可以作為 UI state layer；如果現有 code 已有可用 hook，先保留現有架構，唔為引入 Zustand 而大改。
- MVP 不需要後端、登入、資料庫或網絡 API。重新整理頁面可以當作重新開局。
- 隨機數集中喺 RNG adapter；提供可選 seed，方便測試和重現 bug。

### 1.4 視覺與美術方向：惡搞 Cartoon

遊戲唔係嚴肅理財工具，而係一隻帶香港生活感嘅惡搞 Cartoon 模擬遊戲。所有畫面要做到「一眼睇得明、兩眼覺得荒謬、三眼想繼續玩」。

- 整體採用鮮明、扁平、略帶粗黑外框嘅 Cartoon 插畫風；避免寫實金融 dashboard、企業 SaaS 風或過度陰沉嘅純黑介面。
- 角色、商品、公司同事件各自有誇張表情或動作：例如炒幣時雙眼變錢幣、住院時頭頂出十字星、公司倒閉時招牌歪斜冒煙。
- 以 light mode 為底，主色使用米白/淺灰背景，加上鮮黃、珊瑚紅、薄荷綠、天藍等高對比點綴色；危險狀態用紅色，賺錢/成功用綠色，唔用大面積漸層。
- 卡片、按鈕、modal 可以有輕微不規則邊框、貼紙、漫畫速度線或爆炸字效果，但資訊區仍要保持清楚，唔可以遮住數字或操作。
- 事件 modal 要似漫畫「啪」一聲彈出：大標題、角色/商品插畫位、短句效果摘要；動畫只作 feedback，唔可以阻礙玩家快速完成一局。
- 文案保持香港口語、黑色幽默、誇張但易明；數值、成本、失敗原因仍然要直接講清楚，唔可以為搞笑而隱藏規則。
- 圖像優先使用可替換嘅本地 asset 或 CSS/emoji fallback；每個視覺 asset 要有語意化 alt text，同時唔可以依賴圖片先理解核心操作。
- mobile 版優先，插畫只佔有限面積；主視線要留畀年齡、現金、健康、當年市場及「結束今年」。

### 1.5 美術驗收標準

- 首頁、事件 modal、商品卡、公司卡、家庭卡、死亡/退休頁至少各有一個 Cartoon 視覺提示。
- 同一種視覺語言貫穿全站：線條粗幼、圓角、陰影、貼紙/漫畫效果唔可以每個 component 各自一套。
- 任何插畫、裝飾或動畫移除後，玩家仍然可以完成所有遊戲操作；視覺係增強理解同氣氛，唔係規則依賴。
- 320px 寬度下，角色圖或漫畫字效唔可以壓住價格、按鈕、健康條或 log。

## 2. MVP 成功條件

玩家可以完成以下閉環，而且每一步都可以由 engine 單元測試驗證：

1. 開始新遊戲，初始 20 歲、100 健康、0 名聲；現金由 RNG 投胎家庭決定（見第 4 節）。
2. 每年先出一個事件，再開放該年嘅市場及操作。
3. 買入、賣出商品；倉庫容量不足或現金不足時，操作必須失敗並顯示原因。
4. 升級倉庫、創業、結婚；每種操作都有清楚條件及成本。
5. 按「結束今年」後，正確結算公司、家庭、健康、負債及下一年價格。
6. 健康歸 0 時即時死亡；年齡到 60 歲時退休並計算總資產。
7. 顯示四級資產評級，並可以重新開始另一局。
8. 主要畫面及事件呈現一致嘅惡搞 Cartoon style，而唔係純文字表格或一般 admin dashboard。

### 2.1 MVP 不做

存檔/讀檔、排行榜、多人、後端帳戶、音效、粒子動畫、成就、廣告、支付、分享卡片、複雜股票 K 線、自由職業、離婚、第二段婚姻、未成年子女操作，全部留到 MVP 之後再另開規格。

## 3. 遊戲狀態機

`phase` 只可以係以下其中一個值：

| phase     | 畫面                  | 可用操作                              | 離開條件              |
| --------- | --------------------- | ------------------------------------- | --------------------- |
| `title`   | 標題頁                | 開始遊戲                              | `startGame`           |
| `event`   | 事件 modal + 當年摘要 | 關閉事件                              | `dismissEvent`        |
| `playing` | 主遊戲頁              | 買賣、升級、創業、相親/結婚、結束今年 | `endTurn`、死亡、退休 |
| `dead`    | 猝死結算頁            | 重新開始                              | `startGame`           |
| `retired` | 退休結算頁            | 重新開始                              | `startGame`           |

規則：

- `event` 未關閉前，禁止所有市場及投資操作。
- `dead` / `retired` 禁止修改任何遊戲數值。
- 所有 engine action 必須回傳新 state，唔可以直接 mutate 舊 state。
- UI 只根據 `phase` 決定顯示同 disabled 狀態；規則層仍然要再次驗證。

## 4. 初始數值及回合定義

| 項目     | 規格                                |
| -------- | ----------------------------------- |
| 起始年齡 | 20                                  |
| 退休年齡 | 60（完成 20–59 共 40 個回合後退休） |
| 起始現金 | 由投胎家庭決定（見下表）            |
| 起始健康 | 100，範圍 0–100                     |
| 起始名聲 | 0，範圍 0–100                       |
| 起始倉庫 | 100 格                              |
| 遊戲目標 | 退休時總資產 >= HK$100,000,000      |
| 貨幣     | 整數 HK$；所有計算最後 round 到整數 |

### 4.1 投胎家庭（初次資金）

`startGame` 必須用可注入 RNG 隨機投胎到以下其中一個家庭；同一局內 `birthFamilyId` 同起始現金唔可以再改。三種家庭權重相同（各 1/3），除非日後另開平衡規格。

| id             | 名稱   | 起始現金     |
| -------------- | ------ | ------------ |
| `low_class`    | 死窮撚 | HK$1,000     |
| `middle_class` | 死中產 | HK$100,000   |
| `high_class`   | 二世祖 | HK$1,000,000 |

投胎結果必須寫入首條 log（例如「投胎成功：你而家係一名死窮撚，起步資金 HK$1,000」），並喺開局時讓玩家睇到。固定 seed 時必須可重現同一家庭。

健康低於 30 係警戒狀態，不代表必然死亡；健康等於 0 先觸發猝死。現金可以暫時負數，但年結算後要進入清盤規則。

## 5. 每回合固定流程

每個回合嚴格按以下順序執行：

1. `beginTurn`：以目前年齡計算通脹，產生本年商品價格及一個隨機事件。
2. 套用事件效果：改價、改現金或改健康；事件資料必須 data-driven，唔好將商品 id 散落喺 UI。
3. 進入 `event`，玩家關閉 modal 後進入 `playing`。
4. 玩家自由操作任意次數，但每次操作都要即時驗證現金、庫存、條件及 phase。
5. `endTurn` 結算：
    - 公司收入及維護費；
    - 伴侶家用、子女學費及子女隨機結果；
    - 固定健康消耗及伴侶健康效果；
    - 低健康住院效果；
    - 負現金清盤；
    - 寫入本年 log。
6. 若健康 <= 0，進入 `dead`，唔再加年齡。
7. 否則年齡加 1；若新年齡 >= 60，進入 `retired` 並計算結算資產；否則呼叫下一個 `beginTurn`。

> 結算順序係遊戲規則一部分。改動順序要同步更新測試及本節文件。

## 6. 核心資料模型

以下係概念 TypeScript model；實作可以加欄位，但唔可以刪走 MVP 必需欄位或改變語意。

```ts
type Phase = "title" | "event" | "playing" | "dead" | "retired";
type GameOverReason = "death" | "retirement";
type BirthFamilyId = "public_housing" | "middle_class" | "mid_levels";

interface GameState {
    phase: Phase;
    age: number;
    cash: number;
    health: number;
    reputation: number;
    birthFamilyId: BirthFamilyId | null; // title 階段為 null；startGame 後必填
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
```

## 7. 市場與倉庫

### 7.1 商品資料

MVP 至少有 6 種商品，分為低、中、高三個 tier：薯片、維他奶、智能手機、名牌波鞋、比特幣、黃金、電動車、美股期權。每件商品最少有：`id`、名稱、tier、基礎價、價格波幅、倉庫格數。

### 7.2 價格公式

```text
inflation = 1 + max(0, age - 20) * 0.02
price = round(basePrice * inflation * random(0.5, 2.0) * eventMultiplier)
```

`random(0.5, 2.0)` 要由可注入 RNG 產生；唔可以喺 render 時重新計價。事件 multiplier 預設 1。

### 7.3 買賣規則

- 買入成本 = `price * quantity`；現金不足就拒絕。
- 賣出收入 = `price * quantity`；持倉不足就拒絕。
- 買入後倉庫用量不可超過容量。
- 每件商品佔用 1 格；`usedWarehouse = sum(inventory)`。
- 初始倉庫 100 格；每次升級 +50 格，成本由 data/constants 統一管理。
- 買入、賣出成功及失敗都要寫入 log，方便玩家理解發生咩事。

## 8. 創業系統

MVP 至少有四種公司：珍珠奶茶店、網吧、AI 科技初創、房地產集團。公司 definition 最少包括：初始投資、每年收入、每年維護費、估值、最低名聲、倒閉率。

- 玩家可以同時擁有多間公司；每間公司用 `OwnedCompany` 紀錄。
- 創業先扣投資金，再按名聲及 RNG 判斷成功；失敗要有 log，唔可以靜默扣錢。
- 每年先收收入，再扣維護費；公司淨現金流可以係負數。
- 倒閉時刪除該公司，估值歸 0，並寫入事件 log。
- 退休資產中的公司價值 = 所有仍持有公司嘅估值總和，唔係累計收入。

## 9. 關係與家庭系統

MVP 至少有三位可相親對象，並以 data-driven definition 描述：名稱、結婚成本、最低現金/名聲/資產條件、結婚即時效果、每年效果。

- 相親只顯示目前可選對象及未滿足條件；唔滿足條件時按鈕 disabled，engine 仍要拒絕。
- 結婚只可以發生一次；結婚成功後 `partnerId` 不可變回 null。
- 每年有機率生一個子女；子女有出生年、每年學費及成年回報年齡。
- 子女成年後只觸發一次回報：正面回報加錢，負面回報扣錢；結果由 RNG 決定並寫入 log。
- 伴侶效果要標示係「即時」定「每年」，避免 UI 同結算層誤解。

## 10. 隨機事件

MVP 先做 4 個事件，事件 definition 至少包括 `id`、標題、內文、權重、效果函式/效果資料：

| id             | 文案方向                   | 效果                      |
| -------------- | -------------------------- | ------------------------- |
| `snack_boom`   | 天王巨星代言薯片，全城瘋搶 | 薯片 multiplier = 5       |
| `crypto_crash` | 區塊鏈泡沫爆破，交易所跑路 | 比特幣 multiplier = 0.1   |
| `windfall`     | 行街踩中六合彩             | 現金 + HK$100,000         |
| `collapse`     | 打兩份工兼炒幣，暈倒街頭   | 健康 -30、現金 -HK$20,000 |

事件效果可以疊加當年通脹，但唔可以改動歷史持倉成本。事件 modal 必須顯示：標題、內文、受影響數值、關閉按鈕。

## 11. 健康、負債與清盤

- 每年固定健康消耗由 constants 管理；伴侶效果可以抵銷或增加。
- 結算前後健康都要 clamp 到 0–100。
- 可以睇醫生，但需要付醫療費。
- 健康低於 30：觸發住院，扣醫療費並恢復少量健康；若現金不足，仍然可以令現金變負數。
- 年結算後現金 < 0，`debtTurns += 1`；下一年若仍無法還清，依次清算庫存，再清算公司。
- 清盤成交價用當年市場價（公司用估值）；清盤後現金回到 0 或以上先可繼續。
- 清盤結果必須寫 log。MVP 唔需要信用評分或破產專用畫面。

## 12. 結算與評級

```text
inventoryValue = sum(inventory[good] * prices[good])
companyValue = sum(ownedCompany.valuation)
totalAssets = cash + inventoryValue + companyValue
```

退休或死亡畫面都顯示現金、貨物、公司三項分拆，並顯示 total assets。評級固定如下：

| 總資產                  | 評級         | 語氣                               |
| ----------------------- | ------------ | ---------------------------------- |
| `< 100,000`             | 底層黎生     | 你呢一生人都係幫老細供樓。         |
| `100,000–9,999,999`     | 平凡中產     | 叫做好過人，勉強買到個兩房單位。   |
| `10,000,000–99,999,999` | 半隻腳上岸   | 財富自由近在眼前，但仲未完成目標。 |
| `>= 100,000,000`        | 小目標達成！ | 人生贏家，可以隨便開香檳。         |

死亡仍然要顯示資產，但標明「未活到 60 歲」；評級依然按同一套門檻計算。

## 13. UI 資訊架構

### Title screen

顯示遊戲名、一句目標、惡搞 Cartoon 主視覺、開始按鈕、版本/MVP 標示。唔放長篇教學；第一次操作時用短提示。按開始後，必須先揭示今局投胎家庭同起步資金，再進入第一年事件。

### Game screen

由上至下：

1. 年齡進度（20 → 60）及目前 phase；
2. 現金、健康、名聲、倉庫用量四個 stat；
3. 當年事件/市場摘要；
4. 市場卡片（每件商品價格、持倉、買入/賣出數量）；
5. 公司、家庭兩個操作區；
6. 最近 log；
7. 固定而明顯嘅「結束今年」按鈕。

手機版要避免橫向 overflow；危險操作（大量買入、創業、結束今年）要有確認或清楚結果提示。健康、現金、倉庫爆紅只代表警示，唔好遮住數值。

### 結算 screen

顯示死因/退休標籤、三項資產分拆、總資產、評級、重新開始按鈕。唔顯示不可操作嘅假按鈕。

## 14. Engine API 契約

核心 engine 應提供以下純函式（名稱可按現有 code 保留）：

```ts
createInitialState(seed?: number): GameState
startGame(state: GameState, seed?: number): GameState
beginTurn(state: GameState): GameState
dismissEvent(state: GameState): GameState
buyGood(state: GameState, goodId: GoodId, quantity: number): GameState
sellGood(state: GameState, goodId: GoodId, quantity: number): GameState
upgradeWarehouse(state: GameState): GameState
foundCompany(state: GameState, companyId: CompanyTypeId): GameState
marry(state: GameState, partnerId: PartnerId): GameState
endTurn(state: GameState): GameState
totalAssets(state: GameState): number
getRank(totalAssets: number): Rank
```

無效 action 要保持 state 不變（除非有明確 error log）；數量必須係正整數。純函式測試要覆蓋成功、失敗、邊界及重複呼叫。

## 15. AI 分階段實作順序

每個 phase 完成後，AI 必須回覆：改咗咩、跑咗咩 command、測試結果、未解決風險；未完成就唔好自動跳下一 phase。

### Phase 0：盤點與基線

- 讀 `SPEC.md`、`src/types/game.ts`、`src/game/engine.ts`、`src/hooks/useGame.ts`。
- 跑 `pnpm typecheck`、`pnpm build`。
- 列出現有實作同本 spec 不一致嘅地方，唔好先改 code。

### Phase 1：規則層穩定

- 整理 types、constants、data definitions。
- 固定 phase gate、回合結算順序、RNG 注入。
- 為買賣、事件、`endTurn`、資產計算補單元測試。

### Phase 2：MVP UI 完整化

- 先確保 mobile layout、事件 modal、stat、market、company、family、log、結算頁完整。
- 為主要畫面補上統一嘅 Cartoon 視覺語言、asset fallback、事件/成功/失敗 feedback。
- UI 只呼叫 engine/hook action；唔將商業規則寫入 component。
- 補 disabled、empty、negative cash、health warning、退休/死亡等狀態。

### Phase 3：平衡與可玩性

- 用固定 seed 跑至少 10 局，記錄 20、40、60 歲資產分布。
- 調整價格波幅、公司回報、事件權重，令「全靠一種策略」唔係唯一解。
- 驗證普通玩家一局約 5–10 分鐘完成。

### Phase 4：PWA 品質

- 補 manifest、icons、theme color、離線 app shell（遊戲資料仍可不保存）。
- 用手機 viewport 做 visual check，確認冇橫向 overflow、按鈕可點、文字唔重疊。

## 16. 驗收清單

### 規則

- [ ] 初始 state 數值完全符合第 4 節。
- [ ] 20–59 歲恰好 40 個回合，60 歲退休。
- [ ] event → playing → endTurn 流程不可跳步。
- [ ] 無效買賣/投資唔會改動資產。
- [ ] 健康 = 0 立即死亡，死亡後唔再結算下一年。
- [ ] 退休/死亡資產公式及四級評級正確。

### UI

- [ ] 320px 寬度冇水平滾動。
- [ ] event modal 開啟時底層操作不可用。
- [ ] 現金、健康、倉庫、負債警示清楚但唔遮擋其他內容。
- [ ] 所有主要 action 有成功/失敗 feedback。
- [ ] 結算頁可以重新開始。
- [ ] 首頁、事件、商品、公司、家庭、結算頁都有一致 Cartoon 視覺提示。
- [ ] Cartoon 插畫/動畫唔會遮住核心數值或阻礙操作。

### 工程

- [ ] `pnpm typecheck` 通過。
- [ ] `pnpm build` 通過。
- [ ] 純 engine 測試覆蓋邊界 case。
- [ ] `git diff --check` 通過。
- [ ] 無新增未使用依賴，無把規則散落喺 UI。

## 17. AI 每次執行嘅工作格式

將以下格式貼畀 AI，並一次只指定一個 task：

```text
你係《一億小目標》嘅實作 agent。

目前 phase：<Phase 0–4>
今次唯一 task：<一個可在一次工作完成嘅改動>
相關檔案：<列出檔案>
不可改動：<列出範圍>
驗收條件：
- <可觀察條件 1>
- <可觀察條件 2>
- 視覺要求：<今次 task 需要嘅 Cartoon style 限制；如不涉及視覺，寫「不涉及」>

先讀相關現有 code，再實作。完成後只回報：
1. 改動摘要
2. 測試/command 及結果
3. 未完成或風險
唔好順手做其他 phase、重構或加新功能。
```

## 18. 待決策事項

以下項目未定案，AI 唔可以自行當成規則加入；要由產品決定後先更新本文件：

- 是否需要真正安裝 `zustand`，定係沿用現有 hook。
- 清盤係同一個回合立即發生，定係下一回合開始前發生（本版暫定年結算後立即發生）。
- 子女出生機率、成年年齡及每一間公司嘅具體數值。
- 是否允許公司同一類型持有多間。
- PWA 是否需要「繼續上次遊戲」存檔。
