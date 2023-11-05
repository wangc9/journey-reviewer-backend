module.exports = {
  env: {
    browser: true,
    node: true,
    es2016: true,
  },
  extends: ['airbnb-base', 'prettier', 'airbnb-typescript/base'],
  parserOptions: {
    project: './tsconfig.eslint.json',
  },
};
