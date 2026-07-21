import {useState} from "react";
import {GOODS} from "@/data/goods";
import {formatMoney} from "@/game/format";
import {getUsedWarehouse} from "@/game/engine";
import {WAREHOUSE_UPGRADE_COST, WAREHOUSE_UPGRADE_SIZE} from "@/game/constants";
import type {GameState, GoodId} from "@/types/game";
import {Button} from "@/components/Button";
import {QuantityInput} from "@/components/QuantityInput";
import {Section} from "@/components/Section";
import {GOOD_EMOJI, TIER_LABEL} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
    onUpgradeWarehouse: () => void;
}

export function MarketPanel({state, locked, onBuy, onSell, onUpgradeWarehouse}: Props) {
    const used = getUsedWarehouse(state);
    const free = Math.max(0, state.warehouseCapacity - used);
    const canUpgrade = !locked && state.cash >= WAREHOUSE_UPGRADE_COST;

    return (
        <Section
            title="市場炒賣"
            emoji="🛒"
            accent="sky"
            action={
                <span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black text-(--ink)">
                    倉 {used}/{state.warehouseCapacity}
                </span>
            }
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-xs font-bold">
                <span>剩餘空間 {free} 格</span>
                <Button
                    size="sm"
                    variant="secondary"
                    disabled={!canUpgrade}
                    className="!w-auto"
                    onClick={() => {
                        if (!window.confirm(`花 ${formatMoney(WAREHOUSE_UPGRADE_COST)} 升級倉庫 +${WAREHOUSE_UPGRADE_SIZE} 格？`)) return;
                        onUpgradeWarehouse();
                    }}
                >
                    升級 +{WAREHOUSE_UPGRADE_SIZE}
                </Button>
            </div>

            <ul className="space-y-3">
                {GOODS.map(good => (
                    <GoodRow
                        key={good.id}
                        goodId={good.id}
                        name={good.name}
                        tier={good.tier}
                        price={state.prices[good.id] ?? 0}
                        owned={state.inventory[good.id] ?? 0}
                        cash={state.cash}
                        freeSpace={free}
                        space={good.space}
                        locked={locked}
                        onBuy={onBuy}
                        onSell={onSell}
                    />
                ))}
            </ul>
        </Section>
    );
}

interface GoodRowProps {
    goodId: GoodId;
    name: string;
    tier: (typeof GOODS)[number]["tier"];
    price: number;
    owned: number;
    cash: number;
    freeSpace: number;
    space: number;
    locked: boolean;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
}

function GoodRow({
    goodId,
    name,
    tier,
    price,
    owned,
    cash,
    freeSpace,
    space,
    locked,
    onBuy,
    onSell,
}: GoodRowProps) {
    const [qty, setQty] = useState(1);
    const cost = price * qty;
    const needSpace = space * qty;
    const canBuy = !locked && price > 0 && cash >= cost && needSpace <= freeSpace;
    const canSell = !locked && owned >= qty;

    return (
        <li className="rounded-2xl border-2 border-(--border) bg-[#fffdf8] p-3">
            <div className="mb-2 flex items-start gap-3">
                <div
                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-(--accent) text-2xl shadow-[2px_2px_0_var(--border)]"
                    aria-hidden="true"
                >
                    {GOOD_EMOJI[goodId]}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-base font-black" style={{fontFamily: "var(--font-display)"}}>
                            {name}
                        </h4>
                        <span className="rounded-md border border-(--border) bg-white px-1.5 py-0.5 text-[10px] font-black text-(--muted)">
                            {TIER_LABEL[tier]}
                        </span>
                    </div>
                    <p className="mt-0.5 text-sm font-black tabular-nums">{formatMoney(price)}</p>
                    <p className="text-xs font-bold text-(--muted)">持倉 {owned}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <QuantityInput
                    id={`qty-${goodId}`}
                    label={`${name} 數量`}
                    value={qty}
                    onChange={setQty}
                    min={1}
                    max={999}
                    disabled={locked}
                />
                <Button size="sm" variant="secondary" disabled={!canBuy} className="min-w-16 flex-1" onClick={() => onBuy(goodId, qty)}>
                    買
                </Button>
                <Button size="sm" variant="ghost" disabled={!canSell} className="min-w-16 flex-1" onClick={() => onSell(goodId, qty)}>
                    賣
                </Button>
            </div>
            {!locked && qty > 0 ? (
                <p className="mt-2 text-[11px] font-bold text-(--muted)">
                    買入約 {formatMoney(cost)}
                    {needSpace > freeSpace ? " · 倉庫爆滿" : ""}
                    {cash < cost ? " · 錢唔夠" : ""}
                </p>
            ) : null}
        </li>
    );
}
