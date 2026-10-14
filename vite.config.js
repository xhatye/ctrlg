import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    target: "es2015",
    // Keep the Firebase client separate from the learning UI.
    rollupOptions: {
      output: {
        manualChunks: {
          // Firebase — large library, separate chunk
          firebase: [
            "firebase/app",
            "firebase/auth",
            "firebase/firestore",
          ],
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
