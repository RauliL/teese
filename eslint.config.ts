import js from "@eslint/js";
import formatjs from "eslint-plugin-formatjs";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

const srcFiles = ["src/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"];
const reactFiles = ["src/**/*.{jsx,tsx}"];

export default defineConfig([
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },
  {
    files: srcFiles,
    plugins: { js, formatjs },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  ...tseslint.configs.recommended.map((config) => ({
    ...config,
    files: srcFiles,
  })),
  {
    files: reactFiles,
    ...pluginReact.configs.flat.recommended,
  },
]);
