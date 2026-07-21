import {useEffect, type ReactNode} from "react";
import {createPortal} from "react-dom";

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
 */
export const Modal = ({children, onClose, labelledBy, closeLabel = "關閉", className = ""}: Props) => {
    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [onClose]);

    if (typeof document === "undefined") return null;

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
            <button type="button" className="modal-dimmer absolute inset-0 z-0 border-0 bg-black/45" aria-label={closeLabel} onClick={onClose} />

            <section
                className={`modal-panel relative z-10 w-full max-w-md rounded-2xl border-4 border-(--border) bg-white p-5 text-left shadow-[6px_6px_0_var(--border)] ${className}`}
                onClick={event => event.stopPropagation()}
            >
                {children}
            </section>
        </div>,
        document.body
    );
};
