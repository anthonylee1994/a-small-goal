import React from "react";
import type {EventDef, GoodId} from "@/types/game";
import {playEventModal} from "@/audio/sfx";
import {GOOD_MAP} from "@/data/goods";
import {formatMoney} from "@/game/format";
import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";
import {EVENT_ICONS, GOOD_ICONS} from "@/ui/icons";

interface Props {
    event: EventDef;
    onDismiss: () => void;
    onJumpToMarket?: (goodId: GoodId) => void;
}

export const EventModal = ({event, onDismiss, onJumpToMarket}: Props) => {
    const Icon = EVENT_ICONS[event.id];
    const priceGoods = event.effects.filter((e): e is Extract<EventDef["effects"][number], {type: "price_mult"}> => e.type === "price_mult");

    React.useEffect(() => {
        playEventModal();
    }, [event.id]);

    const handleJump = (goodId: GoodId) => {
        onJumpToMarket?.(goodId);
        onDismiss();
    };

    return (
        <Modal onClose={onDismiss} labelledBy="event-modal-title" closeLabel="關閉事件">
            <div className="comic-burst mb-3 flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-4 border-(--border) bg-(--accent) shadow-[4px_4px_0_var(--border)]" aria-hidden="true">
                    <Icon className="size-8" strokeWidth={2.25} />
                </div>
                <div>
                    <p className="text-xs font-black tracking-wide text-(--coral) md:text-base">啪！今年突發事件</p>
                    <h2 id="event-modal-title" className="text-2xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                        {event.title}
                    </h2>
                </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-(--muted)">{event.message}</p>

            <ul className="mt-4 space-y-1 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-sm md:text-base font-bold">
                {event.effects.length === 0 ? <li>冇特別影響</li> : event.effects.map((effect, index) => <li key={`${effect.type}-${index}`}>{effectLabel(effect)}</li>)}
            </ul>

            {priceGoods.length > 0 ? (
                <div className="mt-3 space-y-2">
                    <p className="text-xs font-black text-(--muted) md:text-base">受影響商品 · 撳掣去市場</p>
                    <div className="flex flex-wrap gap-2">
                        {priceGoods.map(effect => {
                            const GoodIcon = GOOD_ICONS[effect.goodId];
                            const name = GOOD_MAP[effect.goodId]?.name ?? effect.goodId;
                            return (
                                <Button key={effect.goodId} size="sm" variant="ghost" className="w-auto! gap-1.5 px-2!" onClick={() => handleJump(effect.goodId)}>
                                    <GoodIcon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
                                    {name}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            ) : null}

            <div className="mt-5">
                <Button variant="secondary" onClick={onDismiss}>
                    關閉事件
                </Button>
            </div>
        </Modal>
    );
};

function effectLabel(effect: EventDef["effects"][number]): string {
    switch (effect.type) {
        case "price_mult": {
            const name = GOOD_MAP[effect.goodId]?.name ?? effect.goodId;
            return `${name} 價格 ×${effect.mult}`;
        }
        case "cash":
            return effect.amount >= 0 ? `現金 +${formatMoney(effect.amount)}` : `現金 ${formatMoney(effect.amount)}`;
        case "health":
            return `健康 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`;
        case "reputation":
            return `名聲 ${effect.amount >= 0 ? "+" : ""}${effect.amount}`;
    }
}
