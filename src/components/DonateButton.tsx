import {useState} from "react";
import {formatMoney} from "@/game/format";
import {getDonateFee, getDonateReputationGain} from "@/game/engine";
import type {GameState} from "@/types/game";
import {ConfirmModal} from "@/components/ConfirmModal";
import {DonateIcon} from "@/ui/icons";

interface Props {
    state: GameState;
    locked: boolean;
    onDonate: () => void;
}

export const DonateButton = ({state, locked, onDonate}: Props) => {
    const [confirmDonate, setConfirmDonate] = useState(false);
    const [donateNotice, setDonateNotice] = useState<string | null>(null);
    const donateFee = getDonateFee(state);
    const repGain = getDonateReputationGain(state);

    const handleClick = () => {
        if (locked) return;
        if (repGain <= 0) {
            setDonateNotice("名聲已經滿分，慈善機構話你夠晒光環。");
            return;
        }
        if (state.cash < donateFee) {
            setDonateNotice(`今次捐款要 ${formatMoney(donateFee)}，你錢唔夠。`);
            return;
        }
        setConfirmDonate(true);
    };

    return (
        <>
            <button
                type="button"
                disabled={locked}
                onClick={handleClick}
                aria-label={`捐款，收費 ${formatMoney(donateFee)}，名聲 +${repGain}`}
                title={locked ? "而家唔可以捐款" : `捐款 · ${formatMoney(donateFee)} · 名聲 +${repGain}`}
                className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg border-2 border-(--border) bg-white text-(--coral) shadow-[2px_2px_0_var(--border)] transition-[transform,box-shadow] enabled:active:translate-x-px enabled:active:translate-y-px enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
                <DonateIcon className="size-3.5" strokeWidth={2.5} aria-hidden="true" />
            </button>

            {confirmDonate ? (
                <ConfirmModal
                    title="捐款做公益？"
                    message={`今次捐 ${formatMoney(donateFee)}，名聲 +${repGain}。`}
                    confirmLabel="捐出"
                    cancelLabel="下次先"
                    onCancel={() => setConfirmDonate(false)}
                    onConfirm={() => {
                        setConfirmDonate(false);
                        onDonate();
                    }}
                />
            ) : null}

            {donateNotice ? (
                <ConfirmModal title="捐唔成" message={donateNotice} confirmLabel="知道喇" cancelLabel={null} onCancel={() => setDonateNotice(null)} onConfirm={() => setDonateNotice(null)} />
            ) : null}
        </>
    );
};
