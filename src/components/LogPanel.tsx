import type {LogEntry} from "../types/game";

interface Props {
    entries: LogEntry[];
    limit?: number;
}

const TONE_STYLES: Record<LogEntry["tone"], {dot: string; chip: string; label: string}> = {
    info: {
        dot: "bg-(--sky)",
        chip: "bg-[#e8f6ff] text-[#0b6ea8]",
        label: "訊息",
    },
    good: {
        dot: "bg-(--mint)",
        chip: "bg-[#e7fff5] text-[#0f7a52]",
        label: "好消息",
    },
    bad: {
        dot: "bg-(--coral)",
        chip: "bg-[#ffe8e4] text-[#b42318]",
        label: "衰咗",
    },
    event: {
        dot: "bg-(--accent)",
        chip: "bg-[#fff6c7] text-[#8a6a00]",
        label: "事件",
    },
};

export function LogPanel({entries, limit = 8}: Props) {
    const visible = entries.slice(0, limit);

    return (
        <section className="overflow-hidden rounded-2xl border-4 border-(--border) bg-white shadow-[4px_4px_0_var(--border)]">
            <header className="flex items-center justify-between gap-2 border-b-4 border-(--border) bg-(--accent) px-4 py-3">
                <h3 className="text-base font-black tracking-tight text-(--ink)" style={{fontFamily: "var(--font-display)"}}>
                    最近事件
                </h3>
                <span className="rounded-full border-2 border-(--border) bg-white px-2 py-0.5 text-[10px] font-black">
                    {visible.length}/{limit}
                </span>
            </header>

            {visible.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-(--muted)">暫時未有紀錄。開始玩啦！</p>
            ) : (
                <ul className="max-h-64 divide-y-2 divide-(--border) overflow-y-auto">
                    {visible.map((entry, index) => {
                        const tone = TONE_STYLES[entry.tone];
                        return (
                            <li key={entry.id} className={`flex gap-3 px-4 py-3 text-left ${index === 0 ? "bg-[#fffdf5]" : "bg-white"}`}>
                                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-(--border) ${tone.dot}`} aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                                        <span className="rounded-md border-2 border-(--border) bg-(--bg) px-1.5 py-0.5 text-[10px] font-black text-(--ink)">{entry.age}歲</span>
                                        <span className={`rounded-md border-2 border-(--border) px-1.5 py-0.5 text-[10px] font-black ${tone.chip}`}>{tone.label}</span>
                                    </div>
                                    <p className="text-sm leading-snug font-medium wrap-break-word text-(--ink)">{entry.text}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
