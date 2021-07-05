const { resolve } = require('path');
const config = require('@redhat-cloud-services/frontend-components-config');
const { config: webpackConfig, plugins } = config({
  rootFolder: resolve(__dirname, '../'),
  debug: true,
  https: true,
  appUrl: '/openshift/insights/advisor',
  deployment: process.env.BETA ? 'beta/apps' : 'apps',
  useProxy: process.env.API_ENDPOINT ? true : false,
  customProxy: process.env.API_ENDPOINT
    ? [
        {
          context: ['/api'],
          target: process.env.API_ENDPOINT,
          secure: true,
          changeOrigin: true,
        },
      ]
    : [],
});

plugins.push(
  require('@redhat-cloud-services/frontend-components-config/federated-modules')(
    {
      root: resolve(__dirname, '../'),
      useFileHash: false,
      exposes: {
        './RootApp': resolve(__dirname, '../src/DevEntry'),
      },
    }
  )
);

module.exports = {
  ...webpackConfig,
  plugins,
};
