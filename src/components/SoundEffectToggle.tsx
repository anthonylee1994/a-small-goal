import React from "react";
import {isSfxMuted, playClick, subscribeSfx, toggleSfxMuted, unlockSfx} from "@/audio/sfx";
import {SoundOffIcon, SoundOnIcon} from "@/ui/icons";

interface Props {
    className?: string;
}

export const SoundEffectToggle = ({className = ""}: Props) => {
    const [muted, setMuted] = React.useState(() => isSfxMuted());

    React.useEffect(() => subscribeSfx(() => setMuted(isSfxMuted())), []);

    const handleClick = () => {
        void unlockSfx();
        // Play feedback while still unmuted, then apply toggle.
        if (!isSfxMuted()) playClick("ui");
        const nextMuted = toggleSfxMuted();
        setMuted(nextMuted);
        // When turning sound back on, confirm with a click.
        if (!nextMuted) playClick("ui");
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            data-sfx-skip="true"
            aria-label={muted ? "開啟音效" : "關閉音效"}
            aria-pressed={!muted}
            title={muted ? "開啟音效" : "關閉音效"}
            className={`flex size-8 shrink-0 items-center justify-center rounded-lg border-2 border-(--border) bg-white text-(--ink) shadow-[2px_2px_0_var(--border)] transition-[transform,box-shadow] active:translate-x-px active:translate-y-px active:shadow-none ${className}`}
        >
            {muted ? <SoundOffIcon className="size-3.5" strokeWidth={2.5} aria-hidden="true" /> : <SoundOnIcon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />}
        </button>
    );
};
