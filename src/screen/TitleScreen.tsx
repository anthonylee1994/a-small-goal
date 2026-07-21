import {useState} from "react";
import {Button} from "@/components/Button";

interface Props {
    onStart: (options: {easyMode: boolean}) => void;
}

export const TitleScreen = ({onStart}: Props) => {
    const [easyMode, setEasyMode] = useState(false);

    return (
        <main className="mx-auto flex w-full max-w-md flex-col justify-center gap-7 overflow-x-hidden px-5 py-10 text-center sm:px-6">
            <div className="relative mx-auto max-w-[min(100%,11rem)]">
                <div
                    className="mx-auto flex h-36 w-36 items-center justify-center rounded-4xl border-4 border-(--border) bg-(--accent) shadow-[8px_8px_0_var(--border)] sm:h-40 sm:w-40 text-8xl"
                    aria-hidden="true"
                >
                    💰
                </div>
                <span
                    className="absolute -top-2 right-0 rotate-6 rounded-xl border-2 border-(--border) bg-(--coral) px-2 py-1 text-xs font-black text-white shadow-[2px_2px_0_var(--border)]"
                    aria-hidden="true"
                >
                    啪！
                </span>
                <span
                    className="absolute -bottom-1 left-0 -rotate-6 rounded-xl border-2 border-(--border) bg-(--mint) px-2 py-1 text-xs font-black shadow-[2px_2px_0_var(--border)]"
                    aria-hidden="true"
                >
                    $1億
                </span>
            </div>

            <div className="space-y-3">
                <h1 className="text-[2rem] font-black leading-none tracking-tight sm:text-4xl" style={{fontFamily: "var(--font-display)"}}>
                    一億小目標
                </h1>
                <p className="text-sm leading-relaxed text-(--muted) sm:text-base">20 歲起步，40 年內靠炒賣、創業同家庭選擇，目標喺 60 歲前累積至少一億。</p>
            </div>

            <label className="mx-auto flex w-full max-w-xs cursor-pointer items-start gap-3 rounded-2xl border-4 border-(--border) bg-white px-4 py-3 text-left shadow-[3px_3px_0_var(--border)]">
                <input type="checkbox" className="mt-1 size-4 shrink-0 accent-(--coral)" checked={easyMode} onChange={e => setEasyMode(e.target.checked)} />
                <span>
                    <span className="block text-sm font-black">簡易模式</span>
                    <span className="mt-0.5 block text-xs font-bold text-(--muted)">健康消耗減半、負面現金事件較溫和，適合第一次玩。</span>
                </span>
            </label>

            <Button onClick={() => onStart({easyMode})}>開始遊戲</Button>
        </main>
    );
};
