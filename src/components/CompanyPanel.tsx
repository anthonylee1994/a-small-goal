import {useState} from "react";
import {formatMoney} from "@/game/format";
import {getCompanyOptions} from "@/game/engine";
import type {CompanyTypeId, GameState} from "@/types/game";
import {Button} from "@/components/Button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {Section} from "@/components/Section";
import {COMPANY_ICONS, CompanySectionIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onFound: (companyId: CompanyTypeId) => void;
}

export function CompanyPanel({state, locked, onFound}: Props) {
    const [pendingCompanyId, setPendingCompanyId] = useState<CompanyTypeId | null>(null);
    const options = getCompanyOptions(state);
    const ownedCount = state.companies.length;
    const pending = pendingCompanyId ? options.find(c => c.id === pendingCompanyId) : null;

    return (
        <Section
            title="創業帝國"
            icon={CompanySectionIcon}
            accent="mint"
            action={<span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black text-(--ink)">持有 {ownedCount}</span>}
        >
            {ownedCount === 0 ? (
                <p className="mb-3 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) px-3 py-2 text-center text-xs font-bold text-(--muted)">未開過公司。開業有風險，失敗都會扣錢。</p>
            ) : null}

            <ul className="space-y-3">
                {options.map(company => {
                    const blocked = locked || company.owned || !company.canAfford || !company.repOk;
                    const reasons: string[] = [];
                    if (company.owned) reasons.push("已擁有");
                    if (!company.canAfford) reasons.push(`要 ${formatMoney(company.cost)}`);
                    if (!company.repOk) reasons.push(`名聲 ≥ ${company.minReputation}`);
                    const Icon = COMPANY_ICONS[company.id];

                    return (
                        <li key={company.id} className="rounded-2xl border-2 border-(--border) bg-[#f4fff9] p-3">
                            <div className="mb-2 flex items-start gap-3">
                                <div
                                    className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]"
                                    aria-hidden="true"
                                >
                                    <Icon className="size-6" strokeWidth={2.25} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-base font-black" style={{fontFamily: "var(--font-display)"}}>
                                        {company.name}
                                    </h4>
                                    <p className="mt-0.5 text-sm font-black tabular-nums">{formatMoney(company.cost)}</p>
                                    <p className="text-[11px] font-bold leading-snug text-(--muted)">
                                        年收 {formatMoney(company.annualIncome)} · 維護 {formatMoney(company.maintenance)} · 估值 {formatMoney(company.valuation)}
                                    </p>
                                </div>
                            </div>

                            <Button
                                size="sm"
                                variant={company.owned ? "ghost" : "secondary"}
                                disabled={blocked}
                                onClick={() => setPendingCompanyId(company.id)}
                            >
                                {company.owned ? "已開業" : "創業"}
                            </Button>
                            {reasons.length > 0 && !company.owned ? <p className="mt-2 text-[11px] font-bold text-(--muted)">{reasons.join(" · ")}</p> : null}
                        </li>
                    );
                })}
            </ul>

            {pending ? (
                <ConfirmModal
                    title={`開「${pending.name}」？`}
                    message={`投資 ${formatMoney(pending.cost)}。失敗都會蝕晒籌備費。`}
                    confirmLabel="創業"
                    cancelLabel="取消"
                    danger
                    onCancel={() => setPendingCompanyId(null)}
                    onConfirm={() => {
                        const id = pending.id;
                        setPendingCompanyId(null);
                        onFound(id);
                    }}
                />
            ) : null}
        </Section>
    );
}
