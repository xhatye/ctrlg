import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), {
    name: 'local-annal-reader',
    configureServer(server) {
      // The same fixed-catalogue handler as production, only mounted by Vite in dev.
      server.middlewares.use('/api/annal-file', async (req,res) => {
        const {annalFileHandler}=await import('./lib/annal-file.mjs');
        res.status=n=>{res.statusCode=n;return res;};
        res.json=value=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(value));};
        res.send=value=>res.end(value);
        await annalFileHandler(req,res);
      });
    },
  }],
  build: {
    manifest: true,
    target: "es2022",
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
