module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "never"
        ],
        "no-else-return": [
            "error",
            { allowElseIf: false }
        ],
        "no-void": [
            "error"
        ],
        "no-useless-concat": [
            "error"
        ],
        "eqeqeq": [
            "error",
            "smart"
        ]
    }
};