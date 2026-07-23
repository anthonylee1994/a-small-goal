import {useEffect, useRef, useState, type ComponentType} from "react";
import {COMPANY_MAP} from "@/data/companies";
import {COMPANY_COLLAPSE_GRACE_YEARS, COMPANY_TOTAL_SHARES} from "@/game/constants";
import {formatMoney} from "@/game/format";
import {getCompanyOptions} from "@/game/engine";
import type {CompanyTypeId, GameState} from "@/types/game";
import {Button} from "@/components/Button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {QuantityInput} from "@/components/QuantityInput";
import {Section} from "@/components/Section";
import {COMPANY_ICONS, CompanySectionIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onFound: (companyId: CompanyTypeId) => void;
    onBuyShares: (companyId: CompanyTypeId, shares: number) => void;
    onSellShares: (companyId: CompanyTypeId, shares: number) => void;
}

interface FoundNotice {
    title: string;
    message: string;
    danger: boolean;
}

export const CompanyPanel = ({state, locked, onFound, onBuyShares, onSellShares}: Props) => {
    const [pendingCompanyId, setPendingCompanyId] = useState<CompanyTypeId | null>(null);
    const [foundNotice, setFoundNotice] = useState<FoundNotice | null>(null);
    const expectFoundId = useRef<CompanyTypeId | null>(null);
    const options = getCompanyOptions(state);
    const ownedCount = state.companies.length;
    const pending = pendingCompanyId ? options.find(c => c.id === pendingCompanyId) : null;

    useEffect(() => {
        const companyId = expectFoundId.current;
        if (!companyId) return;
        expectFoundId.current = null;

        const def = COMPANY_MAP[companyId];
        const name = def?.name ?? companyId;
        const owned = state.companies.some(c => c.typeId === companyId);
        const latest = state.log[0]?.text;

        if (owned) {
            setFoundNotice({
                title: "創業成功！",
                message: latest && latest.includes(name) ? latest : `成功創立${name}！持有 ${COMPANY_TOTAL_SHARES} 股（100%）。`,
                danger: false,
            });
            return;
        }

        setFoundNotice({
            title: "創業失敗",
            message: latest && (latest.includes("失敗") || latest.includes(name) || latest.includes("錢唔夠") || latest.includes("名聲")) ? latest : `開${name}失敗，再試多次或者先去賺錢／抬名聲。`,
            danger: true,
        });
    }, [state.companies, state.log, state.cash, state.reputation, state.companyFoundAttempts]);

    return (
        <Section
            title="創業帝國"
            icon={CompanySectionIcon}
            accent="mint"
            action={<span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] md:text-base font-black text-(--ink)">持有 {ownedCount}</span>}
        >
            {ownedCount === 0 ? (
                <p className="mb-3 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) px-3 py-2 text-center text-xs font-bold text-(--muted) md:text-base">
                    未開過公司。開業後持有 100 股（100%），可以喺股市增持／減持；年收同維護跟持股比例計。
                </p>
            ) : (
                <p className="mb-3 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-center text-[11px] md:text-base font-bold text-(--muted)">
                    股價每年浮動。沽清 100% 即退出該業務；收入／維護按持股 % 結算。
                </p>
            )}

            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {options.map(company => {
                    const Icon = COMPANY_ICONS[company.id];
                    const collapsePct = Math.round(company.annualCollapseChance * 100);

                    if (company.owned) {
                        return (
                            <OwnedCompanyRow
                                key={company.id}
                                companyId={company.id}
                                name={company.name}
                                sharePrice={company.sharePrice}
                                ownedShares={company.ownedShares}
                                roomToBuy={company.roomToBuy}
                                holdingValue={company.holdingValue}
                                costBasis={company.ownedCostBasis}
                                unrealizedPnl={company.unrealizedPnl}
                                annualIncome={company.annualIncome}
                                maintenance={company.maintenance}
                                inGrace={company.inGrace}
                                graceYearsLeft={company.graceYearsLeft}
                                collapsePct={collapsePct}
                                cash={state.cash}
                                locked={locked}
                                onBuyShares={onBuyShares}
                                onSellShares={onSellShares}
                                Icon={Icon}
                            />
                        );
                    }

                    const blocked = locked || !company.canAfford || !company.repOk;
                    const reasons: string[] = [];
                    if (!company.canAfford) reasons.push(`要 ${formatMoney(company.cost)}`);
                    if (!company.repOk) reasons.push(`名聲 ≥ ${company.minReputation}`);
                    // Founding IPO: market cap = investment (no instant flip).
                    const foundingSharePrice = Math.max(1, Math.round(company.cost / COMPANY_TOTAL_SHARES));

                    return (
                        <li key={company.id} className="flex flex-col rounded-2xl border-2 border-(--border) bg-[#f4fff9] p-3 md:p-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]"
                                    aria-hidden="true"
                                >
                                    <Icon className="size-6" strokeWidth={2.25} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="truncate text-base font-black leading-tight md:text-lg" style={{fontFamily: "var(--font-display)"}}>
                                        {company.name}
                                    </h4>
                                    <p className="mt-1 text-lg font-black leading-none tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                                        {formatMoney(company.cost)}
                                        <span className="ml-1 text-[10px] font-bold text-(--muted) md:text-sm">投資</span>
                                    </p>
                                </div>
                                <span className="shrink-0 rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black tabular-nums text-(--ink) md:text-sm">
                                    倒閉 {collapsePct}%
                                </span>
                            </div>

                            <div className="mt-3 grid grid-cols-3 gap-1.5 md:gap-2">
                                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2 py-2">
                                    <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">年收</p>
                                    <p className="mt-0.5 text-xs font-black leading-tight tabular-nums md:text-sm">{formatMoney(company.annualIncome)}</p>
                                </div>
                                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2 py-2">
                                    <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">維護</p>
                                    <p className="mt-0.5 text-xs font-black leading-tight tabular-nums md:text-sm">{formatMoney(company.maintenance)}</p>
                                </div>
                                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2 py-2">
                                    <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">目標估值</p>
                                    <p className="mt-0.5 text-xs font-black leading-tight tabular-nums md:text-sm">{formatMoney(company.valuation)}</p>
                                </div>
                            </div>

                            <p className="mt-4 mb-1 text-center text-[11px] font-bold leading-snug text-(--muted) md:text-sm">
                                開業 {COMPANY_TOTAL_SHARES} 股 · 開業股價 {formatMoney(foundingSharePrice)}/股
                            </p>

                            <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
                                <Button size="sm" variant="secondary" disabled={blocked} className="w-full!" onClick={() => setPendingCompanyId(company.id)}>
                                    創業
                                </Button>
                                {reasons.length > 0 ? <p className="text-center text-[11px] font-bold text-(--muted) md:text-sm">{reasons.join(" · ")}</p> : null}
                            </div>
                        </li>
                    );
                })}
            </ul>

            {pending ? (
                <ConfirmModal
                    title={`開「${pending.name}」？`}
                    message={`投資 ${formatMoney(pending.cost)}，開業後持有 100% 股份（${COMPANY_TOTAL_SHARES} 股），當刻市值等於投資額。股價年結先會浮動。第一次創業保底成功；之後失敗退一半。窮撚首次創業有折扣。開業後 ${COMPANY_COLLAPSE_GRACE_YEARS} 年內唔會倒閉。`}
                    confirmLabel="創業"
                    cancelLabel="取消"
                    danger
                    onCancel={() => setPendingCompanyId(null)}
                    onConfirm={() => {
                        const id = pending.id;
                        expectFoundId.current = id;
                        setPendingCompanyId(null);
                        onFound(id);
                    }}
                />
            ) : null}

            {foundNotice ? (
                <ConfirmModal
                    title={foundNotice.title}
                    message={foundNotice.message}
                    confirmLabel="知道喇"
                    cancelLabel={null}
                    danger={foundNotice.danger}
                    onCancel={() => setFoundNotice(null)}
                    onConfirm={() => setFoundNotice(null)}
                />
            ) : null}
        </Section>
    );
};

interface OwnedCompanyRowProps {
    companyId: CompanyTypeId;
    name: string;
    sharePrice: number;
    ownedShares: number;
    roomToBuy: number;
    holdingValue: number;
    costBasis: number;
    unrealizedPnl: number;
    annualIncome: number;
    maintenance: number;
    inGrace: boolean | null;
    graceYearsLeft: number | null;
    collapsePct: number;
    cash: number;
    locked: boolean;
    onBuyShares: (companyId: CompanyTypeId, shares: number) => void;
    onSellShares: (companyId: CompanyTypeId, shares: number) => void;
    Icon: ComponentType<{className?: string; strokeWidth?: number}>;
}

const OwnedCompanyRow = ({
    companyId,
    name,
    sharePrice,
    ownedShares,
    roomToBuy,
    holdingValue,
    costBasis,
    unrealizedPnl,
    annualIncome,
    maintenance,
    inGrace,
    graceYearsLeft,
    collapsePct,
    cash,
    locked,
    onBuyShares,
    onSellShares,
    Icon,
}: OwnedCompanyRowProps) => {
    const [qty, setQty] = useState(0);
    const maxBuy = sharePrice > 0 ? Math.min(roomToBuy, Math.floor(cash / sharePrice), COMPANY_TOTAL_SHARES) : 0;
    const maxSell = ownedShares;
    const tradeCost = sharePrice * qty;
    const canBuy = !locked && qty > 0 && qty <= maxBuy && cash >= tradeCost;
    const canSell = !locked && qty > 0 && qty <= maxSell;
    const stakeIncome = Math.round((annualIncome * ownedShares) / COMPANY_TOTAL_SHARES);
    const stakeMaint = Math.round((maintenance * ownedShares) / COMPANY_TOTAL_SHARES);
    const pnlTone = unrealizedPnl > 0 ? "text-(--success)" : unrealizedPnl < 0 ? "text-(--danger)" : "text-(--muted)";
    const unitCost = ownedShares > 0 ? Math.round(costBasis / ownedShares) : 0;

    const handleBuy = () => {
        onBuyShares(companyId, qty);
        setQty(0);
    };

    const handleSell = () => {
        onSellShares(companyId, qty);
        setQty(0);
    };

    return (
        <li className="rounded-2xl border-2 border-(--border) bg-[#f4fff9] p-3">
            <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]" aria-hidden="true">
                    <Icon className="size-6" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <h4 className="truncate text-base md:text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                            {name}
                        </h4>
                        <span className="shrink-0 rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] md:text-base font-black tabular-nums">{ownedShares}%</span>
                    </div>
                    <p className="mt-1 text-lg font-black leading-none tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                        {formatMoney(sharePrice)}
                        <span className="ml-1 text-[10px] md:text-base font-bold text-(--muted)">/股</span>
                    </p>
                    <p className="mt-1 text-[11px] md:text-base font-bold text-(--muted)">
                        年收份額 {formatMoney(stakeIncome)} · 維護 {formatMoney(stakeMaint)}
                    </p>
                    <p className="mt-0.5 text-[11px] md:text-base font-black text-(--coral)">{inGrace ? `新舖保護中 · 仲有 ${graceYearsLeft} 年免倒閉` : `年結倒閉率約 ${collapsePct}%`}</p>
                </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                    <p className="text-[10px] md:text-base font-black tracking-wide text-(--muted)">持股成本</p>
                    <p className="mt-0.5 text-sm md:text-base font-black leading-tight tabular-nums">{formatMoney(unitCost)}/股</p>
                    <p className="text-[10px] md:text-base font-bold tabular-nums text-(--muted)">共 {formatMoney(costBasis)}</p>
                </div>
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                    <p className="text-[10px] md:text-base font-black tracking-wide text-(--muted)">浮盈虧</p>
                    <p className={`mt-0.5 text-sm md:text-base font-black leading-tight tabular-nums ${pnlTone}`}>
                        {unrealizedPnl >= 0 ? "+" : ""}
                        {formatMoney(unrealizedPnl)}
                    </p>
                    <p className="text-[10px] md:text-base font-bold tabular-nums text-(--muted)">市值 {formatMoney(holdingValue)}</p>
                </div>
            </div>

            <div className="mt-3 space-y-2 border-t-2 border-dashed border-(--border) pt-3">
                <div className="grid grid-cols-4 gap-1.5">
                    <ShareChip label="1/4" disabled={locked || Math.floor(maxBuy / 4) < 1} active={qty === Math.floor(maxBuy / 4) && maxBuy >= 4} onClick={() => setQty(Math.floor(maxBuy / 4))} />
                    <ShareChip label="1/2" disabled={locked || Math.floor(maxBuy / 2) < 1} active={qty === Math.floor(maxBuy / 2) && maxBuy >= 2} onClick={() => setQty(Math.floor(maxBuy / 2))} />
                    <ShareChip label="可買" disabled={locked || maxBuy < 1} active={qty === maxBuy && maxBuy > 0} onClick={() => setQty(maxBuy)} />
                    <ShareChip label="全沽" disabled={locked || maxSell < 1} active={qty === maxSell && maxSell > 0} onClick={() => setQty(maxSell)} />
                </div>

                <QuantityInput id={`shares-${companyId}`} label={`${name} 股數`} value={qty} onChange={setQty} min={0} max={COMPANY_TOTAL_SHARES} disabled={locked} />

                {!locked && qty > 0 ? (
                    <p className="text-center text-[11px] md:text-base font-bold tabular-nums text-(--muted)">
                        {qty <= maxSell ? `沽出約 ${formatMoney(sharePrice * qty)}` : `增持約 ${formatMoney(tradeCost)}`}
                        {qty > roomToBuy && qty > maxSell ? " · 超出可買上限" : ""}
                        {qty > maxSell && cash < tradeCost ? " · 錢唔夠" : ""}
                    </p>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                    <Button size="sm" variant="secondary" disabled={!canBuy} onClick={handleBuy}>
                        買入股份
                    </Button>
                    <Button size="sm" variant="ghost" disabled={!canSell} onClick={handleSell}>
                        賣出股份
                    </Button>
                </div>
                <p className="text-center text-[10px] md:text-base font-bold text-(--muted)">
                    可增持 {roomToBuy} 股 · 可沽 {maxSell} 股
                </p>
            </div>
        </li>
    );
};

interface ShareChipProps {
    label: string;
    disabled: boolean;
    active?: boolean;
    onClick: () => void;
}

const ShareChip = ({label, disabled, active = false, onClick}: ShareChipProps) => (
    <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`min-h-9 w-full rounded-lg border-2 border-(--border) px-1 text-[11px] md:text-base font-black tabular-nums disabled:cursor-not-allowed disabled:opacity-35 ${
            active ? "bg-(--accent) text-(--ink)" : "bg-white text-(--ink) active:enabled:bg-(--bg)"
        }`}
    >
        {label}
    </button>
);
