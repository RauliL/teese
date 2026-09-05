import js from "@eslint/js";
import formatjs from "eslint-plugin-formatjs";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["src/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, formatjs },
    extends: ["js/recommended"],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
]);
