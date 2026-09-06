import { defineConfig } from "vite";

export default defineConfig({
  build: {
    ssr: "src/scripts/init.ts",
    outDir: "dist",
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: "init.js",
      },
    },
  },
});
