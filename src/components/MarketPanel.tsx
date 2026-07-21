import {useState} from "react";
import {GOODS} from "@/data/goods";
import {formatMoney} from "@/game/format";
import {fairUnitPrice, getUsedWarehouse} from "@/game/engine";
import {WAREHOUSE_UPGRADE_COST, WAREHOUSE_UPGRADE_SIZE} from "@/game/constants";
import type {GameState, GoodId} from "@/types/game";
import {Button} from "@/components/Button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {QuantityInput} from "@/components/QuantityInput";
import {Section} from "@/components/Section";
import {GOOD_ICONS, MarketSectionIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    highlightGoodId?: GoodId | null;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
    onUpgradeWarehouse: () => void;
}

export const MarketPanel = ({state, locked, highlightGoodId, onBuy, onSell, onUpgradeWarehouse}: Props) => {
    const [confirmUpgrade, setConfirmUpgrade] = useState(false);
    const used = getUsedWarehouse(state);
    const free = Math.max(0, state.warehouseCapacity - used);
    const canUpgrade = !locked && state.cash >= WAREHOUSE_UPGRADE_COST;

    return (
        <Section
            title="市場炒賣"
            icon={MarketSectionIcon}
            accent="sky"
            action={
                <span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black text-(--ink)">
                    倉 {used}/{state.warehouseCapacity}
                </span>
            }
        >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-xs font-bold">
                <span>剩餘空間 {free} 格</span>
                <Button size="sm" variant="secondary" disabled={!canUpgrade} className="w-auto!" onClick={() => setConfirmUpgrade(true)}>
                    升級 +{WAREHOUSE_UPGRADE_SIZE}
                </Button>
            </div>

            <ul className="space-y-3">
                {GOODS.map(good => (
                    <GoodRow
                        key={good.id}
                        goodId={good.id}
                        name={good.name}
                        price={state.prices[good.id] ?? 0}
                        fair={fairUnitPrice(good.id, state.age)}
                        owned={state.inventory[good.id] ?? 0}
                        cash={state.cash}
                        freeSpace={free}
                        space={good.space}
                        locked={locked}
                        highlighted={highlightGoodId === good.id}
                        onBuy={onBuy}
                        onSell={onSell}
                    />
                ))}
            </ul>

            {confirmUpgrade ? (
                <ConfirmModal
                    title="升級倉庫？"
                    message={`花 ${formatMoney(WAREHOUSE_UPGRADE_COST)} 升級倉庫 +${WAREHOUSE_UPGRADE_SIZE} 格。`}
                    confirmLabel="升級"
                    cancelLabel="取消"
                    onCancel={() => setConfirmUpgrade(false)}
                    onConfirm={() => {
                        setConfirmUpgrade(false);
                        onUpgradeWarehouse();
                    }}
                />
            ) : null}
        </Section>
    );
};

interface GoodRowProps {
    goodId: GoodId;
    name: string;
    price: number;
    fair: number;
    owned: number;
    cash: number;
    freeSpace: number;
    space: number;
    locked: boolean;
    highlighted: boolean;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
}

const GoodRow = ({goodId, name, price, owned, cash, freeSpace, space, locked, highlighted, onBuy, onSell}: GoodRowProps) => {
    const [qty, setQty] = useState(0);
    const cost = price * qty;
    const needSpace = space * qty;
    const maxBuy = price > 0 ? Math.min(Math.floor(cash / price), Math.floor(freeSpace / Math.max(1, space)), 999) : 0;
    const halfBuy = Math.floor(maxBuy / 2);
    const quarterBuy = Math.floor(maxBuy / 4);
    const threeQuarterBuy = Math.floor((maxBuy * 3) / 4);
    const canBuy = !locked && qty > 0 && price > 0 && cash >= cost && needSpace <= freeSpace;
    const canSell = !locked && qty > 0 && owned >= qty;
    const Icon = GOOD_ICONS[goodId];

    const handleBuy = () => {
        onBuy(goodId, qty);
        setQty(0);
    };

    const handleSell = () => {
        onSell(goodId, qty);
        setQty(0);
    };

    return (
        <li id={`good-${goodId}`} className={`rounded-2xl border-2 p-3 ${highlighted ? "border-(--coral) bg-[#fff7ed] shadow-[3px_3px_0_var(--border)]" : "border-(--border) bg-[#fffdf8]"}`}>
            <div className="mb-3 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-(--accent) shadow-[2px_2px_0_var(--border)]" aria-hidden="true">
                    <Icon className="size-6" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-base font-black" style={{fontFamily: "var(--font-display)"}}>
                            {name}
                        </h4>
                    </div>
                    <p className="mt-0.5 text-sm font-black tabular-nums">{formatMoney(price)}</p>
                    <p className="text-xs font-bold text-(--muted)">持倉 {owned}</p>
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                    <Button size="sm" variant="ghost" disabled={locked || maxBuy < 1} className="w-auto! px-2!" onClick={() => setQty(quarterBuy)}>
                        1/4 倉
                    </Button>
                    <Button size="sm" variant="ghost" disabled={locked || halfBuy < 1} className="w-auto! px-2!" onClick={() => setQty(halfBuy)}>
                        1/2倉
                    </Button>
                    <Button size="sm" variant="ghost" disabled={locked || maxBuy < 1} className="w-auto! px-2!" onClick={() => setQty(threeQuarterBuy)}>
                        3/4 倉
                    </Button>
                    <Button size="sm" variant="ghost" disabled={locked || maxBuy < 1} className="w-auto! px-2!" onClick={() => setQty(maxBuy)}>
                        全倉
                    </Button>
                    {owned > 0 ? (
                        <Button size="sm" variant="ghost" disabled={locked} className="w-auto! px-2!" onClick={() => setQty(owned)}>
                            持倉
                        </Button>
                    ) : null}
                </div>

                <QuantityInput id={`qty-${goodId}`} label={`${name} 數量`} value={qty} onChange={setQty} min={0} max={999} disabled={locked} />

                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="secondary" disabled={!canBuy} onClick={handleBuy}>
                        買
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!canSell} onClick={handleSell}>
                        賣
                    </Button>
                </div>
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
};
