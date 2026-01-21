module.exports = {
    root: true,
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: "./tsconfig.json",
    },
    plugins: ["@typescript-eslint", "import"],
    extends: ["airbnb-base", "airbnb-typescript/base"],
    settings: {
        "import/resolver": {
            typescript: {},
        },
    },
    rules: {
        "class-methods-use-this": "off",
        "import/prefer-default-export": "off",
        "no-console": "off",
        "no-underscore-dangle": "off",
        "no-param-reassign": "off",
    },
};
