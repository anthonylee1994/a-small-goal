/** Nested-modal open counter so toasts can wait until overlays close. */

type Listener = () => void;

let openCount = 0;
const listeners = new Set<Listener>();

function emit(): void {
    for (const listener of listeners) listener();
}

export function isAnyModalOpen(): boolean {
    return openCount > 0;
}

export function subscribeModalPresence(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

/** Call on modal mount; returns disposer for unmount. */
export function registerModalOpen(): () => void {
    openCount += 1;
    emit();
    return () => {
        openCount = Math.max(0, openCount - 1);
        emit();
    };
}
