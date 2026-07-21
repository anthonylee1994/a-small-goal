import {Button} from "@/components/Button";
import {Modal} from "@/components/Modal";
import {ConfirmDangerIcon, ConfirmHelpIcon} from "@/ui/icons";

interface Props {
    title: string;
    message: string;
    confirmLabel?: string;
    /** 傳 `null` 就淨係顯示確認掣（用嚟做提示 popup） */
    cancelLabel?: string | null;
    danger?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmModal = ({title, message, confirmLabel = "確定", cancelLabel = "取消", danger = false, onConfirm, onCancel}: Props) => {
    const Icon = danger ? ConfirmDangerIcon : ConfirmHelpIcon;
    const showCancel = cancelLabel != null;

    return (
        <Modal onClose={onCancel} labelledBy="confirm-modal-title" closeLabel={showCancel ? cancelLabel : confirmLabel}>
            <div className="mb-3 flex items-center gap-3">
                <div
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-4 border-(--border) shadow-[3px_3px_0_var(--border)] ${
                        danger ? "bg-[#ffe4e6]" : "bg-(--accent)"
                    }`}
                    aria-hidden="true"
                >
                    <Icon className="size-7" strokeWidth={2.5} />
                </div>
                <h2 id="confirm-modal-title" className="text-xl font-black leading-tight" style={{fontFamily: "var(--font-display)"}}>
                    {title}
                </h2>
            </div>

            <p className="text-sm leading-relaxed text-(--muted)">{message}</p>

            <div className={`mt-5 gap-2 ${showCancel ? "grid grid-cols-2" : ""}`}>
                {showCancel ? (
                    <Button variant="ghost" onClick={onCancel}>
                        {cancelLabel}
                    </Button>
                ) : null}
                <Button variant={danger ? "danger" : "primary"} onClick={onConfirm}>
                    {confirmLabel}
                </Button>
            </div>
        </Modal>
    );
};
