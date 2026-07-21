# 一億小目標

一隻 **5–10 分鐘一局** 嘅文字模擬經營遊戲：20 歲出社會，用 40 年靠炒貨、創業同家庭選擇，喺 60 歲退休前累積至少 **HK$100,000,000**。

風格係惡搞 Cartoon、香港口語、黑色幽默——唔係嚴肅理財 App。

完整產品同實作規格見 `[SPEC.md](./SPEC.md)`。

## 點玩（MVP）

1. 開始遊戲 → RNG **投胎**到唔同家庭，決定起步資金
2. 每年先出隨機事件，再自由買賣、創業、相親
3. 按「結束今年」結算公司／家庭／健康／負債
4. 健康歸零即猝死；活到 60 歲退休並評級

### 投胎家庭

| 家庭   | 起步資金     |
| ------ | ------------ |
| 死窮撚 | HK$1,000     |
| 死中產 | HK$100,000   |
| 二世祖 | HK$1,000,000 |

## 技術棧

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Vitest（engine 單元測試）
- 手機優先 light-mode PWA（manifest 已接）

規則層係純 TypeScript engine；UI 只呼叫 hook／engine，唔直接改遊戲數值。

## 開始開發

需要 Node.js 同 [pnpm](https://pnpm.io/)。

```bash
pnpm install
pnpm dev
```

開 [http://localhost:5173](http://localhost:5173)。

### Scripts

| Command          | 用途                  |
| ---------------- | --------------------- |
| `pnpm dev`       | 本機開發伺服器        |
| `pnpm typecheck` | TypeScript 檢查       |
| `pnpm test`      | Vitest 單元測試       |
| `pnpm build`     | 生產建置              |
| `pnpm preview`   | 預覽 production build |
| `pnpm lint`      | oxlint                |
| `pnpm format`    | Prettier 格式化       |

## 目錄結構

```
src/
  components/   UI（標題頁、面板、modal…）
  data/         商品 / 公司 / 伴侶 / 事件定義
  game/         純函式 engine、RNG、constants、format
  hooks/        useGame（UI state）
  types/        領域型別
public/         favicon、manifest、靜態 asset
SPEC.md         產品／實作規格（唯一真相來源）
```

## 開發方式

跟 `SPEC.md` 分段實作（Phase 0 → 4）：

| Phase | 內容                         |
| ----- | ---------------------------- |
| 0     | 盤點與基線                   |
| 1     | 規則層穩定（engine + 測試）  |
| 2     | MVP UI 完整化 + Cartoon 風格 |
| 3     | 平衡與可玩性                 |
| 4     | PWA 品質（離線 shell 等）    |

每次只做一個 phase／一個 task；未寫入 SPEC 嘅功能唔當 MVP。

## 目前狀態

專案已 scaffold；標題頁同 PWA manifest 可用。Engine 多數 action 仍係 stub，等 Phase 1 按 SPEC 補齊。

## License

[MIT](./LICENSE.md)
