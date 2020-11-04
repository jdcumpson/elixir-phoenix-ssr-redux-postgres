const CSS_SCOPE_NAME = '[name][hash:base64:5]__[local]___[hash:base64:5]'

module.exports = {
  config: {
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: 'usage',
          // see: https://github.com/facebook/jest/issues/3202
          modules: process.env.NODE_ENV === 'test' ? 'commonjs' : false,
          corejs: 3,
        },
      ],
      ['@babel/preset-react', {development: false}],
    ],
    plugins: [
      'transform-class-properties',
      '@babel/plugin-transform-runtime',
      // 'lodash',
    ],
  },
  CSS_SCOPE_NAME,
}
