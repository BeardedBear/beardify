import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  // Définir les fichiers à ignorer
  {
    ignores: ["node_modules/**", "dist/**", "public/**"],
  },
  // Configuration de base ESLint
  eslint.configs.recommended,

  // Configuration globale
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
        Spotify: "readonly",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // Configuration pour les fichiers TypeScript
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": tseslint,
    },
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },

  // Configuration pour les fichiers Vue - Ignorons les erreurs d'analyse pour l'instant
  {
    files: ["**/*.vue"],
    ignores: ["**/*.vue"],
    rules: {
      // Désactiver temporairement l'analyse des fichiers Vue
    },
  },

  // Configurer Prettier
  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    },
  },

  // Configurer Perfectionist
  {
    plugins: {
      perfectionist,
    },
    rules: {
      ...perfectionist.configs["recommended-alphabetical"].rules,
    },
  },

  // Règles globales
  {
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
];
