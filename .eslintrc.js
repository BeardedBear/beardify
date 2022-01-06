module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "plugin:vue/vue3-recommended",
    "eslint:recommended",
    "@vue/typescript/recommended",
    "plugin:@typescript-eslint/recommended",
    "@vue/prettier",
    "@vue/eslint-config-prettier",
  ],
  parserOptions: {
    ecmaVersion: 2021,
  },
  rules: {
    "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "vue/no-v-html": "off",
    "prettier/prettier": ["error", {}, { usePrettierrc: true }],
    "no-unused-vars": "off",
    "vue/script-setup-uses-vars": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "vue/no-unused-properties": [
      "warn",
      {
        groups: ["props", "setup"],
        deepData: true,
      },
    ],
  },
};
