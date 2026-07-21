import type {ReactNode} from "react";

interface Props {
    title: string;
    emoji: string;
    accent?: "accent" | "mint" | "sky" | "coral";
    action?: ReactNode;
    children: ReactNode;
}

const ACCENT = {
    accent: "bg-(--accent)",
    mint: "bg-(--mint)",
    sky: "bg-(--sky)",
    coral: "bg-(--coral) text-white",
} as const;

export function Section({title, emoji, accent = "accent", action, children}: Props) {
    return (
        <section className="overflow-hidden rounded-2xl border-4 border-(--border) bg-white shadow-[4px_4px_0_var(--border)]">
            <header className={`flex items-center justify-between gap-2 border-b-4 border-(--border) px-4 py-3 ${ACCENT[accent]}`}>
                <h3 className="flex items-center gap-2 text-base font-black tracking-tight" style={{fontFamily: "var(--font-display)"}}>
                    <span aria-hidden="true">{emoji}</span>
                    {title}
                </h3>
                {action}
            </header>
            <div className="p-3">{children}</div>
        </section>
    );
}
