import { dirname } from "path"
import { fileURLToPath } from "url"
import { FlatCompat } from "@eslint/eslintrc"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname
})

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "plugin:prettier/recommended"),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module"
      }
    },
    plugins: {
      "simple-import-sort": compat.plugin("simple-import-sort"),
      "@typescript-eslint": compat.plugin("@typescript-eslint"),
      prettier: compat.plugin("prettier")
    },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/display-name": "off",
      "react/prop-types": "off",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": "off",
      "@typescript-eslint/indent": "off",
      "@typescript-eslint/member-delimiter-style": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/ban-ts-comment": "off",
      "simple-import-sort/imports": "warn",
      "simple-import-sort/exports": "warn",
      "react-hooks/exhaustive-deps": ["warn", {
        additionalHooks: "(useIsomorphicLayoutEffect)"
      }],
      "react/no-unescaped-entities": "off",
      curly: ["error", "multi-line"],
      "react/jsx-no-target-blank": [2, {
        allowReferrer: true
      }],
      "@typescript-eslint/no-unused-vars": [2, {
        argsIgnorePattern: "^_"
      }],
      "no-console": [1, {
        allow: ["warn", "error"]
      }],
      "prettier/prettier": ["warn", {
        endOfLine: "auto"
      }],
      "@typescript-eslint/explicit-module-boundary-types": "off"
    }
  }
]

export default eslintConfig
