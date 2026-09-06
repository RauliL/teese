import { defineConfig } from "vite";
import spaServer from "vite-spa-server";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [
    react(),
    spaServer({
      entry: "./src/backend/index.ts",
      port: 3000,
      serverType: "express",
      buildServer: false,
    }),
  ],
  resolve: {
    alias: {
      "@teese": "./src",
    },
  },
});
