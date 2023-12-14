module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json",
    sourceType: "module",
  },
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    "eslint:all",
    "plugin:@typescript-eslint/all",
    "plugin:typescript-sort-keys/recommended",
    "prettier",
    "plugin:vue/essential",
  ],
  ignorePatterns: ["node_modules/", "dist/", "*.js"],
  plugins: [
    "@typescript-eslint",
    "simple-import-sort",
    "import",
    "sort-keys-fix",
    "vue",
  ],
  rules: {
    // disabled rules (required)
    "no-void": "off", // To call promise functions without other actions
    "no-magic-numbers": "off", // This will wrongly detect a number passed to a function as a magic number
    "@typescript-eslint/no-magic-numbers": "off",
    "new-cap": "off", // The decorators will be wrongly detected
    "class-methods-use-this": "off", // some methods are not using this
    "require-await": "off", // it will wrongly detect async methods as not having await
    "@typescript-eslint/require-await": "off",
    "max-params": "off", // injection constructors need many parameters
    "multiline-comment-style": "off", // may disrupt the code when temparary comments are used
    "capitalized-comments": "off", // may disrupt the code when temparary comments are used

    // disabled rules (optional, in personal preference)
    "no-console": "off", // This will disable console.log, console.error, etc. This could be removed if we have our own logger
    "one-var": "off", // in favor to not merge variables to one
    "no-continue": "off", // in favor to use continue

    // disabled typescript-eslint rules (too strict)
    "@typescript-eslint/promise-function-async": "off",
    "@typescript-eslint/explicit-member-accessibility": "off",
    "@typescript-eslint/prefer-readonly-parameter-types": "off",
    "@typescript-eslint/parameter-properties": "off",
    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/member-ordering": "off",
    "@typescript-eslint/no-type-alias": "off",
    "@typescript-eslint/unbound-method": "off",
    "@typescript-eslint/strict-boolean-expressions": "off",
    "@typescript-eslint/prefer-nullish-coalescing": "off",
    "no-undefined": "off",

    // modified rules
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],

    // replaced rules
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",

    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "error",

    "sort-keys": "off",
    "sort-keys-fix/sort-keys-fix": "warn",

    "sort-imports": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",

    // additional rules
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        fixStyle: "inline-type-imports",
      },
    ],

    "padding-line-between-statements": [
      "error",
      { blankLine: "always", prev: "*", next: "return" },
      {
        blankLine: "always",
        prev: ["const", "let", "var", "multiline-expression"],
        next: "*",
      },
      {
        blankLine: "any",
        prev: ["const", "let", "var"],
        next: ["const", "let", "var"],
      },
    ],
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
  },
};
