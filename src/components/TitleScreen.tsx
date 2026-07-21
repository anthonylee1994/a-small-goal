interface Props {
    onStart: () => void;
}

export const TitleScreen = ({onStart}: Props) => {
    return (
        <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-8 p-10 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-4xl border-4 border-(--border) bg-(--accent) shadow-[6px_6px_0_var(--border)]" aria-hidden="true">
                <span className="text-7xl leading-none">💰</span>
            </div>

            <div className="space-y-3">
                <h1 className="text-4xl font-black leading-none tracking-tight" style={{fontFamily: "var(--font-display)"}}>
                    一億小目標
                </h1>
                <p className="text-center text-base leading-relaxed text-(--muted)">20 歲起步，40 年內靠炒賣、創業同家庭選擇，目標喺 60 歲前累積至少一億。</p>
            </div>

            <div
                onClick={onStart}
                className="cursor-pointer rounded-2xl border-4 border-(--border) bg-(--coral) px-6 py-3 text-xl font-black text-white shadow-[4px_4px_0_var(--border)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            >
                開始遊戲
            </div>
        </main>
    );
};
