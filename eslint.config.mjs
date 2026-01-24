import globals from "globals";
import js from "@eslint/js";
import css from "@eslint/css";

export default [
  {
    files: ["**/*.{js,mjs,cjs}"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.browser,
        L: "readonly" // Dodajemy 'L' jako globalną zmienną
      },
    },
    rules: {
      "no-undef": "error",
      "no-const-assign": "error",
    },
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: {
      ...css.configs.recommended.rules,
      "css/use-baseline": "off" // Wyłączyliśmy ostrzeżenie o "baseline"
    },
  },
];