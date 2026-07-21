import type {EventDef} from "@/types/game";
import {GOOD_MAP} from "@/data/goods";
import {formatMoney} from "@/game/format";
import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";

interface Props {
    event: EventDef;
    onDismiss: () => void;
}

export const EventModal = ({event, onDismiss}: Props) => {
    return (
        <Modal onClose={onDismiss} labelledBy="event-modal-title" closeLabel="關閉事件">
            <p className="mb-2 text-xs font-black tracking-wide text-(--coral)">今年突發事件</p>
            <h2 id="event-modal-title" className="text-2xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                {event.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-(--muted)">{event.message}</p>

            <ul className="mt-4 space-y-1 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-sm font-bold">
                {event.effects.map((effect, index) => (
                    <li key={`${effect.type}-${index}`}>{effectLabel(effect)}</li>
                ))}
            </ul>

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
    }
}
