const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const webpack = require('webpack');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
});

module.exports = {
  ...webpackConfig,
  plugins: [
    ...plugins,
    new webpack.DefinePlugin({
      IS_DEV: process.env.NODE_ENV !== 'production',
    }),
  ],
  module: {
    ...webpackConfig.module,
    rules: [
      ...webpackConfig.module.rules,
      {
        resolve: {
          alias: {
            '@redhat-cloud-services/frontend-components/useChrome': resolve(
              __dirname,
              './overrideChrome.js'
            ),
          },
        },
      },
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /(node_modules|bower_components)/i,
        use: ['babel-loader'],
      },
    ],
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      zlib: require.resolve('browserify-zlib'),
    },
  },
};
