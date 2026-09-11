// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";
import { loadEnv } from "vite";
import path from "node:path";

// Server routes (e.g. /lovable/email/*) need non-VITE_ env vars in process.env.
const serverEnv = loadEnv(process.env["NODE_ENV"] ?? "development", process.cwd(), "");
Object.assign(process.env, serverEnv);

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      alias: {
        "entities/lib/decode.js": path.resolve(
          import.meta.dirname,
          "node_modules/entities/lib/decode.js",
        ),
        "entities/lib/encode.js": path.resolve(
          import.meta.dirname,
          "node_modules/entities/lib/encode.js",
        ),
        entities: path.resolve(import.meta.dirname, "node_modules/entities"),
      },
    },
    plugins: [
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: null,
        devOptions: { enabled: false },
        manifest: {
          name: "Notifica-MA Intelligence",
          short_name: "Notifica-MA",
          description:
            "Sistema de notificação de agravos em saúde — Maranhão",
          theme_color: "#0b1320",
          background_color: "#0b1320",
          display: "standalone",
          start_url: "/",
          scope: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-maskable-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
          navigateFallback: "/",
          navigateFallbackDenylist: [/^\/api\//, /^\/_/, /^\/~oauth/],
          runtimeCaching: [
            {
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" &&
                url.origin === self.location.origin &&
                !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "app-pages",
                networkTimeoutSeconds: 5,
              },
            },
            {
              urlPattern: ({ request, url }) =>
                url.origin === self.location.origin &&
                /-[A-Za-z0-9_-]{8,}\.(?:js|css)$/.test(url.pathname) &&
                (request.destination === "script" || request.destination === "style"),
              handler: "CacheFirst",
              options: {
                cacheName: "hashed-assets",
                expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              // Supabase REST/RPC — usar cache de leitura como fallback offline
              urlPattern: /https:\/\/.*\.supabase\.co\/(rest|storage)\/.*/i,
              handler: "NetworkFirst",
              options: {
                cacheName: "supabase-api",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
              },
            },
          ],
        },
      }),
    ],
  },
});
