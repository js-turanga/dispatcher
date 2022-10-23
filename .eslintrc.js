module.exports = {
    extends: [
        'eslint:recommended',
        "plugin:mocha/recommended"
    ],
    parserOptions: {
        "ecmaVersion": 12,
    },
    plugins: [
        'import',
        'markdown',
        'mocha'
    ],
    env: {
        'node': true,
        'es6': true 
    },
    rules: {
        'strict': 'off',
        'block-spacing': 'error',
        'comma-style': [ 'error', 'last' ],
        'curly': [ 'error', 'multi-or-nest' ],
        'func-call-spacing': [ 'error', 'never'],
        'function-call-argument-newline': [ 'error', 'never' ],
        'indent': [ 'error', 4],
        'implicit-arrow-linebreak': [ 'error', 'beside'],
        'key-spacing': [ 'error', { 'beforeColon': false }],
        'keyword-spacing': [ 'error', { 'before': true }],
        'line-comment-position': [ 'error', { 'position': 'above' }],
        'lines-between-class-members': [ 'error', 'always' ],
        'multiline-ternary': [ 'error', 'always-multiline' ],
        'nonblock-statement-body-position': [ 'error', 'below' ],
        'no-ternary': 'off',
        'no-var': 'error',
        'padding-line-between-statements': [
            'error',
            { 'blankLine': 'always', 'prev': '*', 'next': ['block','block-like','class','directive','export','function','return']},
            { 'blankLine': 'always', 'prev': '*', 'next': ['for','if','switch','try','throw','while']},
            { 'blankLine': 'always', 'prev': ['const', 'let', 'var'], 'next': '*'}
        ],
        'semi-style': [ 'error', 'last'],
        'semi-spacing': [ 'error', {'before': false, 'after': true}],
        'space-in-parens': [ 'error', 'always'],
        'space-before-blocks': [ 'error', { 'functions': "always", 'keywords': "always", 'classes': 'always' }],
        'array-bracket-spacing': [ 'error', 'always'],
        'object-curly-spacing': [ 'error', 'always'],
    },
};