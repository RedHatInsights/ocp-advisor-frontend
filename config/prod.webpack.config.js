const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const TerserPlugin = require('terser-webpack-plugin');

const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  ...(process.env.BETA && { deployment: 'beta/apps' }),
  debug: true,
  sassPrefix: '.ocp-advisor, .ocpAdvisor',
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      exposes: {
        './RootApp': resolve(__dirname, '../src/AppEntry'),
      },
    }
  )
);

module.exports = function (env) {
  if (env && env.analyze === 'true') {
    plugins.push(new BundleAnalyzerPlugin());
  }
  return {
    ...webpackConfig,
    plugins,
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin()],
    },
  };
};
