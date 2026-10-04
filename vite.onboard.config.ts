import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "src/scripts/onboard.ts",
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "onboard.js",
      },
    },
  },
});
