// https://docs.expo.dev/guides/using-eslint/
import { defineConfig } from "eslint/config";

import tseslint from "typescript-eslint";

import eslint from "@eslint/js";
import stylistic from "@stylistic/eslint-plugin";
import expoConfig from "eslint-config-expo/flat.js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "prettier/prettier": [
        "error",
        {
          endOfLine: "auto",
          trailingComma: "all",
        },
      ],
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal"],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "eslint/config",
              group: "external",
              position: "before",
            },
            {
              pattern: "typescript-eslint",
              group: "external",
              position: "before",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],
      curly: ["error", "all"],
      "padding-line-between-statements": [
        "error",
        {
          blankLine: "always",
          prev: "block-like",
          next: "return",
        },
        {
          blankLine: "always",
          prev: "block-like",
          next: "*",
        },
        {
          blankLine: "always",
          prev: "multiline-expression",
          next: "*",
        },
      ],
      "@typescript-eslint/consistent-type-definitions": ["off"],
      "@typescript-eslint/no-non-null-assertion": "error",
    },
    ignores: ["dist/*"],
  },
]);
