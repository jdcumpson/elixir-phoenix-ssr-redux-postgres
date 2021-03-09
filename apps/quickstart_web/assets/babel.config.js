function isWebTarget(caller) {
  return Boolean(caller && caller.target === 'web')
}

function isWebpack(caller) {
  return Boolean(caller && caller.name === 'babel-loader')
}

function isNode(caller) {
  return Boolean(caller && caller.target === 'node')
}

module.exports = (api) => {
  const web = api.caller(isWebTarget)
  const webpack = api.caller(isWebpack)

  const plugins = [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        root: ['./src/'],
      },
    ],
    '@babel/plugin-syntax-dynamic-import',
    '@loadable/babel-plugin',
    'css-modules-transform',
  ]

  if (!api.caller(isNode) && process.env.RELEASE_ENV !== 'prod') {
    plugins.push('react-refresh/babel')
  }

  if (!api.caller(isNode)) {
    plugins.push([
      '@babel/plugin-transform-runtime',
      {corejs: 3, regenerator: true},
    ])
  }

  return {
    presets: [
      '@babel/preset-react',
      [
        '@babel/preset-env',
        {
          useBuiltIns: web ? 'usage' : undefined,
          corejs: web ? 'core-js@3' : false,
          targets: !web ? {node: 'current'} : {browsers: 'cover 90% in US'},
          modules: webpack ? false : 'commonjs',
        },
      ],
    ],
    plugins: plugins,
  }
}
