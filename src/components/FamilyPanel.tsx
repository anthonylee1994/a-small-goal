import React from "react";
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
    const [pendingPartnerId, setPendingPartnerId] = React.useState<PartnerId | null>(null);
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
            action={<span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black text-(--ink) md:text-base">子女 {state.children.length}</span>}
        >
            {partner && PartnerIcon ? (
                <div className="mb-3 rounded-2xl border-2 border-(--border) bg-[#ffe8e4] p-3 md:p-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]" aria-hidden="true">
                            <PartnerIcon className="size-6" strokeWidth={2.25} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-black text-(--muted) md:text-sm">你嘅伴侶</p>
                            <h4 className="text-lg font-black md:text-xl" style={{fontFamily: "var(--font-display)"}}>
                                {partner.name}
                            </h4>
                        </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                            <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">每年家用</p>
                            <p className="mt-0.5 text-sm font-black tabular-nums md:text-base">{formatMoney(partner.yearly.cash ?? 0)}</p>
                        </div>
                        <div className="rounded-xl border-2 border-(--border) bg-(--bg) px-2.5 py-2">
                            <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">每年健康</p>
                            <p className="mt-0.5 text-sm font-black tabular-nums md:text-base">
                                {partner.yearly.health != null ? `${partner.yearly.health > 0 ? "+" : ""}${partner.yearly.health}` : "—"}
                            </p>
                        </div>
                    </div>

                    {state.children.length > 0 ? (
                        <ul className="mt-3 space-y-1.5 text-xs font-bold md:text-sm">
                            {state.children.map(child => (
                                <li key={child.id} className="rounded-lg border-2 border-(--border) bg-white px-2.5 py-1.5">
                                    {child.name}
                                    {child.matured ? "（已成年）" : ` · ${child.birthAge} 歲出世`}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="mt-3 text-center text-[11px] font-bold text-(--muted) md:text-sm">未有子女。每年有機會添丁。</p>
                    )}
                </div>
            ) : (
                <React.Fragment>
                    <p className="mb-3 rounded-xl border-2 border-dashed border-(--border) bg-(--bg) px-3 py-2 text-center text-xs font-bold text-(--muted) md:text-base">
                        仲係單身。相親睇條件，結婚只得一次。
                    </p>
                    <p className="mb-3 text-center text-[11px] font-bold text-(--muted) md:text-sm">現時總資產 {formatMoney(assets)}</p>
                    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
                        {options.map(person => {
                            const blocked = locked || Boolean(person.blockedReason);
                            const Icon = PARTNER_ICONS[person.id];
                            const reqCells: {label: string; value: string}[] = [];
                            if (person.requireCash != null) reqCells.push({label: "現金", value: `≥ ${formatMoney(person.requireCash)}`});
                            if (person.requireReputation != null) reqCells.push({label: "名聲", value: `≥ ${person.requireReputation}`});
                            if (person.requireAssets != null) reqCells.push({label: "資產", value: `≥ ${formatMoney(person.requireAssets)}`});

                            const yearlyBits: string[] = [];
                            if (person.yearly.cash != null) yearlyBits.push(`家用 ${formatMoney(person.yearly.cash)}`);
                            if (person.yearly.health != null) yearlyBits.push(`健康 ${person.yearly.health > 0 ? "+" : ""}${person.yearly.health}`);
                            if (person.yearly.reputation != null) yearlyBits.push(`名聲 ${person.yearly.reputation > 0 ? "+" : ""}${person.yearly.reputation}`);

                            return (
                                <li key={person.id} className="flex flex-col rounded-2xl border-2 border-(--border) bg-[#fff8f6] p-3 md:p-4">
                                    <div className="flex items-start gap-3">
                                        <div
                                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-white shadow-[2px_2px_0_var(--border)]"
                                            aria-hidden="true"
                                        >
                                            <Icon className="size-6" strokeWidth={2.25} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-base font-black leading-tight md:text-lg" style={{fontFamily: "var(--font-display)"}}>
                                                {person.name}
                                            </h4>
                                            <p className="mt-1 text-lg font-black leading-none tabular-nums" style={{fontFamily: "var(--font-display)"}}>
                                                {formatMoney(person.weddingCost)}
                                                <span className="ml-1 text-[10px] font-bold text-(--muted) md:text-sm">婚禮</span>
                                            </p>
                                        </div>
                                    </div>

                                    {reqCells.length > 0 ? (
                                        <div className={`mt-3 grid gap-1.5 md:gap-2 ${reqCells.length === 1 ? "grid-cols-1" : reqCells.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}>
                                            {reqCells.map(cell => (
                                                <div key={cell.label} className="rounded-xl border-2 border-(--border) bg-(--bg) px-2 py-2">
                                                    <p className="text-[10px] font-black tracking-wide text-(--muted) md:text-xs">{cell.label}</p>
                                                    <p className="mt-0.5 text-xs font-black leading-tight tabular-nums md:text-sm">{cell.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : null}

                                    {yearlyBits.length > 0 ? <p className="mt-2 text-center text-[11px] font-bold leading-snug text-(--muted) md:text-sm">每年 {yearlyBits.join(" · ")}</p> : null}

                                    <div className="mt-3 flex flex-1 flex-col justify-end gap-2">
                                        <Button size="sm" variant="secondary" disabled={blocked} className="w-full!" onClick={() => setPendingPartnerId(person.id)}>
                                            相親結婚
                                        </Button>
                                        {person.blockedReason ? <p className="text-center text-[11px] font-bold text-(--muted) md:text-sm">{person.blockedReason}</p> : null}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </React.Fragment>
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
