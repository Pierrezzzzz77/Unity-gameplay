import { defineConfig } from "vite";

// Host usado pelo `tauri dev` em dispositivos móveis (Android/iOS).
const host = process.env.TAURI_DEV_HOST;

export default defineConfig({
  // Mantém os erros do Rust visíveis no terminal do `tauri dev`
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host ? { protocol: "ws", host, port: 1421 } : undefined,
    watch: { ignored: ["**/src-tauri/**"] },
  },
  envPrefix: ["VITE_", "TAURI_ENV_*"],
  build: {
    // WebView2 (Windows) é Chromium; WebKitGTK/WKWebView equivalem a Safari 15+
    target: process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari15",
    minify: process.env.TAURI_ENV_DEBUG ? false : "esbuild",
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
