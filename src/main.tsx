import {StrictMode} from "react";
import {createRoot} from "react-dom/client";
import {registerSW} from "virtual:pwa-register";
import {App} from "./app";
import "./index.css";

registerSW({
    immediate: true,
    onNeedRefresh() {
        // New service worker ready — force clients onto the latest build.
        window.location.reload();
    },
});

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>
);
