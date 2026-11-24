import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  globalIgnores(["dist", "coverage", "playwright-report", "test-results"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.strict, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: { globals: globals.browser },
    rules: {
      // `any` is banned; justify exceptions with an eslint-disable comment explaining why.
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true }],
      // UI components must not talk to the network directly — go through src/services + TanStack Query.
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "axios", message: "Import the API client from @/api/client instead (only src/api and src/services may use axios)." },
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "Use a service in src/services through TanStack Query instead of fetch." },
      ],
    },
  },
  {
    // shadcn/ui files export variants next to components
    files: ["src/components/ui/**/*.tsx"],
    rules: { "react-refresh/only-export-components": "off" },
  },
  {
    files: ["src/api/**/*.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  {
    files: ["*.config.ts", "e2e/**/*.ts"],
    languageOptions: { globals: globals.node },
  },
  prettier,
]);
