import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";
import verdict from "./eslint-rules/index.mjs";

/**
 * The design system's own constraints, as errors.
 *
 * A rule that warns is a rule that is off.
 */
export default tseslint.config(
  { ignores: ["node_modules/**", "storybook-static/**", "src/styles/tokens.css"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx,mjs}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y, verdict },
    rules: {
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.flatConfigs.recommended.rules,

      "no-new-func": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      "jsx-a11y/no-static-element-interactions": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-noninteractive-element-interactions": "error",

      // The three that encode this system's own architecture. See
      // eslint-rules/ for what each one is for and why it is worth a build.
      "verdict/no-raw-hex": ["error", { allow: ["src/lib/tokens.ts"] }],
      "verdict/no-primitive-token-in-component": [
        "error",
        { allow: ["src/lib/tokens.ts"] },
      ],
      "verdict/no-handler-on-non-interactive": "error",
    },
  },

  {
    files: ["scripts/**/*.mjs", "eslint-rules/**/*.mjs", "*.mjs"],
    languageOptions: { globals: globals.node },
  },

  /**
   * Jest loads its own config through require, before any ESM loader exists, so
   * this one file is CommonJS by requirement rather than by preference.
   */
  {
    files: ["test-runner-jest.config.js"],
    languageOptions: { globals: globals.node, sourceType: "commonjs" },
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },

  /**
   * The rule fixtures are deliberately full of violations. That is what they
   * are: each one is a rule being shown catching the thing it claims to catch.
   * Linting them would be the rules reporting on their own test cases.
   */
  {
    files: ["eslint-rules/__tests__/**"],
    rules: {
      "verdict/no-raw-hex": "off",
      "verdict/no-primitive-token-in-component": "off",
      "verdict/no-handler-on-non-interactive": "off",
    },
  }
);
