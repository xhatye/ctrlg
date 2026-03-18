import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2015",
    // Code splitting — recharts only loaded when needed
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase — large library, separate chunk
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
          // Recharts — only used in ProgressScreen
          charts: ["recharts"],
        },
      },
    },
    // Raise chunk size warning limit (we know firebase is big)
    chunkSizeWarningLimit: 800,
  },
  // Faster HMR in dev
  server: {
    hmr: true,
  },
});