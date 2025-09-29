const webpack = require('webpack');
const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');

const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  sassPrefix: '.ocp-advisor, .ocpAdvisor',
});

plugins.push(
  new webpack.DefinePlugin({ insights: { chrome: { isProd: false } } }),
);

// required to mock the chrome functionss
webpackConfig.module.rules.push({
  resolve: {
    alias: {
      '@redhat-cloud-services/frontend-components/useChrome': resolve(
        __dirname,
        './overrideChrome.js',
      ),
    },
  },
});

webpackConfig.module.rules.push({
  test: /cypress\/.*\.js$/,
  exclude: /(node_modules|bower_components)/i,
  use: ['babel-loader'],
});

module.exports = {
  ...webpackConfig,
  plugins,
  module: {
    ...webpackConfig.module,
    rules: [
      ...webpackConfig.module.rules,
      {
        test: /\.(?:js|mjs|cjs)$/,
        exclude: /(node_modules|bower_components)/i,
        use: ['babel-loader'],
      },
    ],
  },
};
