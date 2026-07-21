import {formatMoney} from "@/game/format";
import type {TurnSummary} from "@/types/game";
import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";

interface Props {
    summary: TurnSummary;
    onDismiss: () => void;
}

export const TurnSummaryModal = ({summary, onDismiss}: Props) => {
    const cashDelta = summary.cashAfter - summary.cashBefore;
    const healthDelta = summary.healthAfter - summary.healthBefore;
    const closures = summary.closures ?? [];

    return (
        <Modal onClose={onDismiss} labelledBy="turn-summary-title" closeLabel="關閉年結">
            <p className="text-xs font-black tracking-wide text-(--coral)">年結速報</p>
            <h2 id="turn-summary-title" className="mt-1 text-2xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                {summary.age} 歲 · 結算完成
            </h2>

            {closures.length > 0 ? (
                <div className="mt-4 rounded-2xl border-4 border-(--danger) bg-[#ffe4e6] px-3 py-3 shadow-[3px_3px_0_var(--border)]" role="alert">
                    <p className="text-sm font-black text-(--danger)">公司結業通知</p>
                    <ul className="mt-2 space-y-1.5 text-xs font-bold text-(--ink)">
                        {closures.map(c => (
                            <li key={`${c.reason}-${c.typeId}`} className="rounded-xl border-2 border-(--border) bg-white px-2.5 py-2">
                                <p className="font-black">{c.name}</p>
                                <p className="mt-0.5 text-(--muted)">{c.reason === "collapse" ? `倒閉結業 · 持股 ${c.shares}% 同估值歸零` : `清盤沽清 · 已沽出持股 ${c.shares}%`}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-bold">
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] text-(--muted)">現金變化</p>
                    <p className={`tabular-nums ${cashDelta < 0 ? "text-(--danger)" : ""}`}>
                        {cashDelta >= 0 ? "+" : ""}
                        {formatMoney(cashDelta)}
                    </p>
                </div>
                <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] text-(--muted)">健康變化</p>
                    <p className="tabular-nums">
                        {healthDelta >= 0 ? "+" : ""}
                        {healthDelta}
                    </p>
                </div>
                <div className="col-span-2 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2">
                    <p className="text-[10px] text-(--muted)">公司淨收入（本回合）</p>
                    <p className="tabular-nums">{formatMoney(summary.companyNet)}</p>
                </div>
            </div>

            {summary.highlights.length > 0 ? (
                <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-xl border-2 border-(--border) bg-white px-3 py-2 text-xs font-bold">
                    {summary.highlights.map((line, i) => (
                        <li key={`${i}-${line.slice(0, 12)}`} className={line.includes("倒閉") || line.includes("清盤沽清") ? "text-(--danger)" : undefined}>
                            {line}
                        </li>
                    ))}
                </ul>
            ) : null}

            <div className="mt-5">
                <Button variant="secondary" onClick={onDismiss}>
                    繼續下一年
                </Button>
            </div>
        </Modal>
    );
};
