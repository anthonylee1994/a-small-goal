import type {ReactNode} from "react";

interface Props {
    children: ReactNode;
    onClose: () => void;
    labelledBy?: string;
    closeLabel?: string;
    className?: string;
}

export const Modal = ({children, onClose, labelledBy, closeLabel = "關閉", className = ""}: Props) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-labelledby={labelledBy}>
            <button type="button" className="modal-dimmer absolute inset-0 border-0 bg-black/45" aria-label={closeLabel} onClick={onClose} />

            <section className={`modal-panel relative z-10 w-full max-w-md rounded-2xl border-4 border-(--border) bg-white p-5 text-left shadow-[6px_6px_0_var(--border)] ${className}`}>
                {children}
            </section>
        </div>
    );
};
