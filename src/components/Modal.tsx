import {useEffect, type ReactNode} from "react";
import {createPortal} from "react-dom";
import {registerModalOpen} from "@/ui/modalPresence";
import {lockBodyScroll, unlockBodyScroll} from "@/ui/scrollLock";

interface Props {
    children: ReactNode;
    onClose: () => void;
    labelledBy?: string;
    closeLabel?: string;
    className?: string;
}

/**
 * Full-viewport overlay. Always portaled to document.body so parents with
 * overflow-hidden / transform (e.g. Section) cannot clip or trap the dialog.
 * Locks background scroll while open (nested modals supported).
 */
export const Modal = ({children, onClose, labelledBy, closeLabel = "關閉", className = ""}: Props) => {
    useEffect(() => registerModalOpen(), []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        lockBodyScroll();
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            unlockBodyScroll();
        };
    }, [onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-200 flex items-center justify-center overflow-hidden overscroll-none px-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
            <button type="button" className="modal-dimmer absolute inset-0 z-0 touch-none border-0 bg-black/45 backdrop-blur-xs" aria-label={closeLabel} onClick={onClose} />

            <section
                data-modal-panel
                className={`modal-panel relative z-10 max-h-[min(90dvh,40rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-2xl border-4 border-(--border) bg-white p-5 text-left shadow-[6px_6px_0_var(--border)] ${className}`}
                onClick={event => event.stopPropagation()}
            >
                {children}
            </section>
        </div>,
        document.body
    );
};
