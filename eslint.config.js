import eslint from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";
import eslintPluginPrettier from "eslint-plugin-prettier";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "dist/**", "public/**"],
  },

  eslint.configs.recommended,

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

  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unused-vars": "warn",
      "no-unused-vars": "off",
    },
  },

  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: await import("vue-eslint-parser"),
      parserOptions: {
        ecmaVersion: "latest",
        extraFileExtensions: [".vue"],
        parser: tsParser,
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
      vue: (await import("eslint-plugin-vue")).default,
    },
    rules: {
      "vue/component-name-in-template-casing": ["error", "PascalCase"],
      "vue/html-closing-bracket-newline": ["error", { multiline: "never", singleline: "never" }],
      "vue/html-self-closing": ["error", { html: { void: "always" } }],
      "vue/max-attributes-per-line": ["error", { singleline: 3 }],
      "vue/multi-word-component-names": "off",
    },
  },

  {
    plugins: {
      prettier: eslintPluginPrettier,
    },
    rules: {
      "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    },
  },

  {
    plugins: {
      perfectionist,
    },
    rules: {
      ...perfectionist.configs["recommended-alphabetical"].rules,
    },
  },

  {
    rules: {
      "linebreak-style": ["error", "unix"],
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
];
