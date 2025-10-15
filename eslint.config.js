import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  { ignores: ["node_modules/", "dist/", "build/", "coverage/", "**/*.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
];
