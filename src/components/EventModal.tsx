import React from "react";
import type {EventChoice, EventDef, EventEffect, GoodId} from "@/types/game";
import {playEventModal} from "@/audio/sfx";
import {GOOD_MAP} from "@/data/goods";
import {formatEventEffectLabel} from "@/game/engine";
import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";
import {EVENT_ICONS, GOOD_ICONS} from "@/ui/icons";

interface Props {
    event: EventDef;
    /** True while player still must pick a branch. */
    pending: boolean;
    /** Already-chosen branch when re-opening the panel. */
    selectedChoiceId?: string | null;
    onChoose: (choiceId: string) => void;
    onDismiss: () => void;
    onJumpToMarket?: (goodId: GoodId) => void;
}

export const EventModal = ({event, pending, selectedChoiceId, onChoose, onDismiss, onJumpToMarket}: Props) => {
    const Icon = EVENT_ICONS[event.id];
    const selected = selectedChoiceId ? (event.choices.find(c => c.id === selectedChoiceId) ?? null) : null;
    const previewEffects = selected?.effects ?? [];
    const priceGoods = previewEffects.filter((e): e is Extract<EventEffect, {type: "price_mult"}> => e.type === "price_mult");

    React.useEffect(() => {
        playEventModal();
    }, [event.id]);

    const handleJump = (goodId: GoodId) => {
        onJumpToMarket?.(goodId);
        onDismiss();
    };

    // Force a real choice — backdrop / Esc must not skip while pending.
    const handleClose = () => {
        if (pending) return;
        onDismiss();
    };

    return (
        <Modal onClose={handleClose} labelledBy="event-modal-title" closeLabel={pending ? "請先選擇" : "關閉事件"}>
            <div className="comic-burst mb-3 flex items-center gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border-4 border-(--border) bg-(--accent) shadow-[4px_4px_0_var(--border)]" aria-hidden="true">
                    <Icon className="size-8" strokeWidth={2.25} />
                </div>
                <div>
                    <p className="text-xs font-black tracking-wide text-(--coral) md:text-base">{pending ? "人生總會有抉擇" : "本年事件 · 已抉擇"}</p>
                    <h2 id="event-modal-title" className="text-2xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                        {event.title}
                    </h2>
                </div>
            </div>

            <p className="text-sm md:text-base leading-relaxed text-(--muted)">{event.message}</p>

            {pending ? (
                <React.Fragment>
                    <div className="mt-2 space-y-2">
                        {event.choices.map(choice => (
                            <ChoiceButton key={choice.id} choice={choice} onChoose={() => onChoose(choice.id)} />
                        ))}
                    </div>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    {selected ? (
                        <div className="mt-4 rounded-xl border-2 border-(--border) bg-(--accent)/30 px-3 py-2">
                            <p className="text-xs font-black text-(--coral) md:text-sm">你揀咗</p>
                            <p className="text-sm font-black md:text-base">{selected.label}</p>
                        </div>
                    ) : null}

                    <ul className="mt-3 space-y-1 rounded-xl border-2 border-(--border) bg-(--bg) px-3 py-2 text-sm md:text-base font-bold">
                        {previewEffects.length === 0 ? <li>冇特別影響</li> : previewEffects.map((effect, index) => <li key={`${effect.type}-${index}`}>{effectLabel(effect)}</li>)}
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
                            關閉
                        </Button>
                    </div>
                </React.Fragment>
            )}
        </Modal>
    );
};

function ChoiceButton({choice, onChoose}: {choice: EventChoice; onChoose: () => void}) {
    return (
        <button
            type="button"
            onClick={onChoose}
            className="w-full rounded-xl border-2 border-(--border) bg-white px-3 py-2.5 text-left shadow-[3px_3px_0_var(--border)] transition-[transform,box-shadow] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
            <p className="text-sm font-black md:text-base">{choice.label}</p>
        </button>
    );
}

function effectLabel(effect: EventEffect): string {
    return formatEventEffectLabel(effect);
}
