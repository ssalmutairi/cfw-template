import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    rules: {
      "indent": ["error", 2, { SwitchCase: 1 }],
      "semi": ["error", "always"],
      "quotes": ["error", "double", { avoidEscape: true }],
      "linebreak-style": 0,
      // "no-unused-vars": 0,
      // "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-unused-vars": "warn",
      "no-undef": "warn",
    },
    //ignore patterns
    ignores: ["node_modules/*", "dist/*", ".wrangler/*"],
  },
];
