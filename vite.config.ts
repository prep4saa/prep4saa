import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // 벤더 묶음: 초기 JS 페이로드를 줄여 LCP/TTI 개선
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("scheduler")) return "vendor-react";
            if (id.includes("firebase")) return "vendor-firebase";
            if (id.includes("html2pdf") || id.includes("html2canvas") || id.includes("jspdf")) return "vendor-pdf";
            return "vendor";
          }
          // 큰 로케일 데이터 분리
          if (id.includes("/src/locales/") || id.includes("/src/CONCEPTS_") || id.includes("/src/concepts_")) {
            return "locales";
          }
        },
      },
    },
  },
  server: {
    open: true,
    port: 3000,
    host: "localhost",
    hmr: {
      protocol: "ws",
      host: "localhost",
      port: 3000,
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
