// @ts-check
const eslint = require("@eslint/js");
const tseslint = require("typescript-eslint");
const prettier = require("eslint-config-prettier/flat");

// Flat config, ported from the old .eslintrc when this plugin moved to ESLint
// 10 (which no longer reads .eslintrc at all). Same rules as before; the ignore
// list now lives here rather than in a separate .eslintignore, which flat config
// also dropped.
module.exports = tseslint.config(
  {
    ignores: [".github/", "dist/", "node_modules/", "tools/", "test/"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    // Scoped to TypeScript only: the type-aware rules need a file to be part of
    // the TypeScript project, and this config file itself is not.
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "dot-notation": "off",
      eqeqeq: "warn",
      curly: ["warn", "all"],
      "prefer-arrow-callback": ["warn"],
      "max-len": ["warn", 140],
      // use the provided Homebridge log method instead
      "no-console": ["error"],
      "lines-between-class-members": [
        "warn",
        "always",
        { exceptAfterSingleLine: true },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",

      // ⚠️ These four are OFF deliberately, not by accident.
      //
      // typescript-eslint v8 enables them in the presets above; v6, which this
      // plugin used until the 2026-07-30 toolchain update, did not. Between
      // them they flag 21 places in code that has not otherwise changed.
      //
      // They were left off rather than fixed in the same change as a
      // dependency bump: `prefer-optional-chain` and `prefer-nullish-coalescing`
      // alter evaluation (`||` and `??` do not agree on `0` or `""`), so a
      // regression from one of those would be very hard to tell apart from a
      // regression caused by the new axios or TypeScript. `no-unsafe-enum-comparison`
      // fires only on switches over HomeKit characteristic constants, which are
      // correct as written.
      //
      // Worth turning on one at a time as its own change, with the behaviour
      // checked each time.
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-unused-expressions": "off",
    },
  },
  {
    // This file is CommonJS and is not part of the TypeScript project, so the
    // type-aware rules cannot run against it and `require`/`module`/`__dirname`
    // are legal rather than undefined.
    files: ["**/*.js"],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      sourceType: "commonjs",
      globals: {
        require: "readonly",
        module: "writable",
        __dirname: "readonly",
      },
    },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "@typescript-eslint/no-require-imports": "off",
    },
  },
  // Must stay last: turns off everything that would fight Prettier.
  prettier,
);
