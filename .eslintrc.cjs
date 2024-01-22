require("@rushstack/eslint-patch/modern-module-resolution");

module.exports = {
  root: true,
  // ESLint ignores dot files by default, we need to exclude them.
  // https://github.com/eslint/eslint/issues/12348#issuecomment-536946429
  ignorePatterns: [".*.cjs", "**/*.json", "node_modules", "dist"],
  extends: [
    "@vue/eslint-config-airbnb-with-typescript",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:typescript-sort-keys/recommended",
    "plugin:vue/vue3-strongly-recommended",
    "@vue/eslint-config-prettier",
  ],
  plugins: [
    "vue",
    "import",
    "simple-import-sort",
    "sort-keys-fix",
    "@typescript-eslint",
  ],
  parser: "vue-eslint-parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    parser: "@typescript-eslint/parser",
    project: [
      "./tsconfig.json",
      "./src/tsconfig.json",
      "./views/tsconfig.json",
    ],
  },
  rules: {
    "vue/multi-word-component-names": "off",
    "vue/no-reserved-component-names": "off",
    "vue/mustache-interpolation-spacing": ["error", "always"],
    "vue/prop-name-casing": "error",
    "vue/require-default-prop": "error",
    "vue/require-prop-types": "error",
    "vue/attributes-order": "error",

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
    "no-empty": ["error", { allowEmptyCatch: true }],

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

    // replaced rules
    "no-useless-constructor": "off",
    "@typescript-eslint/no-useless-constructor": "error",

    "no-shadow": "off",
    "@typescript-eslint/no-shadow": ["error", { allow: ["state"] }],

    "sort-keys": "off",
    "sort-keys-fix/sort-keys-fix": "warn",

    "sort-imports": "off",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/no-unresolved": "error",

    // additional rules
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": [
      "error",
      {
        fixStyle: "inline-type-imports",
        disallowTypeAnnotations: false,
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

    "@typescript-eslint/explicit-function-return-type": [
      "error",
      { allowExpressions: true },
    ],

    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-unused-vars": "error",
  },
  overrides: [
    {
      files: ["./vite.config.ts", "./vitest.config.ts", "./tailwind.config.js"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
      },
    },
  ],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts", ".tsx"],
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true, // always try to resolve types under `<root>@types` directory even it doesn't contain any source code, like `@types/unist`
        project: [
          "./tsconfig.json",
          "./src/tsconfig.json",
          "./views/tsconfig.json",
        ],
      },
    },
  },
};
