import { defineConfig } from "oxlint";
import eslint from "oxlint-config-presets/@eslint/recommended.json" with { type: "json" };
import tsRecommended from "oxlint-config-presets/@typescript-eslint/recommended-type-checked.json" with { type: "json" };
import tsStrict from "oxlint-config-presets/@typescript-eslint/strict-type-checked.json" with { type: "json" };
import tsStylistic from "oxlint-config-presets/@typescript-eslint/stylistic-type-checked.json" with { type: "json" };

// to add
void tsStrict;
void tsStylistic;

export default defineConfig({
  plugins: ["eslint", "typescript", "oxc"],
  extends: [eslint, tsRecommended],

  options: {
    reportUnusedDisableDirectives: "error",
    typeAware: true,
  },

  rules: {
    "no-console": "error",
    "no-empty-function": "off",
    "no-unassigned-vars": "off",
    "no-unused-vars": [
      "error",
      { ignoreRestSiblings: true, varsIgnorePattern: "^_", argsIgnorePattern: "^_" },
    ],

    "typescript/no-unsafe-argument": "off",
    "typescript/no-unsafe-assignment": "off",
    "typescript/no-useless-default-assignment": "off",
    "typescript/restrict-template-expressions": "off",
    "typescript/no-unsafe-call": "off",
    "typescript/no-unsafe-member-access": "off",
    "typescript/no-unsafe-return": "off",
    "typescript/require-await": "off",
    "typescript/unbound-method": "off",
  },
});
