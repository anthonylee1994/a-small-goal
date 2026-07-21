import type {BirthFamilyDef} from "@/types/game";
import {formatMoney} from "@/game/format";
import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";
import {BIRTH_FAMILY_ICONS} from "@/ui/icons";

interface Props {
    family: BirthFamilyDef;
    onDismiss: () => void;
}

const FAMILY_BLURB: Record<BirthFamilyDef["id"], string> = {
    low_class: "袋冇幾多銀，不過至少仲有雙手同野心。",
    middle_class: "唔算大富大貴，起步比人穩陣少少。",
    high_class: "屋企有本錢，不過一億小目標仍然要靠自己。",
};

export const BirthRevealModal = ({family, onDismiss}: Props) => {
    const Icon = BIRTH_FAMILY_ICONS[family.id];

    return (
        <Modal onClose={onDismiss} labelledBy="birth-reveal-title" closeLabel="開始人生">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-(--border) bg-(--accent) shadow-[4px_4px_0_var(--border)]" aria-hidden="true">
                <Icon className="size-12" strokeWidth={2.25} />
            </div>
            <h2 id="birth-reveal-title" className="text-center text-2xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                你而家係一名{family.name}
            </h2>
            <p className="mt-3 text-center text-sm leading-relaxed text-(--muted)">{FAMILY_BLURB[family.id]}</p>

            <div className="mt-4 rounded-xl border-2 border-(--border) bg-(--bg) px-4 py-3 text-center">
                <p className="text-xs font-bold text-(--muted)">起步資金</p>
                <p className="text-2xl font-black text-(--ink)">{formatMoney(family.startingCash)}</p>
            </div>

            <div className="mt-5">
                <Button onClick={onDismiss}>開始人生</Button>
            </div>
        </Modal>
    );
};
