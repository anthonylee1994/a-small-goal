import {getCurrentEvent} from "@/game/engine";
import type {GameState} from "@/types/game";
import {EVENT_ICONS} from "@/ui/icons";

interface Props {
    state: GameState;
    onOpen: () => void;
}

export const EventPanel = ({state, onOpen}: Props) => {
    const event = getCurrentEvent(state);
    if (!event || !state.birthRevealed) return null;
    const Icon = EVENT_ICONS[event.id];

    return (
        <button
            type="button"
            onClick={onOpen}
            className="w-full rounded-2xl border-4 border-(--border) bg-white p-3 text-left shadow-[4px_4px_0_var(--border)] transition-[transform,box-shadow] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
            <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-(--border) bg-(--accent)" aria-hidden="true">
                    <Icon className="size-6" strokeWidth={2.25} />
                </div>
                <div className="min-w-0 flex-1">
                    <p className="text-[10px] md:text-base font-black text-(--coral)">{state.phase === "event" ? "未抉擇 · 市場暫停" : "本年事件"}</p>
                    <h2 className="truncate text-base md:text-lg font-black" style={{fontFamily: "var(--font-display)"}}>
                        {event.title}
                    </h2>
                </div>
            </div>
        </button>
    );
};
