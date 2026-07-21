/** Nested-modal-safe body scroll lock (desktop + iOS Safari). */

let lockCount = 0;
let savedScrollY = 0;
let savedHtmlOverflow = "";
let savedBodyOverflow = "";
let savedBodyPosition = "";
let savedBodyTop = "";
let savedBodyWidth = "";
let savedBodyLeft = "";
let savedBodyRight = "";
let touchBlocker: ((event: TouchEvent) => void) | null = null;
let wheelBlocker: ((event: WheelEvent) => void) | null = null;

function isInsideModalPanel(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) return false;
    return Boolean(target.closest("[data-modal-panel]"));
}

function blockBackgroundScroll(event: TouchEvent | WheelEvent): void {
    if (isInsideModalPanel(event.target)) return;
    event.preventDefault();
}

export function lockBodyScroll(): void {
    if (typeof document === "undefined") return;

    lockCount += 1;
    if (lockCount > 1) return;

    const html = document.documentElement;
    const body = document.body;
    savedScrollY = window.scrollY || window.pageYOffset || 0;
    savedHtmlOverflow = html.style.overflow;
    savedBodyOverflow = body.style.overflow;
    savedBodyPosition = body.style.position;
    savedBodyTop = body.style.top;
    savedBodyWidth = body.style.width;
    savedBodyLeft = body.style.left;
    savedBodyRight = body.style.right;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${savedScrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.classList.add("modal-scroll-locked");

    touchBlocker = event => blockBackgroundScroll(event);
    wheelBlocker = event => blockBackgroundScroll(event);
    document.addEventListener("touchmove", touchBlocker, {passive: false});
    document.addEventListener("wheel", wheelBlocker, {passive: false});
}

export function unlockBodyScroll(): void {
    if (typeof document === "undefined") return;
    if (lockCount <= 0) return;

    lockCount -= 1;
    if (lockCount > 0) return;

    const html = document.documentElement;
    const body = document.body;

    if (touchBlocker) {
        document.removeEventListener("touchmove", touchBlocker);
        touchBlocker = null;
    }
    if (wheelBlocker) {
        document.removeEventListener("wheel", wheelBlocker);
        wheelBlocker = null;
    }

    html.style.overflow = savedHtmlOverflow;
    body.style.overflow = savedBodyOverflow;
    body.style.position = savedBodyPosition;
    body.style.top = savedBodyTop;
    body.style.width = savedBodyWidth;
    body.style.left = savedBodyLeft;
    body.style.right = savedBodyRight;
    body.classList.remove("modal-scroll-locked");

    window.scrollTo(0, savedScrollY);
}
