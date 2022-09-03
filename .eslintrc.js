module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    "airbnb",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
    "plugin:react/recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: "module"
  },
  plugins: ["react", "@typescript-eslint", "react-hooks", "unused-imports", "prettier"],
  settings: {
    react: {
      version: "detect"
    },
    "import/resolver": {
      typescript: {}
    }
  },
  rules: {
    "react/jsx-filename-extension": [2, { extensions: [".js", ".jsx", ".ts", ".tsx"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never"
      }
    ],
    "prettier/prettier": [
      "warn",
      {
        endOfLine: "auto",
        printWidth: 150
      }
    ],
    "no-param-reassign": "off",
    "no-use-before-define": "off",
    "import/prefer-default-export": "off",
    "react/function-component-definition": "off",
    "no-shadow": "off",
    "@typescript-eslint/no-explicit-any": ["off"],
    "jsx-a11y/label-has-associated-control": "off",
    "no-plusplus": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "react/jsx-props-no-spreading": "off",
    "react/require-default-props": "off",
    "react/display-name": "off",
    "jsx-a11y/no-static-element-interactions": "off",
    "prefer-destructuring": "off"
  }
};
