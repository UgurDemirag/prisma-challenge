// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts'

export default tseslint.config({
    extends: [
        eslint.configs.recommended,
        ...tseslint.configs.strict,
        ...tseslint.configs.stylistic,
    ],
    files: ['**/*.ts'],
    plugins: {
        '@stylistic/ts': stylisticTs
    },
    rules: {
        "no-var": "error",
        "no-eval": "error",
        "prefer-const": "error",
        "prefer-destructuring": "error",
        "prefer-template": "error",
        "prefer-arrow-callback": "error",
        "no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
        radix: "error",
        "@typescript-eslint/no-non-null-assertion": "error",
        "@typescript-eslint/no-explicit-any": "error",
        "@stylistic/ts/indent": ["error", "tab"],
        "@typescript-eslint/strict-boolean-expressions": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@stylistic/ts/no-trailing-spaces": "error",
        "@stylistic/ts/no-mixed-spaces-and-tabs": ["warn", "smart-tabs"],
        "@stylistic/ts/key-spacing": ["error", {
            beforeColon: false,
            afterColon: true,
            align: "colon",
        }],
        "@stylistic/ts/comma-dangle": ["error", "always-multiline"],
        "@stylistic/ts/quotes": ["error", "single"],
        "@stylistic/ts/semi": ["error", "always"],
        "@stylistic/ts/object-curly-spacing": ["error", "always"],
    },
});