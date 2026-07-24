import React from "react";
import {startGameBgm, stopGameBgm} from "@/audio/bgm";
import {playClick, playTitleEnter} from "@/audio/sfx";
import {Button} from "@/components/Button";
import {SoundEffectToggle} from "@/components/SoundEffectToggle";

interface Props {
    onStart: (options: {easyMode: boolean}) => void;
    onOpenProsperity: () => void;
}

export const TitleScreen = ({onStart, onOpenProsperity}: Props) => {
    const [easyMode, setEasyMode] = React.useState(false);

    React.useEffect(() => {
        playTitleEnter();
        startGameBgm();
        return () => stopGameBgm();
    }, []);

    return (
        <main className="app-shell relative mx-auto flex w-full flex-col justify-center gap-7 overflow-x-hidden px-5 py-10 text-center sm:px-6 md:gap-10 md:px-8 md:py-16 lg:gap-12 lg:py-20">
            <SoundEffectToggle floating />

            <div className="screen-enter-hero relative mx-auto max-w-[min(100%,11rem)] md:max-w-[min(100%,16rem)]">
                <div
                    className="mx-auto flex h-36 w-36 items-center justify-center rounded-4xl border-4 border-(--border) bg-(--accent) text-8xl shadow-[8px_8px_0_var(--border)] sm:h-40 sm:w-40 md:h-52 md:w-52 md:text-9xl md:shadow-[10px_10px_0_var(--border)]"
                    aria-hidden="true"
                >
                    💰
                </div>
                <span
                    className="screen-enter-badge screen-enter-delay-1 absolute -top-2 right-0 rounded-xl border-2 border-(--border) bg-(--coral) px-2 py-1 text-xs font-black text-white shadow-[2px_2px_0_var(--border)] md:right-1 md:px-3 md:py-1.5 md:text-base"
                    style={{"--badge-tilt": "6deg"} as React.CSSProperties}
                    aria-hidden="true"
                >
                    小目標
                </span>
                <span
                    className="screen-enter-badge screen-enter-delay-2 absolute -bottom-1 left-0 rounded-xl border-2 border-(--border) bg-(--mint) px-2 py-1 text-xs font-black shadow-[2px_2px_0_var(--border)] md:left-1 md:px-3 md:py-1.5 md:text-base"
                    style={{"--badge-tilt": "-6deg"} as React.CSSProperties}
                    aria-hidden="true"
                >
                    $1億
                </span>
            </div>

            <div className="screen-enter screen-enter-delay-2 mx-auto max-w-xl space-y-3 md:space-y-4">
                <h1 className="text-[2rem] font-black leading-none tracking-tight sm:text-4xl md:text-5xl lg:text-6xl" style={{fontFamily: "var(--font-display)"}}>
                    一億小目標
                </h1>
                <p className="text-sm leading-relaxed text-(--muted) sm:text-base md:text-lg lg:text-xl">
                    20 歲起步，40 年內靠炒賣、創業同家庭選擇
                    <br /> 目標喺 60 歲前累積至少一億
                </p>
            </div>

            <label className="screen-enter screen-enter-delay-3 mx-auto flex w-full max-w-xs cursor-pointer items-start gap-3 rounded-2xl border-4 border-(--border) px-4 py-3 text-left shadow-[4px_4px_0_var(--border)] transition-[transform,box-shadow,background-color] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none md:max-w-md md:gap-4 md:rounded-3xl md:px-5 md:py-4 bg-white select-none">
                <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-(--coral) md:mt-1.5 md:size-5"
                    checked={easyMode}
                    onChange={e => {
                        playClick("ui");
                        setEasyMode(e.target.checked);
                    }}
                />
                <span>
                    <span className="block text-sm font-black md:text-lg">簡易模式</span>
                    <span className="mt-0.5 block text-xs font-bold text-(--muted) md:mt-1 md:text-base">健康消耗減半、負面現金事件較溫和，適合第一次玩。</span>
                </span>
            </label>

            <div className="screen-enter screen-enter-delay-4 mx-auto flex w-full max-w-md flex-col gap-3 md:max-w-lg md:gap-4">
                <Button onClick={() => onStart({easyMode})}>開始遊戲</Button>
                <Button variant="secondary" onClick={onOpenProsperity}>
                    發達之路
                </Button>
            </div>
        </main>
    );
};
