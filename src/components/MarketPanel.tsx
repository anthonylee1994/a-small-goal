import {useState} from "react";
import {GOODS} from "@/data/goods";
import {formatMoney} from "@/game/format";
import {getUsedWarehouse, getWarehouseUpgradeCost, holdingCostTotal, holdingUnitCost, holdingUnrealizedPnl} from "@/game/engine";
import {WAREHOUSE_UPGRADE_SIZE} from "@/game/constants";
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
    const upgradeCost = getWarehouseUpgradeCost(state.warehouseCapacity);
    const canUpgrade = !locked && state.cash >= upgradeCost;

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
                <div className="min-w-0">
                    <p>剩餘空間 {free} 格</p>
                    <p className="text-[10px] font-black text-(--muted)">下次擴建 {formatMoney(upgradeCost)}</p>
                </div>
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
                        owned={state.inventory[good.id] ?? 0}
                        unitCost={holdingUnitCost(state, good.id)}
                        totalCost={holdingCostTotal(state, good.id)}
                        unrealizedPnl={holdingUnrealizedPnl(state, good.id)}
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
                    message={`花 ${formatMoney(upgradeCost)} 可升級倉庫 +${WAREHOUSE_UPGRADE_SIZE} 格（${state.warehouseCapacity} → ${state.warehouseCapacity + WAREHOUSE_UPGRADE_SIZE}）。`}
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
    owned: number;
    unitCost: number;
    totalCost: number;
    unrealizedPnl: number;
    cash: number;
    freeSpace: number;
    space: number;
    locked: boolean;
    highlighted: boolean;
    onBuy: (goodId: GoodId, quantity: number) => void;
    onSell: (goodId: GoodId, quantity: number) => void;
}

interface QtyChipProps {
    label: string;
    disabled: boolean;
    active?: boolean;
    onClick: () => void;
}

const QtyChip = ({label, disabled, active = false, onClick}: QtyChipProps) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`min-h-9 w-full rounded-lg border-2 border-(--border) px-1 text-[11px] font-black tabular-nums transition-colors disabled:cursor-not-allowed disabled:opacity-35 ${
            active ? "bg-(--accent) text-(--ink)" : "bg-white text-(--ink) active:enabled:bg-(--bg)"
        }`}
    >
        {label}
    </button>
);

const GoodRow = ({goodId, name, price, owned, unitCost, totalCost, unrealizedPnl, cash, freeSpace, space, locked, highlighted, onBuy, onSell}: GoodRowProps) => {
    const [qty, setQty] = useState(0);
    const tradeCost = price * qty;
    const needSpace = space * qty;
    const maxBuy = price > 0 ? Math.min(Math.floor(cash / price), Math.floor(freeSpace / Math.max(1, space)), 999) : 0;
    const halfBuy = Math.floor(maxBuy / 2);
    const quarterBuy = Math.floor(maxBuy / 4);
    const threeQuarterBuy = Math.floor((maxBuy * 3) / 4);
    const canBuy = !locked && qty > 0 && price > 0 && cash >= tradeCost && needSpace <= freeSpace;
    const canSell = !locked && qty > 0 && owned >= qty;
    const Icon = GOOD_ICONS[goodId];
    const hasCostBasis = owned > 0 && totalCost > 0;
    const pnlTone = unrealizedPnl > 0 ? "text-(--success)" : unrealizedPnl < 0 ? "text-(--danger)" : "text-(--muted)";

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
            {/* Header: icon + name/price + holding badge */}
            <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-(--accent) shadow-[2px_2px_0_var(--border)]" aria-hidden="true">
                    <Icon className="size-6" strokeWidth={2.25} />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-base font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                            {name}
                        </h4>
                        <span
                            className={`shrink-0 rounded-full border-2 px-2 py-0.5 text-[10px] font-black tabular-nums ${
                                owned > 0 ? "border-(--border) bg-white text-(--ink)" : "border-dashed border-(--border) bg-transparent text-(--muted)"
                            }`}
                        >
                            持倉 {owned}
                        </span>
                    </div>

                    <p className="mt-1 text-lg font-black leading-none tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                        {formatMoney(price)}
                    </p>
                </div>
            </div>

            {/* Cost / P&L strip — only when holding */}
            {owned > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                        <p className="text-[10px] font-black tracking-wide text-(--muted)">成本</p>
                        {hasCostBasis ? (
                            <div>
                                <p className="mt-0.5 text-sm font-black leading-tight tabular-nums">{formatMoney(unitCost)}/件</p>
                                <p className="text-[10px] font-bold tabular-nums text-(--muted)">共 {formatMoney(totalCost)}</p>
                            </div>
                        ) : (
                            <p className="mt-0.5 text-sm font-black text-(--muted)">—</p>
                        )}
                    </div>
                    <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                        <p className="text-[10px] font-black tracking-wide text-(--muted)">浮盈虧</p>
                        <p className={`mt-0.5 text-sm font-black leading-tight tabular-nums ${pnlTone}`}>{hasCostBasis ? `${unrealizedPnl >= 0 ? "+" : ""}${formatMoney(unrealizedPnl)}` : "—"}</p>
                        <p className="text-[10px] font-bold tabular-nums text-(--muted)">市值 {formatMoney(price * owned)}</p>
                    </div>
                </div>
            ) : null}

            {/* Trade controls */}
            <div className="mt-3 space-y-2 border-t-2 border-dashed border-(--border) pt-3">
                <div className="grid grid-cols-4 gap-1.5">
                    <QtyChip label="1/4" disabled={locked || quarterBuy < 1} active={qty === quarterBuy && quarterBuy > 0} onClick={() => setQty(quarterBuy)} />
                    <QtyChip label="1/2" disabled={locked || halfBuy < 1} active={qty === halfBuy && halfBuy > 0} onClick={() => setQty(halfBuy)} />
                    <QtyChip label="3/4" disabled={locked || threeQuarterBuy < 1} active={qty === threeQuarterBuy && threeQuarterBuy > 0} onClick={() => setQty(threeQuarterBuy)} />
                    <QtyChip label="全倉" disabled={locked || maxBuy < 1} active={qty === maxBuy && maxBuy > 0} onClick={() => setQty(maxBuy)} />
                </div>

                {owned > 0 ? (
                    <button
                        type="button"
                        disabled={locked}
                        onClick={() => setQty(owned)}
                        className={`w-full min-h-9 rounded-lg border-2 border-(--border) text-[11px] font-black tabular-nums disabled:cursor-not-allowed disabled:opacity-35 ${
                            qty === owned ? "bg-(--accent) text-(--ink)" : "bg-white text-(--ink) active:enabled:bg-(--bg)"
                        }`}
                    >
                        用持倉數量（{owned}）
                    </button>
                ) : null}

                <QuantityInput id={`qty-${goodId}`} label={`${name} 數量`} value={qty} onChange={setQty} min={0} max={999} disabled={locked} />

                {!locked && qty > 0 ? (
                    <p className="text-center text-[11px] font-bold tabular-nums text-(--muted)">
                        {canSell && owned >= qty ? `賣出約 ${formatMoney(price * qty)}` : `買入約 ${formatMoney(tradeCost)}`}
                        {needSpace > freeSpace ? " · 倉庫爆滿" : ""}
                        {cash < tradeCost && qty > owned ? " · 錢唔夠" : ""}
                    </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="secondary" disabled={!canBuy} onClick={handleBuy}>
                        買
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!canSell} onClick={handleSell}>
                        賣
                    </Button>
                </div>
            </div>
        </li>
    );
};
