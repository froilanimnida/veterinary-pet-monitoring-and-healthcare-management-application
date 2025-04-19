// .eslintrc.js
module.exports = {
    extends: [
        "next/core-web-vitals",
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    plugins: ["@typescript-eslint"],
    root: true,
    rules: {
        "@typescript-eslint/no-explicit-any": "warn",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
    },
    ignorePatterns: ["node_modules/", ".next/", "public/", "next.config.js"],
    overrides: [
        {
            files: ["__tests__/**/*"],
            env: {
                jest: true,
            },
        },
    ],
};
