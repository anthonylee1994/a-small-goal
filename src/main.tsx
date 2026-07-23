import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {registerSW} from "virtual:pwa-register";
import {App} from "./app";
import "./index.css";

const UPDATE_CHECK_MS = 60 * 60 * 1000;

let refreshing = false;
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });
}

registerSW({
    immediate: true,
    onNeedRefresh() {
        // New service worker ready — force clients onto the latest build.
        window.location.reload();
    },
    onRegisteredSW(_swUrl, registration) {
        if (!registration) return;

        const checkForUpdate = () => {
            void registration.update();
        };

        window.setInterval(checkForUpdate, UPDATE_CHECK_MS);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "visible") {
                checkForUpdate();
            }
        });
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
