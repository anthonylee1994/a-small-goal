import {useState} from "react";
import {formatMoney} from "@/game/format";
import {getDoctorFee} from "@/game/engine";
import type {GameState} from "@/types/game";
import {ConfirmModal} from "@/components/ConfirmModal";
import {HeartIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onSeeDoctor: () => void;
}

export const SeeDoctorButton = ({state, locked, onSeeDoctor}: Props) => {
    const [confirmDoctor, setConfirmDoctor] = useState(false);
    const [doctorNotice, setDoctorNotice] = useState<string | null>(null);
    const doctorFee = getDoctorFee(state);

    const handleClick = () => {
        if (locked) return;
        if (state.health >= 100) {
            setDoctorNotice("你已經好健康，醫生話唔使睇。");
            return;
        }
        if (state.cash < doctorFee) {
            setDoctorNotice(`睇醫生要 ${formatMoney(doctorFee)}，你錢唔夠。`);
            return;
        }
        setConfirmDoctor(true);
    };

    return (
        <>
            <button
                type="button"
                disabled={locked}
                onClick={handleClick}
                aria-label={`睇醫生，收費 ${formatMoney(doctorFee)}`}
                title={locked ? "而家唔可以睇醫生" : `睇醫生 · ${formatMoney(doctorFee)}`}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-(--border) bg-white text-(--danger) shadow-[2px_2px_0_var(--border)] transition-[transform,box-shadow] enabled:active:translate-x-px enabled:active:translate-y-px enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
                <HeartIcon className="size-3.5" strokeWidth={2.5} fill="currentColor" aria-hidden="true" />
            </button>

            {confirmDoctor ? (
                <ConfirmModal
                    title="睇醫生？"
                    message={`診所睇中你荷包，今次收 ${formatMoney(doctorFee)}。`}
                    confirmLabel="求診"
                    cancelLabel="下次先"
                    onCancel={() => setConfirmDoctor(false)}
                    onConfirm={() => {
                        setConfirmDoctor(false);
                        onSeeDoctor();
                    }}
                />
            ) : null}

            {doctorNotice ? (
                <ConfirmModal title="睇唔成醫生" message={doctorNotice} confirmLabel="知道喇" cancelLabel={null} onCancel={() => setDoctorNotice(null)} onConfirm={() => setDoctorNotice(null)} />
            ) : null}
        </>
    );
};
