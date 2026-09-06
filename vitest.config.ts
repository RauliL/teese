import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "happy-dom",
    env: {
      NODE_ENV: "test",
    },
    setupFiles: ["./src/frontend/test/setup.ts"],
    coverage: {
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/**/test/**"],
      provider: "v8",
      reporter: ["lcov", "text"],
    },
  },
});
