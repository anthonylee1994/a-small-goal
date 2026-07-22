import {useState} from "react";
import {formatMoney} from "@/game/format";
import {getPartnerOptions, totalAssets} from "@/game/engine";
import {PARTNER_MAP} from "@/data/partners";
import type {GameState, PartnerId} from "@/types/game";
import {Button} from "@/components/Button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {Section} from "@/components/Section";
import {FamilySectionIcon, PARTNER_ICONS} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onMarry: (partnerId: PartnerId) => void;
}

export const FamilyPanel = ({state, locked, onMarry}: Props) => {
    const [pendingPartnerId, setPendingPartnerId] = useState<PartnerId | null>(null);
    const partner = state.partnerId ? PARTNER_MAP[state.partnerId] : null;
    const PartnerIcon = partner ? PARTNER_ICONS[partner.id] : null;
    const options = getPartnerOptions(state);
    const assets = totalAssets(state);
    const pending = pendingPartnerId ? options.find(p => p.id === pendingPartnerId) : null;

    return (
        <Section
            title="家庭關係"
            icon={FamilySectionIcon}
            accent="coral"
            action={<span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] md:text-base font-black text-(--ink)">子女 {state.children.length}</span>}
        >
            {partner && PartnerIcon ? (
                <div className="mb-3 rounded-2xl border-2 border-(--border) bg-[#ffe8e4] p-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]" aria-hidden="true">
                            <PartnerIcon className="size-6" strokeWidth={2.25} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-(--muted) md:text-base">你嘅伴侶</p>
                            <h4 className="text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                                {partner.name}
                            </h4>
                        </div>
                    </div>
                    <p className="mt-2 text-[11px] md:text-base font-bold leading-snug text-(--muted)">
                        每年家用 {formatMoney(partner.yearly.cash ?? 0)}
                        {partner.yearly.health ? ` · 健康 ${partner.yearly.health > 0 ? "+" : ""}${partner.yearly.health}` : ""}
                    </p>
                    {state.children.length > 0 ? (
                        <ul className="mt-2 space-y-1 text-xs font-bold md:text-base">
                            {state.children.map(child => (
                                <li key={child.id} className="rounded-lg border border-(--border) bg-white px-2 py-1">
                                    {child.name}
                                    {child.matured ? "（已成年）" : ` · ${child.birthAge} 歲出世`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-2 text-[11px] md:text-base font-bold text-(--muted)">未有子女。每年有機會添丁。</p>
                    )}
                </div>
            ) : (
                <>
                    <p className="mb-3 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) px-3 py-2 text-center text-xs font-bold text-(--muted) md:text-base">
                        仲係單身。相親睇條件，結婚只得一次。
                    </p>
                    <p className="mb-2 text-[11px] md:text-base font-bold text-(--muted)">現時總資產 {formatMoney(assets)}</p>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {options.map(person => {
                            const blocked = locked || Boolean(person.blockedReason);
                            const Icon = PARTNER_ICONS[person.id];
                            return (
                                <li key={person.id} className="rounded-2xl border-2 border-(--border) bg-[#fff8f6] p-3">
                                    <div className="mb-2 flex items-start gap-3">
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]"
                                            aria-hidden="true"
                                        >
                                            <Icon className="size-6" strokeWidth={2.25} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-base md:text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                                                {person.name}
                                            </h4>
                                            <p className="text-sm md:text-base font-black tabular-nums">婚禮 {formatMoney(person.weddingCost)}</p>
                                            <p className="text-[11px] md:text-base font-bold leading-snug text-(--muted)">
                                                {person.requireCash != null ? `現金 ≥ ${formatMoney(person.requireCash)}` : null}
                                                {person.requireReputation != null ? ` · 名聲 ≥ ${person.requireReputation}` : null}
                                                {person.requireAssets != null ? ` · 資產 ≥ ${formatMoney(person.requireAssets)}` : null}
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="secondary" disabled={blocked} onClick={() => setPendingPartnerId(person.id)}>
                                        相親結婚
                                    </Button>
                                    {person.blockedReason ? <p className="mt-2 text-[11px] md:text-base font-bold text-(--muted)">{person.blockedReason}</p> : null}
                                </li>
                            );
                        })}
                    </ul>
                </>
            )}

            {pending ? (
                <ConfirmModal
                    title={`同「${pending.name}」結婚？`}
                    message={`婚禮費 ${formatMoney(pending.weddingCost)}。結婚只得一次。`}
                    confirmLabel="結婚"
                    cancelLabel="再諗諗"
                    danger
                    onCancel={() => setPendingPartnerId(null)}
                    onConfirm={() => {
                        const id = pending.id;
                        setPendingPartnerId(null);
                        onMarry(id);
                    }}
                />
            ) : null}
        </Section>
    );
};
