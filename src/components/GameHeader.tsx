import {useState} from "react";
import {Button} from "@/components/Button";
import {ConfirmModal} from "@/components/ConfirmModal";
import {SoundEffectToggle} from "@/components/SoundEffectToggle";
import {START_AGE} from "@/game/constants";
import {getEndAge} from "@/game/engine";
import {BIRTH_FAMILY_MAP} from "@/data/birthFamilies";
import type {GameState} from "@/types/game";
import {BrandIcon, DeathIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    onSuicide: () => void;
}

const PHASE_LABEL: Record<GameState["phase"], string> = {
    title: "標題",
    event: "事件中",
    playing: "操作中",
    dead: "猝死",
    retired: "退休",
};

export const GameHeader = ({state, onSuicide}: Props) => {
    const [confirmSuicide, setConfirmSuicide] = useState(false);
    const family = state.birthFamilyId ? BIRTH_FAMILY_MAP[state.birthFamilyId] : null;
    const endAge = getEndAge(state);
    const progress = Math.min(1, Math.max(0, (state.age - START_AGE) / Math.max(1, endAge - START_AGE)));

    return (
        <>
            <header className="rounded-2xl border-4 border-(--border) bg-(--panel) p-4 shadow-[4px_4px_0_var(--border)]">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl font-black leading-none sm:text-2xl" style={{fontFamily: "var(--font-display)"}}>
                                一億小目標
                            </h1>
                            <SoundEffectToggle />
                        </div>
                        <p className="mt-2 text-xs font-bold text-(--muted) md:text-base">
                            {family ? `出生：${family.name}` : "人生進行中"}
                            {" · "}
                            {PHASE_LABEL[state.phase]}
                        </p>
                    </div>
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-(--border) bg-(--accent) shadow-[3px_3px_0_var(--border)]" aria-hidden="true">
                        <BrandIcon className="size-7" strokeWidth={2.5} />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[11px] md:text-base font-black">
                        <span>
                            {state.age} 歲 / {endAge} 歲退休
                        </span>
                        <span>{Math.round(progress * 100)}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full border-2 border-(--border) bg-white">
                        <div
                            className="h-full bg-(--coral) transition-[width] duration-300"
                            style={{width: `${progress * 100}%`}}
                            role="progressbar"
                            aria-valuenow={state.age}
                            aria-valuemin={START_AGE}
                            aria-valuemax={endAge}
                            aria-label="年齡進度"
                        />
                    </div>
                </div>

                <div className="mt-3">
                    <Button variant="ghost" size="sm" className="w-full gap-1.5 text-(--danger) md:min-h-12 md:py-3 md:text-lg" onClick={() => setConfirmSuicide(true)}>
                        <DeathIcon className="size-4 md:size-5" strokeWidth={2.5} aria-hidden="true" />
                        重新投胎
                    </Button>
                </div>
            </header>

            {confirmSuicide ? (
                <ConfirmModal
                    title="確定重新投胎？"
                    message="呢一世就此結束，會先睇結算，之後先可以重新投胎。"
                    confirmLabel="重新投胎"
                    cancelLabel="再忍忍"
                    danger
                    onCancel={() => setConfirmSuicide(false)}
                    onConfirm={() => {
                        setConfirmSuicide(false);
                        onSuicide();
                    }}
                />
            ) : null}
        </>
    );
};
