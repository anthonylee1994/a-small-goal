import {useEffect, useRef, useState} from "react";
import type {LogEntry} from "@/types/game";

interface Props {
    latest: LogEntry | undefined;
}

const TONE_BG: Record<LogEntry["tone"], string> = {
    info: "bg-(--sky)",
    good: "bg-(--mint)",
    bad: "bg-(--coral)",
    event: "bg-(--accent)",
};

const SHOW_MS = 2200;
const FADE_MS = 280;

export const ActionToast = ({latest}: Props) => {
    const [entry, setEntry] = useState<LogEntry | null>(null);
    const [leaving, setLeaving] = useState(false);
    const lastId = useRef<string | null>(null);
    const hideTimer = useRef<number | null>(null);
    const removeTimer = useRef<number | null>(null);

    const clearTimers = () => {
        if (hideTimer.current != null) window.clearTimeout(hideTimer.current);
        if (removeTimer.current != null) window.clearTimeout(removeTimer.current);
        hideTimer.current = null;
        removeTimer.current = null;
    };

    const dismiss = () => {
        if (!entry || leaving) return;
        setLeaving(true);
        clearTimers();
        removeTimer.current = window.setTimeout(() => {
            setEntry(null);
            setLeaving(false);
        }, FADE_MS);
    };

    useEffect(() => {
        if (!latest || latest.id === lastId.current) return;
        lastId.current = latest.id;
        clearTimers();
        setEntry(latest);
        setLeaving(false);
        hideTimer.current = window.setTimeout(() => {
            setLeaving(true);
            removeTimer.current = window.setTimeout(() => {
                setEntry(null);
                setLeaving(false);
            }, FADE_MS);
        }, SHOW_MS);
        return clearTimers;
    }, [latest]);

    if (!entry) return null;

    return (
        <div className="fixed inset-x-0 top-3 z-40 flex justify-center px-4" role="status" aria-live="polite">
            <div
                className={`action-toast flex max-w-md items-center gap-2 rounded-2xl border-4 border-(--border) px-3 py-3 text-sm font-black text-(--ink) shadow-[4px_4px_0_var(--border)] ${TONE_BG[entry.tone]} ${
                    leaving ? "action-toast-out" : ""
                }`}
            >
                <p className="min-w-0 flex-1 leading-snug">{entry.text}</p>
                <button type="button" aria-label="關閉提示" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border-2 border-(--border) bg-white" onClick={dismiss}>
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M3 3l8 8M11 3L3 11" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                    </svg>
                </button>
            </div>
        </div>
    );
};
