/// <reference types="vitest/config" />
import path from "node:path";
import {fileURLToPath} from "node:url";
import {defineConfig} from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {VitePWA} from "vite-plugin-pwa";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: "autoUpdate",
            // Manual register in main.tsx so we can force reload on new SW.
            injectRegister: false,
            includeAssets: ["favicon.svg", "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/icon.svg"],
            manifest: {
                name: "一億小目標",
                short_name: "一億小目標",
                description: "20 歲起步，60 歲前賺夠 $100,000,000 嘅惡搞 Cartoon 模擬經營遊戲。",
                lang: "zh-Hant-HK",
                dir: "ltr",
                start_url: "/",
                scope: "/",
                display: "standalone",
                orientation: "portrait",
                background_color: "#fff8e7",
                theme_color: "#fff8e7",
                categories: ["games", "entertainment"],
                icons: [
                    {
                        src: "icons/icon-192.png",
                        sizes: "192x192",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any",
                    },
                    {
                        src: "icons/icon-512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "maskable",
                    },
                ],
            },
            workbox: {
                // Offline app shell only — game state stays in memory / not persisted.
                navigateFallback: "/index.html",
                globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest,json}"],
                runtimeCaching: [
                    {
                        urlPattern: ({request}) => request.mode === "navigate",
                        handler: "NetworkFirst",
                        options: {
                            cacheName: "asmg-pages",
                            networkTimeoutSeconds: 3,
                        },
                    },
                ],
            },
            devOptions: {
                enabled: false,
            },
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(rootDir, "src"),
        },
    },
    test: {
        environment: "node",
        include: ["src/**/*.test.ts"],
    },
});
