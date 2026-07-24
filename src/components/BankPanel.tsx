import {useMemo, useState} from "react";
import {compactMoney, formatMoney} from "@/game/format";
import {getAvailableLoan, getLoanInterestRate, getMaxLoan} from "@/game/engine";
import {LOAN_MIN_AMOUNT} from "@/game/constants";
import type {GameState} from "@/types/game";
import {AmountSlider} from "@/components/AmountSlider";
import {Button} from "@/components/Button";
import {Section} from "@/components/Section";
import {BankSectionIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onTakeLoan: (amount: number) => void;
    onRepayLoan: (amount: number) => void;
}

/** Round 1/2/5 × 10ⁿ step so slider options read as "nice" amounts. */
function niceStep(raw: number): number {
    if (raw <= 0) return 1;
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const norm = raw / pow;
    const nice = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
    return nice * pow;
}

/** Nice round options between min and max (both endpoints always included). */
function buildAmountOptions(min: number, max: number, slots = 10): number[] {
    const lo = Math.max(0, Math.round(min));
    const hi = Math.round(max);
    if (hi <= 0 || hi < lo) return [];
    if (hi === lo) return [hi];
    const step = niceStep((hi - lo) / slots);
    const set = new Set<number>([lo, hi]);
    for (let v = Math.ceil(lo / step) * step; v < hi; v += step) set.add(v);
    return [...set].sort((a, b) => a - b);
}

export const BankPanel = ({state, locked, onTakeLoan, onRepayLoan}: Props) => {
    const [borrowAmount, setBorrowAmount] = useState(0);
    const [repayAmount, setRepayAmount] = useState(0);

    const balance = state.loanBalance ?? 0;
    const rate = getLoanInterestRate(state.reputation);
    const maxLoan = getMaxLoan(state);
    const available = getAvailableLoan(state);
    const repayMax = Math.min(balance, state.cash);
    const yearlyInterest = balance > 0 ? Math.max(1, Math.ceil(balance * rate)) : 0;

    const borrowOptions = useMemo(() => (available >= LOAN_MIN_AMOUNT ? buildAmountOptions(LOAN_MIN_AMOUNT, available) : []), [available]);
    const repayOptions = useMemo(() => buildAmountOptions(0, repayMax).filter(v => v > 0), [repayMax]);

    const canBorrow = !locked && borrowAmount >= LOAN_MIN_AMOUNT && borrowAmount <= available;
    const canRepay = !locked && repayAmount > 0 && repayAmount <= repayMax;

    const handleBorrow = () => {
        if (!canBorrow) return;
        onTakeLoan(borrowAmount);
    };

    const handleRepay = () => {
        if (!canRepay) return;
        onRepayLoan(repayAmount);
    };

    const rateLabel = `${(rate * 100).toFixed(0)}%`;
    const rateTone = rate <= 0.07 ? "text-(--success)" : rate <= 0.1 ? "text-(--ink)" : "text-(--danger)";

    return (
        <Section title="銀行借貸" icon={BankSectionIcon} accent="coral">
            {/* Loan status */}
            <div className="mb-3 grid grid-cols-2 gap-2 text-xs font-bold md:text-base">
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] md:text-base font-black tracking-wide text-(--muted)">欠款</p>
                    <p className={`mt-0.5 text-sm md:text-base font-black tabular-nums ${balance > 0 ? "text-(--danger)" : "text-(--muted)"}`}>{formatMoney(balance)}</p>
                </div>
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] md:text-base font-black tracking-wide text-(--muted)">年息</p>
                    <p className={`mt-0.5 text-sm md:text-base font-black tabular-nums ${rateTone}`}>{rateLabel}</p>
                    {yearlyInterest > 0 ? <p className="text-[10px] md:text-base font-bold tabular-nums text-(--muted)">明年約 +{formatMoney(yearlyInterest)}</p> : null}
                </div>
                <div className="col-span-2 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] md:text-base font-black tracking-wide text-(--muted)">抵押品上限（淨資產 ×50%）· 可再借 {formatMoney(available)}</p>
                    <p className="mt-0.5 text-sm md:text-base font-black tabular-nums">{formatMoney(maxLoan)}</p>
                </div>
            </div>

            {balance > 0 ? (
                <div className="mb-3 rounded-xl border-2 border-dashed border-(--danger) bg-[#fff5f5] px-3 py-2 text-[11px] md:text-base font-bold text-(--danger)">
                    利息每年複利滾大，盡快還款！名聲越高利率越低。
                </div>
            ) : null}

            {/* Borrow */}
            <div className="space-y-2 border-t-2 border-dashed border-(--border) pt-3">
                <div className="flex items-baseline justify-between">
                    <p className="text-xs md:text-base font-black text-(--muted)">借錢（最少 {compactMoney(LOAN_MIN_AMOUNT)}）</p>
                    <p className="text-lg md:text-2xl font-black tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                        {formatMoney(borrowAmount)}
                    </p>
                </div>
                <AmountSlider options={borrowOptions} onSelect={setBorrowAmount} disabled={locked} ariaLabel="借錢金額" noOptionsMessage="已經借到盡" />
                <Button size="sm" variant="secondary" disabled={!canBorrow} onClick={handleBorrow}>
                    借錢
                </Button>
            </div>

            {/* Repay */}
            {balance > 0 ? (
                <div className="mt-3 space-y-2 border-t-2 border-dashed border-(--border) pt-3">
                    <div className="flex items-baseline justify-between">
                        <p className="text-xs md:text-base font-black text-(--muted)">還款</p>
                        <p className="text-lg md:text-2xl font-black tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                            {formatMoney(repayAmount)}
                        </p>
                    </div>
                    <AmountSlider options={repayOptions} onSelect={setRepayAmount} disabled={locked} ariaLabel="還款金額" noOptionsMessage="已經還到盡" />
                    <Button size="sm" variant="secondary" disabled={!canRepay} onClick={handleRepay}>
                        還款
                    </Button>
                </div>
            ) : null}
        </Section>
    );
};
